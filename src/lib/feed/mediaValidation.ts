export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_VIDEO_DURATION_MS = 30_000;
export const MAX_CAPTION = 150;

export type PostMediaKind = "image" | "video";
export type MediaValidation = { ok: true; kind: PostMediaKind } | { ok: false; error: string };

export function validateMediaFile(file: { type: string; size: number }): MediaValidation {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) return { ok: false, error: "Only photos and video clips are allowed." };
  if (isImage && file.size > MAX_IMAGE_BYTES)
    return { ok: false, error: "Image must be under 8MB." };
  if (isVideo && file.size > MAX_VIDEO_BYTES)
    return { ok: false, error: "Clip must be under 50MB." };
  return { ok: true, kind: isImage ? "image" : "video" };
}

export function validateCaption(text: string): { ok: true } | { ok: false; error: string } {
  if (text.trim().length > MAX_CAPTION)
    return { ok: false, error: `Caption must be under ${MAX_CAPTION} characters.` };
  return { ok: true };
}

export function getVideoDurationMs(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round((v.duration || 0) * 1000));
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the video file."));
    };
    v.src = url;
  });
}
