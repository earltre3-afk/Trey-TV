import { requestFreeTvProvider } from "../../../../lib/free-tv/serverClient";
import { handleFreeTvRouteError, jsonOk } from "../../../../lib/free-tv/routeHelpers";

export async function GET() {
  try {
    const data = await requestFreeTvProvider({ path: "channels" });
    return jsonOk(data);
  } catch (error) {
    return handleFreeTvRouteError(error);
  }
}
