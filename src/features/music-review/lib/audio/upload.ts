import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { musicReviewEnv } from "../env";

export const ALLOWED_AUDIO = [
  "audio/mpeg",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/aac",
  "audio/x-m4a",
];
export const ALLOWED_IMG = ["image/png", "image/jpeg", "image/webp"];
export const MAX_AUDIO_MB = 25;
export const MAX_DURATION_SEC = 420;

const PRIVATE_AUDIO_BUCKETS = new Set(["music-review-audio", "open-mic-temp-audio"]);

export interface UploadResult {
  path: string;
  publicUrl: string;
  size: number;
  duration: number;
}

export function validateAudio(file: File): string | null {
  if (!ALLOWED_AUDIO.includes(file.type) && !/\.(mp3|wav|m4a|aac)$/i.test(file.name)) {
    return "Unsupported audio format. Use MP3, WAV, M4A, or AAC.";
  }
  if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
    return `File too large. Max ${MAX_AUDIO_MB}MB.`;
  }
  return null;
}

export function probeDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("audio");
    a.preload = "metadata";
    a.onloadedmetadata = () => {
      const d = a.duration || 0;
      URL.revokeObjectURL(url);
      resolve(d);
    };
    a.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    a.src = url;
  });
}

export async function uploadFile(
  bucket: string,
  file: File,
  userId: string,
): Promise<UploadResult> {
  const ext = file.name.split(".").pop() || "bin";
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: PRIVATE_AUDIO_BUCKETS.has(bucket) ? "60" : "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const duration =
    file.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac)$/i.test(file.name)
      ? await probeDuration(file)
      : 0;

  return {
    path,
    // Keep the field for compatibility. Audio buckets should use signed URLs.
    publicUrl: PRIVATE_AUDIO_BUCKETS.has(bucket)
      ? ""
      : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl,
    size: file.size,
    duration: Math.round(duration),
  };
}

export function getPublicUrl(bucket: string, path?: string | null): string | undefined {
  if (!path) return undefined;
  if (PRIVATE_AUDIO_BUCKETS.has(bucket) && !musicReviewEnv.allowPublicAudioFallback) {
    console.warn(
      `[Trey TV Music Review] Refused public URL fallback for private audio bucket: ${bucket}`,
    );
    return undefined;
  }
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function getSignedAudioUrl(
  bucket: string,
  path?: string | null,
  expiresInSec: number = 600,
): Promise<string | undefined> {
  if (!path) return undefined;
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSec);
    if (!error && data?.signedUrl) return data.signedUrl;
    if (musicReviewEnv.allowPublicAudioFallback) {
      return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    }
    console.warn(
      `[Trey TV Music Review] Signed URL failed for ${bucket}/${path}. Public fallback is disabled.`,
    );
    return undefined;
  } catch {
    if (musicReviewEnv.allowPublicAudioFallback) {
      return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    }
    return undefined;
  }
}

export function useSignedAudioUrl(bucket: string, path?: string | null, expiresInSec = 600) {
  const [url, setUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const resolve = async () => {
      const u = await getSignedAudioUrl(bucket, path, expiresInSec);
      if (!cancelled) setUrl(u);
      timer = setTimeout(resolve, Math.max(30_000, expiresInSec * 800));
    };
    if (path) resolve();
    else setUrl(undefined);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [bucket, path, expiresInSec]);
  return url;
}
