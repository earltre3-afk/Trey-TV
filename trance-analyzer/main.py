import tempfile
import traceback
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from pose import extract_frames
from storage import download_video, write_result

app = FastAPI()


class AnalyzeRequest(BaseModel):
    gcsPath: str
    jobId: str
    intervalMs: int = 500


def run_analysis(gcs_path: str, job_id: str, interval_ms: int) -> None:
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            tmp_path = tmp.name
        download_video(gcs_path, tmp_path)
        timeline, duration_ms = extract_frames(tmp_path, interval_ms)
        result = {
            "durationMs": duration_ms,
            "sampledFrameCount": len(timeline),
            "targetTimeline": timeline,
            "suggestedCountSections": [],
            "suggestedDirectionCues": [],
            "suggestedMoveHints": [],
            "suggested": True,
            "poseProvider": "cloud-run-mediapipe-pose",
            "poseModelVersion": "mediapipe-pose-legacy-v1",
        }
        write_result(job_id, {"status": "done", "result": result})
    except Exception:
        write_result(job_id, {"status": "failed", "error": traceback.format_exc()[:500]})


@app.post("/analyze", status_code=202)
async def analyze(req: AnalyzeRequest, background_tasks: BackgroundTasks) -> dict:
    background_tasks.add_task(run_analysis, req.gcsPath, req.jobId, req.intervalMs)
    return {"jobId": req.jobId}


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
