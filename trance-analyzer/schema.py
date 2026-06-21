from dataclasses import dataclass, field
from typing import Literal


@dataclass
class PoseLandmark:
    x: float
    y: float
    z: float
    visibility: float
    bodyPart: str
    timestampMs: int


@dataclass
class ChoreographyTargetFrame:
    timestampMs: int
    landmarks: list


@dataclass
class ChoreographyAnalysis:
    durationMs: float
    sampledFrameCount: int
    targetTimeline: list
    suggestedCountSections: list = field(default_factory=list)
    suggestedDirectionCues: list = field(default_factory=list)
    suggestedMoveHints: list = field(default_factory=list)
    suggested: bool = True
    poseProvider: str = "cloud-run-mediapipe-pose"
    poseModelVersion: str = "mediapipe-pose-legacy-v1"
