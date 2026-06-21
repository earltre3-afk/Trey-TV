// Neon compatibility shim — mimics the Supabase JS client query builder API.
// Browser calls route through db-proxy.server.ts (createServerFn HTTP proxy).
// Server calls execute via createServerFn's direct-call path (no HTTP overhead).
import { executeDbQuery } from "./db-proxy.server";
import type { Filter, OrderBy, QuerySpec, QueryResult } from "./db.server";

class QueryBuilder {
  private _spec: QuerySpec;

  constructor(table: string) {
    this._spec = { table, op: "select" };
  }

  select(cols: string = "*", opts?: { count?: "exact"; head?: boolean }) {
    this._spec.op = "select";
    this._spec.cols = cols;
    if (opts?.count === "exact") this._spec.countMode = !!opts.head;
    return this;
  }

  insert(data: any) { this._spec.op = "insert"; this._spec.data = data; return this; }
  update(data: any) { this._spec.op = "update"; this._spec.data = data; return this; }
  upsert(data: any) { this._spec.op = "upsert"; this._spec.data = data; return this; }
  delete() { this._spec.op = "delete"; return this; }

  eq(col: string, val: any) { (this._spec.filters ??= []).push({ col, op: "eq", val }); return this; }
  neq(col: string, val: any) { (this._spec.filters ??= []).push({ col, op: "neq", val }); return this; }
  in(col: string, val: any[]) { (this._spec.filters ??= []).push({ col, op: "in", val }); return this; }
  is(col: string, val: null) { (this._spec.filters ??= []).push({ col, op: "is", val }); return this; }
  gte(col: string, val: any) { (this._spec.filters ??= []).push({ col, op: "gte", val }); return this; }
  gt(col: string, val: any) { (this._spec.filters ??= []).push({ col, op: "gt", val }); return this; }
  lte(col: string, val: any) { (this._spec.filters ??= []).push({ col, op: "lte", val }); return this; }
  lt(col: string, val: any) { (this._spec.filters ??= []).push({ col, op: "lt", val }); return this; }
  ilike(col: string, val: string) { (this._spec.filters ??= []).push({ col, op: "ilike", val }); return this; }
  like(col: string, val: string) { (this._spec.filters ??= []).push({ col, op: "like", val }); return this; }
  or(filterStr: string) { (this._spec.ors ??= []).push(filterStr); return this; }

  order(col: string, opts?: { ascending?: boolean }) {
    (this._spec.orders ??= []).push({ col, ascending: opts?.ascending !== false });
    return this;
  }

  limit(n: number) { this._spec.limit = n; return this; }
  range(from: number, to: number) { this._spec.limit = to - from + 1; return this; }

  // Terminators — return Promise<{data, error}> directly
  single(): Promise<QueryResult> { this._spec.single = true; return this._run(); }
  maybeSingle(): Promise<QueryResult> { this._spec.maybeSingle = true; return this._run(); }

  // Allow `await db.from(...).select(...)` without .single()
  then(resolve: (v: QueryResult) => void, reject: (e: any) => void) {
    this._run().then(resolve, reject);
  }

  private _run(): Promise<QueryResult> {
    return executeDbQuery({ data: this._spec });
  }
}

class RpcBuilder {
  private _fn: string;
  private _params: any;

  constructor(fn: string, params?: any) {
    this._fn = fn;
    this._params = params;
  }

  then(resolve: (v: QueryResult) => void, reject: (e: any) => void) {
    this._run().then(resolve, reject);
  }

  private _run(): Promise<QueryResult> {
    return executeDbQuery({ data: { table: `__rpc__${this._fn}`, op: "rpc", data: this._params } });
  }
}

export const db = {
  from: (table: string) => new QueryBuilder(table) as any,
  rpc: (fn: string, params?: Record<string, any>) => new RpcBuilder(fn, params) as any,
};

// Re-export for files that need the Supabase-style named export
export { db as supabase };

export const isDbConfigured = true;
export const isSupabaseConfigured = true;
export const hasSupabaseConfig = true;
export function requireSupabaseConfig() { return true; }
