import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseSession } from "@/lib/supabase-session";
import {
  checkFwdStatus,
  getFwdGifLibrary,
  captureFwdGif,
  saveFwdGif,
  markFwdGifUsed,
  removeFwdGif,
  type FwdGifItem,
  type FwdGifLibraryTab,
} from "@/lib/fwd-gif-api.server";

export type { FwdGifItem, FwdGifLibraryTab };

export function useFwdConnectionStatus() {
  const { session } = useSupabaseSession();
  const accessToken = session?.access_token ?? null;

  return useQuery({
    queryKey: ["fwd-connection-status", accessToken],
    queryFn: async () => {
      if (!accessToken) return { ok: true as const, connected: false, treyTvUid: null };
      return checkFwdStatus({ data: { accessToken } });
    },
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}

export function useFwdGifLibrary(tab: FwdGifLibraryTab, limit = 48, offset = 0, query = "") {
  const { session } = useSupabaseSession();
  const accessToken = session?.access_token ?? null;

  return useQuery({
    queryKey: ["fwd-gif-library", tab, limit, offset, query, accessToken],
    queryFn: async () => {
      if (!accessToken) return { ok: false as const, error: "Not signed in." };
      return getFwdGifLibrary({ data: { accessToken, tab, limit, offset, query } });
    },
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}

type CaptureArgs = {
  gif_url: string;
  gif_id?: string | null;
  preview_url?: string | null;
  poster_url?: string | null;
  mp4_url?: string | null;
  title?: string | null;
  provider?: string | null;
  provider_gif_id?: string | null;
  width?: number | null;
  height?: number | null;
};

export function useCaptureFwdGif() {
  const { session } = useSupabaseSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CaptureArgs) => {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Not signed in.");
      return captureFwdGif({ data: { accessToken, ...input } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fwd-gif-library", "recent"] });
    },
  });
}

export function useSaveFwdGif() {
  const { session } = useSupabaseSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Not signed in.");
      return saveFwdGif({ data: { accessToken, id } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fwd-gif-library"] });
    },
  });
}

export function useMarkFwdGifUsed() {
  const { session } = useSupabaseSession();

  return useMutation({
    mutationFn: async (input: { id?: string | null; gif_url?: string | null }) => {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Not signed in.");
      return markFwdGifUsed({ data: { accessToken, ...input } });
    },
  });
}

export function useRemoveFwdGif() {
  const { session } = useSupabaseSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Not signed in.");
      return removeFwdGif({ data: { accessToken, id } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fwd-gif-library"] });
    },
  });
}
