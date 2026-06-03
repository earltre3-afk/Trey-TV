import { supabase } from "@/lib/supabase";
import { UploadAsset } from "../types";
import { assertConfigured, shouldUseFixtures } from "./config";

export const tranceVideoUploadService = {
  uploadRoutineVideo: async (
    file: File,
    onProgress?: (progressPct: number) => void,
  ): Promise<UploadAsset> => {
    assertConfigured("VideoUploadService");
    const assetId = `as-${Math.random().toString(36).substr(2, 9)}`;
    const mockAsset: UploadAsset = {
      id: assetId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      url: `mock://routines/${assetId}/${file.name}`,
      ownerId: "u001",
      createdAt: new Date().toISOString(),
    };

    const enableUploads = import.meta.env.VITE_TRANCE_ENABLE_UPLOADS === "true";
    if (!enableUploads && shouldUseFixtures()) {
      console.warn(
        "[Video Upload] Uploads disabled by environment variables. Using fixture response.",
      );
      if (onProgress) onProgress(100);
      return mockAsset;
    }

    if (shouldUseFixtures()) {
      console.log("[Dev Mode] Uploading file locally:", file.name);
      if (onProgress) {
        let pct = 0;
        const interval = setInterval(() => {
          pct += 25;
          onProgress(pct);
          if (pct >= 100) clearInterval(interval);
        }, 150);
      }
      return mockAsset;
    }

    const filePath = `routines/${Date.now()}_${file.name}`;

    // Real upload to Supabase storage bucket
    const { data, error } = await supabase.storage
      .from("trance-routine-videos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;
    if (onProgress) onProgress(100);

    const { data: publicUrlData } = supabase.storage
      .from("trance-routine-videos")
      .getPublicUrl(data.path);

    const authUser = await supabase.auth.getUser();

    return {
      id: assetId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      url: publicUrlData.publicUrl,
      ownerId: authUser.data.user?.id || "guest",
      createdAt: new Date().toISOString(),
    };
  },

  getUploadProgress: (): number => {
    return 100;
  },
};
