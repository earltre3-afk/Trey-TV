import { NextResponse } from "next/server";
import { FreeTvConfigurationError, FreeTvProviderError } from "./serverClient";

export function jsonOk(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function handleFreeTvRouteError(error: unknown): NextResponse {
  if (error instanceof FreeTvConfigurationError) {
    return jsonError(error.message, 503);
  }

  if (error instanceof FreeTvProviderError) {
    return jsonError("Free TV provider is temporarily unavailable.", 502);
  }

  return jsonError("Free TV request failed.", 500);
}

export function requiredSearchParam(request: Request, key: string): string | null {
  const value = new URL(request.url).searchParams.get(key);
  return value && value.trim().length > 0 ? value : null;
}
