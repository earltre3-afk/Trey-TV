import { requestFreeTvProvider } from "../../../../../lib/free-tv/serverClient";
import { handleFreeTvRouteError, jsonError, jsonOk } from "../../../../../lib/free-tv/routeHelpers";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;

  if (!params.id) {
    return jsonError("Missing channel id.", 400);
  }

  try {
    const data = await requestFreeTvProvider({ path: `channels/${encodeURIComponent(params.id)}` });
    return jsonOk(data);
  } catch (error) {
    return handleFreeTvRouteError(error);
  }
}
