import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Smoother navigation: reuse recent data instead of refetching on every
        // mount, and don't refetch on window focus (a common source of flicker).
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Preload a route's code (and loaders) on hover/touch so clicking a link
    // navigates instantly instead of waiting on a lazy chunk fetch.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
