import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

if (typeof window !== "undefined" && window.parent !== window) {
  let cachedFetch: typeof fetch | undefined;
  const originalFetch = window.fetch;

  window.fetch = function(...args) {
    if (cachedFetch) {
      return cachedFetch(...args);
    }
    if (document.body) {
      try {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        const nativeFetch = iframe.contentWindow?.fetch;
        document.body.removeChild(iframe);
        if (nativeFetch) {
          cachedFetch = nativeFetch.bind(window);
          return cachedFetch(...args);
        }
      } catch (e) {
        console.warn("Failed to load iframe fetch, falling back:", e);
      }
    }
    return originalFetch(...args);
  } as any;
}

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
