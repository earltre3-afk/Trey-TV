import json
from google.cloud import storage as gcs

BUCKET_NAME = "trance-media"


def download_video(gcs_path: str, local_path: str) -> None:
    client = gcs.Client()
    blob = client.bucket(BUCKET_NAME).blob(gcs_path)
    blob.download_to_filename(local_path)


def write_result(job_id: str, payload: dict) -> None:
    client = gcs.Client()
    blob = client.bucket(BUCKET_NAME).blob(f"results/{job_id}.json")
    blob.upload_from_string(
        json.dumps(payload),
        content_type="application/json",
    )
