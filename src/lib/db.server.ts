// Neon SQL execution engine. Server-only — never imported directly by browser code.
// Called via db-proxy.server.ts (createServerFn) or directly from .server.ts files.
import { neon } from "@neondatabase/serverless";

export interface Filter {
  col: string;
  op: "eq" | "neq" | "in" | "is" | "gte" | "gt" | "lte" | "lt" | "ilike" | "like";
  val: any;
}

export interface OrderBy {
  col: string;
  ascending: boolean;
}

export interface QuerySpec {
  table: string;
  op: "select" | "insert" | "update" | "delete" | "upsert" | "rpc";
  cols?: string;
  data?: any;
  filters?: Filter[];
  ors?: string[];
  orders?: OrderBy[];
  limit?: number | null;
  single?: boolean;
  maybeSingle?: boolean;
  countMode?: boolean;
}

export interface QueryResult {
  data: any;
  error: any;
  count?: number | null;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

function buildWhere(filters: Filter[] = [], ors: string[] = [], params: any[]): string {
  const clauses: string[] = [];

  for (const f of filters) {
    const i = params.length + 1;
    if (f.op === "eq") { params.push(f.val); clauses.push(`"${f.col}" = $${i}`); }
    else if (f.op === "neq") { params.push(f.val); clauses.push(`"${f.col}" != $${i}`); }
    else if (f.op === "gte") { params.push(f.val); clauses.push(`"${f.col}" >= $${i}`); }
    else if (f.op === "gt") { params.push(f.val); clauses.push(`"${f.col}" > $${i}`); }
    else if (f.op === "lte") { params.push(f.val); clauses.push(`"${f.col}" <= $${i}`); }
    else if (f.op === "lt") { params.push(f.val); clauses.push(`"${f.col}" < $${i}`); }
    else if (f.op === "ilike") { params.push(f.val); clauses.push(`"${f.col}" ILIKE $${i}`); }
    else if (f.op === "like") { params.push(f.val); clauses.push(`"${f.col}" LIKE $${i}`); }
    else if (f.op === "is") { clauses.push(f.val === null ? `"${f.col}" IS NULL` : `"${f.col}" IS NOT NULL`); }
    else if (f.op === "in") {
      if (!Array.isArray(f.val) || f.val.length === 0) {
        clauses.push("FALSE");
      } else {
        const placeholders = f.val.map((v: any) => { params.push(v); return `$${params.length}`; });
        clauses.push(`"${f.col}" IN (${placeholders.join(", ")})`);
      }
    }
  }

  for (const orStr of ors) {
    // Parse "col.op.val,col.op.val" PostgREST OR syntax
    const parts = orStr.split(",").map((part) => {
      const dotIdx = part.indexOf(".");
      const col = part.slice(0, dotIdx);
      const rest = part.slice(dotIdx + 1);
      const opDotIdx = rest.indexOf(".");
      const op = rest.slice(0, opDotIdx);
      const val = rest.slice(opDotIdx + 1);
      const i = params.length + 1;
      params.push(val);
      if (op === "ilike") return `"${col}" ILIKE $${i}`;
      if (op === "like") return `"${col}" LIKE $${i}`;
      if (op === "eq") return `"${col}" = $${i}`;
      params.pop();
      return `"${col}" ILIKE $${i}`;
    });
    clauses.push(`(${parts.join(" OR ")})`);
  }

  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
}

function buildInsertCols(data: Record<string, any>): { cols: string; placeholders: string; vals: any[] } {
  const keys = Object.keys(data);
  const vals: any[] = [];
  const placeholders = keys.map((k) => { vals.push(data[k]); return `$${vals.length}`; });
  return {
    cols: keys.map((k) => `"${k}"`).join(", "),
    placeholders: placeholders.join(", "),
    vals,
  };
}

function buildSetClause(data: Record<string, any>, params: any[]): string {
  return Object.keys(data)
    .map((k) => { params.push(data[k]); return `"${k}" = $${params.length}`; })
    .join(", ");
}

export async function executeSpec(spec: QuerySpec): Promise<QueryResult> {
  const sql = getSql();
  const params: any[] = [];

  try {
    if (spec.op === "rpc") {
      const fn = spec.table.replace(/^__rpc__/, "");
      const args = spec.data ?? {};
      const keys = Object.keys(args);
      const argStr = keys.map((k) => { params.push(args[k]); return `${k} => $${params.length}`; }).join(", ");
      const query = `SELECT * FROM ${fn}(${argStr})`;
      const rows = await sql(query, params);
      return { data: rows.length === 1 ? rows[0] : rows, error: null };
    }

    if (spec.op === "select") {
      const cols = spec.cols || "*";
      const where = buildWhere(spec.filters, spec.ors, params);
      const orderParts = (spec.orders || []).map((o) => `"${o.col}" ${o.ascending ? "ASC" : "DESC"}`);
      const orderStr = orderParts.length ? `ORDER BY ${orderParts.join(", ")}` : "";
      const limitStr = spec.limit ? `LIMIT ${spec.limit}` : "";

      if (spec.countMode) {
        const countQuery = `SELECT COUNT(*) FROM "${spec.table}" ${where}`;
        const rows = await sql(countQuery, params);
        return { data: null, error: null, count: Number(rows[0]?.count ?? 0) };
      }

      const query = `SELECT ${cols} FROM "${spec.table}" ${where} ${orderStr} ${limitStr}`.trim();
      const rows = await sql(query, params);

      if (spec.single) {
        if (rows.length === 0) return { data: null, error: { code: "PGRST116", message: "No rows found" } };
        return { data: rows[0], error: null };
      }
      if (spec.maybeSingle) {
        return { data: rows[0] ?? null, error: null };
      }
      return { data: rows, error: null };
    }

    if (spec.op === "insert") {
      const rows = Array.isArray(spec.data) ? spec.data : [spec.data];
      const results: any[] = [];
      for (const row of rows) {
        const { cols, placeholders, vals } = buildInsertCols(row);
        const query = `INSERT INTO "${spec.table}" (${cols}) VALUES (${placeholders}) RETURNING *`;
        const res = await sql(query, vals);
        results.push(...res);
      }
      if (spec.single) return { data: results[0] ?? null, error: null };
      if (spec.maybeSingle) return { data: results[0] ?? null, error: null };
      return { data: Array.isArray(spec.data) ? results : results[0] ?? null, error: null };
    }

    if (spec.op === "upsert") {
      const rows = Array.isArray(spec.data) ? spec.data : [spec.data];
      const results: any[] = [];
      for (const row of rows) {
        const { cols, placeholders, vals } = buildInsertCols(row);
        const keys = Object.keys(row).filter((k) => k !== "id");
        const updateSet = keys.map((k, i) => `"${k}" = EXCLUDED."${k}"`).join(", ");
        const query = `INSERT INTO "${spec.table}" (${cols}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updateSet} RETURNING *`;
        const res = await sql(query, vals);
        results.push(...res);
      }
      return { data: Array.isArray(spec.data) ? results : results[0] ?? null, error: null };
    }

    if (spec.op === "update") {
      const where = buildWhere(spec.filters, spec.ors, params);
      const setClause = buildSetClause(spec.data, params);
      const query = `UPDATE "${spec.table}" SET ${setClause} ${where} RETURNING *`.trim();
      const rows = await sql(query, params);
      return { data: rows, error: null };
    }

    if (spec.op === "delete") {
      const where = buildWhere(spec.filters, spec.ors, params);
      const query = `DELETE FROM "${spec.table}" ${where}`.trim();
      await sql(query, params);
      return { data: null, error: null };
    }

    return { data: null, error: { message: `Unknown op: ${(spec as any).op}` } };
  } catch (err: any) {
    return { data: null, error: { message: err?.message ?? String(err), code: err?.code } };
  }
}

// Raw SQL helper for queries the QueryBuilder can't express (e.g. JOIN selects)
export async function executeSql(query: string, params: any[] = []): Promise<any[]> {
  const sql = getSql();
  return sql(query, params);
}
