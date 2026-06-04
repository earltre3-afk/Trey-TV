let tradioWarmup: Promise<void> | null = null;

export function preloadTradioModule() {
  if (typeof window === "undefined") return Promise.resolve();

  tradioWarmup ??= Promise.all([
    import("@/routes/tradio"),
    import("@/tradio/components/tradio/Shell"),
    import("@/tradio/components/tradio/screens/Home"),
  ])
    .then(() => undefined)
    .catch((error) => {
      tradioWarmup = null;
      if (import.meta.env.DEV) {
        console.warn("[Tradio] preload failed", error);
      }
    });

  return tradioWarmup;
}
