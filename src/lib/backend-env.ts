export type SupabasePublicEnv = {
  anonKey: string;
  source: "vite" | "next-public";
  url: string;
};

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const viteUrl = import.meta.env.VITE_SUPABASE_URL;
  const viteAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (viteUrl && viteAnonKey) {
    return { url: viteUrl, anonKey: viteAnonKey, source: "vite" };
  }

  // Fallback for Next.js environments if this code is ever shared
  const nextUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const nextAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (nextUrl && nextAnonKey) {
    return { url: nextUrl, anonKey: nextAnonKey, source: "next-public" };
  }

  return null;
}

export function hasSupabasePublicEnv() {
  return Boolean(getSupabasePublicEnv());
}
