import { createBrowserClient } from "@/lib/supabase-browser";

const extFromFile = (file: File | Blob, fallback: string) => {
  if ("name" in file && file.name.includes(".")) {
    return file.name.split(".").pop()?.toLowerCase() || fallback;
  }
  const subtype = file.type.split("/")[1]?.split(";")[0]?.toLowerCase();
  if (!subtype) return fallback;
  if (subtype === "jpeg") return "jpg";
  return subtype;
};

const safePart = (value: string) => value.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();

export async function uploadProfileMedia(userId: string, file: File, kind: "avatar" | "banner") {
  const supabase = createBrowserClient();
  const ext = extFromFile(file, kind === "avatar" ? "jpg" : "webp");
  const path = `${userId}/${kind}-${Date.now()}-${safePart(file.name || "upload")}.${ext}`;
  const { error } = await supabase.storage.from("profile-media").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("profile-media").getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function uploadMessageMedia(userId: string, file: File | Blob, kind: "media" | "voice") {
  const supabase = createBrowserClient();
  const ext = extFromFile(file, kind === "voice" ? "webm" : "bin");
  const path = `${userId}/${kind}-${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("message-media").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) throw error;
  return path;
}

export async function createMessageMediaUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return undefined;
  if (/^(https?:|blob:|data:)/i.test(pathOrUrl)) return pathOrUrl;

  const supabase = createBrowserClient();
  const { data, error } = await supabase.storage.from("message-media").createSignedUrl(pathOrUrl, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}
