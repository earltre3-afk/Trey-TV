import { createServerFn } from "@tanstack/react-start";
import type { ChoreographyAnalysis } from "@/trance/types";

const BUCKET = "trance-media";

// ── Signed URL for direct client-to-GCS upload ──────────────────────────────

type GcsUploadUrlInput = { routineId: string; filename: string; contentType: string };
type GcsUploadUrlResult = { uploadUrl: string; gcsPath: string; jobId: string };

const validateUploadInput = (input: GcsUploadUrlInput): GcsUploadUrlInput => ({
  routineId: String(input?.routineId ?? ""),
  filename: String(input?.filename ?? ""),
  contentType: String(input?.contentType ?? ""),
});

export const gcsGetUploadUrl = createServerFn({ method: "POST" })
  .inputValidator(validateUploadInput)
  .handler(async ({ data }): Promise<GcsUploadUrlResult> => {
    const { Storage } = await import("@google-cloud/storage");
    const jobId = crypto.randomUUID();
    const gcsPath = `videos/${data.routineId}/${jobId}/${data.filename}`;
    const storage = new Storage();
    const [uploadUrl] = await storage.bucket(BUCKET).file(gcsPath).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: data.contentType,
    });
    return { uploadUrl, gcsPath, jobId };
  });

// ── Trigger Cloud Run async analysis job ────────────────────────────────────

type AnalyzeStartInput = { gcsPath: string; jobId: string; intervalMs?: number };

const validateAnalyzeStartInput = (input: AnalyzeStartInput): AnalyzeStartInput => ({
  gcsPath: String(input?.gcsPath ?? ""),
  jobId: String(input?.jobId ?? ""),
  intervalMs: typeof input?.intervalMs === "number" ? input.intervalMs : 500,
});

export const gcsAnalyzeStart = createServerFn({ method: "POST" })
  .inputValidator(validateAnalyzeStartInput)
  .handler(async ({ data }): Promise<{ jobId: string }> => {
    const { Storage } = await import("@google-cloud/storage");
    const { GoogleAuth } = await import("google-auth-library");

    const cloudRunUrl = process.env.CLOUD_RUN_ANALYZE_URL;
    if (!cloudRunUrl) throw new Error("CLOUD_RUN_ANALYZE_URL is not configured");

    const storage = new Storage();

    // Write pending status before calling Cloud Run so polling never sees a gap.
    await storage
      .bucket(BUCKET)
      .file(`results/${data.jobId}.json`)
      .save(JSON.stringify({ status: "pending" }), { contentType: "application/json" });

    try {
      const auth = new GoogleAuth();
      const client = await auth.getIdTokenClient(cloudRunUrl);
      const res = await client.request({
        url: `${cloudRunUrl}/analyze`,
        method: "POST",
        data: { gcsPath: data.gcsPath, jobId: data.jobId, intervalMs: data.intervalMs },
      });
      if ((res.status as number) !== 202) {
        throw new Error(`Cloud Run returned ${res.status}`);
      }
    } catch (err) {
      // If Cloud Run is unreachable, write failed status immediately.
      await storage
        .bucket(BUCKET)
        .file(`results/${data.jobId}.json`)
        .save(
          JSON.stringify({
            status: "failed",
            error: err instanceof Error ? err.message : "cloud run unavailable",
          }),
          { contentType: "application/json" },
        );
      throw err;
    }

    return { jobId: data.jobId };
  });

// ── Poll analysis result ─────────────────────────────────────────────────────

type AnalyzeStatusInput = { jobId: string };
type AnalyzeStatusResult =
  | { status: "pending" }
  | { status: "done"; result: ChoreographyAnalysis }
  | { status: "failed"; error: string };

const validateAnalyzeStatusInput = (input: AnalyzeStatusInput): AnalyzeStatusInput => ({
  jobId: String(input?.jobId ?? ""),
});

export const gcsAnalyzeStatus = createServerFn({ method: "GET" })
  .inputValidator(validateAnalyzeStatusInput)
  .handler(async ({ data }): Promise<AnalyzeStatusResult> => {
    const { Storage } = await import("@google-cloud/storage");
    const storage = new Storage();
    try {
      const [contents] = await storage
        .bucket(BUCKET)
        .file(`results/${data.jobId}.json`)
        .download();
      return JSON.parse(contents.toString()) as AnalyzeStatusResult;
    } catch (err: any) {
      if (err?.code === 404) return { status: "pending" };
      throw err;
    }
  });
