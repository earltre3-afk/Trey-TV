import assert from "node:assert/strict";
import { test } from "node:test";
import {
  scoreMoveFrames,
  averageMoveResults,
  assignCalibrationLevel,
  cameraScoreToTrackingQuality,
  type MoveFrameData,
} from "./useCalibrationScoring";

const goodFrame: MoveFrameData = {
  bodyConfidence: 0.85,
  visibleRatio: 0.9,
  lightingOk: true,
  fullBodyInFrame: true,
};

const badFrame: MoveFrameData = {
  bodyConfidence: 0.2,
  visibleRatio: 0.3,
  lightingOk: false,
  fullBodyInFrame: false,
};

test("scoreMoveFrames returns zeros for empty input", () => {
  const result = scoreMoveFrames([]);
  assert.deepEqual(result, { timing: 0, bodyControl: 0, range: 0, camera: 0 });
});

test("scoreMoveFrames scores all-good frames near 100", () => {
  const frames = Array.from({ length: 10 }, () => goodFrame);
  const result = scoreMoveFrames(frames);
  assert.ok(result.bodyControl >= 80, `bodyControl should be >=80, got ${result.bodyControl}`);
  assert.ok(result.range >= 80, `range should be >=80, got ${result.range}`);
  assert.equal(result.camera, 100);
});

test("scoreMoveFrames scores all-bad frames near 0", () => {
  const frames = Array.from({ length: 10 }, () => badFrame);
  const result = scoreMoveFrames(frames);
  assert.ok(result.bodyControl < 30, `bodyControl should be <30, got ${result.bodyControl}`);
  assert.equal(result.camera, 0);
});

test("averageMoveResults averages correctly", () => {
  const results = [
    { timing: 80, bodyControl: 60, range: 70, camera: 90 },
    { timing: 60, bodyControl: 80, range: 50, camera: 70 },
  ];
  const avg = averageMoveResults(results);
  assert.equal(avg.timing, 70);
  assert.equal(avg.bodyControl, 70);
  assert.equal(avg.range, 60);
  assert.equal(avg.camera, 80);
});

test("averageMoveResults returns zeros for empty input", () => {
  assert.deepEqual(averageMoveResults([]), { timing: 0, bodyControl: 0, range: 0, camera: 0 });
});

test("assignCalibrationLevel: advanced downgrade below 0.55", () => {
  assert.equal(assignCalibrationLevel("advanced", 0.5), "intermediate");
});

test("assignCalibrationLevel: advanced no downgrade above 0.55", () => {
  assert.equal(assignCalibrationLevel("advanced", 0.6), "advanced");
});

test("assignCalibrationLevel: beginner upgrade above 0.75", () => {
  assert.equal(assignCalibrationLevel("beginner", 0.8), "intermediate");
});

test("assignCalibrationLevel: beginner no upgrade below 0.75", () => {
  assert.equal(assignCalibrationLevel("beginner", 0.7), "beginner");
});

test("assignCalibrationLevel: intermediate always stays intermediate", () => {
  assert.equal(assignCalibrationLevel("intermediate", 0.1), "intermediate");
  assert.equal(assignCalibrationLevel("intermediate", 0.99), "intermediate");
});

test("cameraScoreToTrackingQuality maps correctly", () => {
  assert.equal(cameraScoreToTrackingQuality(0), "poor");
  assert.equal(cameraScoreToTrackingQuality(49), "poor");
  assert.equal(cameraScoreToTrackingQuality(50), "ok");
  assert.equal(cameraScoreToTrackingQuality(69), "ok");
  assert.equal(cameraScoreToTrackingQuality(70), "good");
  assert.equal(cameraScoreToTrackingQuality(84), "good");
  assert.equal(cameraScoreToTrackingQuality(85), "excellent");
  assert.equal(cameraScoreToTrackingQuality(100), "excellent");
});
