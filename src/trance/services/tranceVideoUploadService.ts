import { shouldUseFixtures } from "./config";
import { gcsGetUploadUrl } from "@/lib/trance/gcs.server";

export const tranceVideoUploadService = {
  uploadChoreographyVideo: async (
    file: File,
    routineId: string,
    onProgress?: (pct: number) => void,
  ): Promise<{ jobId: string; gcsPath: string }> => {
    if (shouldUseFixtures()) {
      onProgress?.(100);
      return { jobId: `mock-job-${Date.now()}`, gcsPath: `videos/mock/${routineId}/${file.name}` };
    }

    // 1. Get a v4 signed URL from the server function (no Supabase involved).
    const { uploadUrl, gcsPath, jobId } = await gcsGetUploadUrl({
      data: { routineId, filename: file.name, contentType: file.type || "video/mp4" },
    });

    // 2. PUT directly to GCS — large file, never touches Vercel.
    onProgress?.(5);
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "video/mp4" },
      body: file,
    });
    if (!res.ok) throw new Error(`GCS upload failed: ${res.status} ${res.statusText}`);
    onProgress?.(100);

    return { jobId, gcsPath };
  },
};
