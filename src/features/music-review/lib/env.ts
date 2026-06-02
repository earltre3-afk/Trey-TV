export const musicReviewEnv = {
  demoAuthEnabled:
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_MUSIC_REVIEW_DEMO_AUTH === "true",
  allowPublicAudioFallback:
    import.meta.env.DEV || import.meta.env.VITE_ALLOW_PUBLIC_AUDIO_FALLBACK === "true",
  cashAppCashtag:
    (import.meta.env.VITE_CASHAPP_CASHTAG as string | undefined)?.replace(/^\$/, "") || "",
  cashAppQrPath:
    (import.meta.env.VITE_CASHAPP_QR_PATH as string | undefined) ||
    "/assets/payment/cashapp-qr.png",
};
