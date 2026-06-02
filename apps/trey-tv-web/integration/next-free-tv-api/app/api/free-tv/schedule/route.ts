import { requestFreeTvProvider } from "../../../../lib/free-tv/serverClient";
import { handleFreeTvRouteError, jsonError, jsonOk } from "../../../../lib/free-tv/routeHelpers";

function isValidDate(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const country = url.searchParams.get("country") || "US";
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);

  if (!isValidDate(date)) {
    return jsonError("Invalid date. Use YYYY-MM-DD.", 400);
  }

  try {
    const searchParams = new URLSearchParams({ country, date });
    const data = await requestFreeTvProvider({ path: "schedule", searchParams });
    return jsonOk(data);
  } catch (error) {
    return handleFreeTvRouteError(error);
  }
}
