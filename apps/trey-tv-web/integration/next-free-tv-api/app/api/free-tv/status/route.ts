import { getFreeTvConfig, requestFreeTvProvider } from "../../../../lib/free-tv/serverClient";
import { handleFreeTvRouteError, jsonOk } from "../../../../lib/free-tv/routeHelpers";

export async function GET() {
  try {
    const config = getFreeTvConfig();

    try {
      await requestFreeTvProvider({ path: "status" });
      return jsonOk({
        configured: true,
        reachable: true,
        provider: config.provider,
        message: "Free TV provider connected.",
      });
    } catch {
      return jsonOk({
        configured: true,
        reachable: false,
        provider: config.provider,
        message:
          "Free TV provider credentials are set, but the provider did not answer the status check.",
      });
    }
  } catch (error) {
    return handleFreeTvRouteError(error);
  }
}
