// Centralized URL helper for Trey TV.
// Production base: https://tv.treytrizzy.com
// Auth server base: https://tv.treytrizzy.com/api/auth

const isDev =
  typeof import.meta !== "undefined" &&
  typeof (import.meta as unknown as Record<string, unknown>).env !== "undefined" &&
  (import.meta.env as Record<string, unknown>).DEV === true;

function resolveSiteUrl(): string {
  const configured =
    (import.meta.env.NEXT_PUBLIC_SITE_URL as string | undefined) ||
    (import.meta.env.VITE_SITE_URL as string | undefined);
  if (configured) return configured.replace(/\/+$/, "");
  return isDev ? "http://localhost:3000" : "https://tv.treytrizzy.com";
}

export const siteUrl = resolveSiteUrl();
export const authBaseUrl = `${siteUrl}/api/auth`;
export const authCallbackUrl = `${siteUrl}/auth/callback`;
export const onboardingUrl = `${siteUrl}/onboarding`;
export const profileUrl = `${siteUrl}/profile`;

export function publicProfileUrl(uid: string): string {
  return `${siteUrl}/u/${uid}`;
}
