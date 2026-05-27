import { requestFreeTvProvider } from '../../../../lib/free-tv/serverClient';
import { handleFreeTvRouteError, jsonError, jsonOk, requiredSearchParam } from '../../../../lib/free-tv/routeHelpers';

export async function GET(request: Request) {
  const query = requiredSearchParam(request, 'q');

  if (!query) {
    return jsonError('Missing search query.', 400);
  }

  try {
    const searchParams = new URLSearchParams({ q: query });
    const data = await requestFreeTvProvider({ path: 'search', searchParams });
    return jsonOk(data);
  } catch (error) {
    return handleFreeTvRouteError(error);
  }
}
