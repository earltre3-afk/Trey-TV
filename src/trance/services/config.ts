import { isSupabaseConfigured as tvSupabaseConfigured } from '@/lib/supabase';

export const isSupabaseConfigured = (): boolean => {
  return tvSupabaseConfigured;
};

export const shouldUseFixtures = (): boolean => {
  return import.meta.env.VITE_TRANCE_USE_FIXTURES === 'true';
};

export const assertConfigured = (serviceName: string): void => {
  if (!isSupabaseConfigured() && !shouldUseFixtures()) {
    throw new Error(
      `TRANCE SERVICE ERROR: Database variables are not configured in your environment for ${serviceName}, ` +
      `and local developer fixtures are disabled (VITE_TRANCE_USE_FIXTURES is not 'true').`
    );
  }
};
