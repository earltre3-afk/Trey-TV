import type { HandoffToken } from "../types";

const EXPIRY_MS = 15 * 60 * 1000;

export function encodeHandoffToken(routineId: string): string {
  const token: HandoffToken = {
    routineId,
    mode: "practice",
    exp: Date.now() + EXPIRY_MS,
  };
  return btoa(JSON.stringify(token))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function decodeHandoffToken(encoded: string): HandoffToken | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (padded.length % 4)) % 4;
    const json = atob(padded + "=".repeat(padding));
    const parsed = JSON.parse(json);
    if (
      typeof parsed.routineId !== "string" ||
      parsed.mode !== "practice" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    return parsed as HandoffToken;
  } catch {
    return null;
  }
}

export function isHandoffTokenExpired(token: HandoffToken): boolean {
  return Date.now() > token.exp;
}
