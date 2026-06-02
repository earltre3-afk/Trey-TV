import { useCallback } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * Returns a function that navigates back to the previous page.
 * Falls back to the provided route (default "/") if there is no
 * history to pop (e.g. user opened the page via deep link).
 */
export function useGoBack(fallback: string = "/") {
  const router = useRouter();
  return useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
      return;
    }
    router.navigate({ to: fallback });
  }, [router, fallback]);
}
