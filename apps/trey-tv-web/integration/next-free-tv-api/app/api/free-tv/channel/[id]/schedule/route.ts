import { requestFreeTvProvider } from "../../../../../../lib/free-tv/serverClient";
import {
  handleFreeTvRouteError,
  jsonError,
  jsonOk,
} from "../../../../../../lib/free-tv/routeHelpers";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(request: Request, context: RouteContext) {
  const params = await context.params;
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);

  if (!params.id) {
    return jsonError("Missing channel id.", 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonError("Invalid date. Use YYYY-MM-DD.", 400);
  }

  try {
    const searchParams = new URLSearchParams({ date });
    const data = await requestFreeTvProvider({
      path: `channels/${encodeURIComponent(params.id)}/schedule`,
      searchParams,
    });
    return jsonOk(data);
  } catch (error) {
    return handleFreeTvRouteError(error);
  }
}
