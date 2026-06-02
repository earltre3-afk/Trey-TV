import { useCallback, useState } from "react";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase-browser";
import { requestDirectUpload, type DirectUploadResponse } from "@/lib/creator-studio/upload.server";

type UseCloudflareUploadReturn = {
  requestUpload: () => Promise<DirectUploadResponse | null>;
  uploadFile: (
    file: File,
    uploadURL: string,
    onProgress?: (pct: number) => void,
  ) => Promise<boolean>;
  uploading: boolean;
  progress: number;
};

function getUploadErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Upload failed";
  if (error.message === "Upload not configured") return "Upload not available";
  return error.message || "Upload failed";
}

export function useCloudflareUpload(): UseCloudflareUploadReturn {
  const [requesting, setRequesting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [progress, setProgress] = useState(0);

  const requestUpload = useCallback(async (): Promise<DirectUploadResponse | null> => {
    setRequesting(true);
    try {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Sign in required");
        return null;
      }

      return await requestDirectUpload({
        data: { accessToken: session.access_token },
      });
    } catch (error) {
      toast.error(getUploadErrorMessage(error));
      return null;
    } finally {
      setRequesting(false);
    }
  }, []);

  const uploadFile = useCallback(
    (file: File, uploadURL: string, onProgress?: (pct: number) => void): Promise<boolean> =>
      new Promise((resolve) => {
        setUploadingFile(true);
        setProgress(0);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadURL);

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const pct = Math.round((event.loaded / event.total) * 100);
          setProgress(pct);
          onProgress?.(pct);
        };

        xhr.onload = () => {
          const ok = xhr.status >= 200 && xhr.status < 300;
          if (ok) {
            setProgress(100);
            onProgress?.(100);
          } else {
            toast.error("Upload failed");
          }
          setUploadingFile(false);
          resolve(ok);
        };

        xhr.onerror = () => {
          toast.error("Upload failed");
          setUploadingFile(false);
          resolve(false);
        };

        xhr.onabort = () => {
          toast.error("Upload cancelled");
          setUploadingFile(false);
          resolve(false);
        };

        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
      }),
    [],
  );

  return {
    requestUpload,
    uploadFile,
    uploading: requesting || uploadingFile,
    progress,
  };
}
