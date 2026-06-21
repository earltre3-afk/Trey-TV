# Mirrors mediapipeLoader.ts INDEX_TO_PART exactly.
# cv2 and mediapipe are imported lazily inside extract_frames so this module
# can be imported for testing INDEX_TO_PART without those heavy packages.
INDEX_TO_PART: dict[int, str] = {
    0:  "nose",
    2:  "left_eye",
    5:  "right_eye",
    7:  "left_ear",
    8:  "right_ear",
    11: "left_shoulder",
    12: "right_shoulder",
    13: "left_elbow",
    14: "right_elbow",
    15: "left_wrist",
    16: "right_wrist",
    23: "left_hip",
    24: "right_hip",
    25: "left_knee",
    26: "right_knee",
    27: "left_ankle",
    28: "right_ankle",
}


def extract_frames(video_path: str, interval_ms: int) -> tuple[list[dict], float]:
    """
    Sample the video at every interval_ms and run MediaPipe Pose (IMAGE mode).
    Returns (timeline, duration_ms) where timeline is a list of ChoreographyTargetFrame dicts.
    """
    import cv2
    import mediapipe as mp

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
    duration_ms = (total_frames / fps) * 1000 if fps > 0 else 0

    pose = mp.solutions.pose.Pose(static_image_mode=True)
    timeline: list[dict] = []

    t = 0.0
    while t < duration_ms:
        cap.set(cv2.CAP_PROP_POS_MSEC, t)
        ret, frame = cap.read()
        if not ret:
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = pose.process(frame_rgb)

        if result.pose_landmarks:
            landmarks = []
            for idx, part_name in INDEX_TO_PART.items():
                lm = result.pose_landmarks.landmark[idx]
                landmarks.append({
                    "x": lm.x,
                    "y": lm.y,
                    "z": lm.z,
                    "visibility": lm.visibility,
                    "bodyPart": part_name,
                    "timestampMs": int(t),
                })
            timeline.append({"timestampMs": int(t), "landmarks": landmarks})

        t += interval_ms

    cap.release()
    pose.close()
    return timeline, duration_ms
