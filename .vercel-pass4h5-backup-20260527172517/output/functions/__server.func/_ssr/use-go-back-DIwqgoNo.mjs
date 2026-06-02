import { r as reactExports } from "../_libs/react.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
function useGoBack(fallback = "/") {
  const router = useRouter();
  return reactExports.useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
      return;
    }
    router.navigate({ to: fallback });
  }, [router, fallback]);
}
export {
  useGoBack as u
};
