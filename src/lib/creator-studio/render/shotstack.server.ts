/**
 * Shotstack HTTP client (server-only). The only place that talks to the
 * Shotstack render API. Reads SHOTSTACK_API_KEY / SHOTSTACK_ENV from the env.
 */
import type { ShotstackEdit } from "./shotstackAdapter";

function host(): string {
  const env = process.env.SHOTSTACK_ENV?.trim().toLowerCase();
  return env === "v1" || env === "production"
    ? "https://api.shotstack.io/edit/v1"
    : "https://api.shotstack.io/edit/stage";
}

const apiKey = () => process.env.SHOTSTACK_API_KEY?.trim() ?? "";

export type ShotstackStatus = "queued" | "fetching" | "rendering" | "saving" | "done" | "failed";

export async function submitShotstackRender(
  edit: ShotstackEdit,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const key = apiKey();
  if (!key) return { ok: false, error: "shotstack_not_configured" };
  try {
    const res = await fetch(`${host()}/render`, {
      method: "POST",
      headers: { "x-api-key": key, "content-type": "application/json" },
      body: JSON.stringify(edit),
    });
    const json = (await res.json().catch(() => null)) as any;
    if (!json?.success) {
      return { ok: false, error: json?.response?.message || json?.message || `http_${res.status}` };
    }
    return { ok: true, id: json.response.id as string };
  } catch (e) {
    return { ok: false, error: (e as Error).message || "submit_failed" };
  }
}

export async function getShotstackStatus(
  id: string,
): Promise<
  | { ok: true; status: ShotstackStatus; url: string | null; error?: string }
  | { ok: false; error: string }
> {
  const key = apiKey();
  if (!key) return { ok: false, error: "shotstack_not_configured" };
  try {
    const res = await fetch(`${host()}/render/${encodeURIComponent(id)}`, {
      headers: { "x-api-key": key },
    });
    const json = (await res.json().catch(() => null)) as any;
    if (!json?.success) return { ok: false, error: json?.message || `http_${res.status}` };
    return {
      ok: true,
      status: json.response.status as ShotstackStatus,
      url: (json.response.url as string) ?? null,
      error: json.response.error,
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message || "status_failed" };
  }
}
