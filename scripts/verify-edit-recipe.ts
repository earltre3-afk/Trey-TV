/* Standalone verification of the EditRecipe pure mutators (no test runner installed). */
import {
  createRecipe,
  splitClip,
  trimClip,
  setSpeed,
  setTransition,
  setFilter,
  toggleEffect,
  addTextClip,
  addAudioClip,
  deleteClip,
  moveClip,
  clipLength,
  recipeDuration,
  findClip,
  type EditRecipe,
  type VideoClip,
} from "../src/lib/creator-studio/editRecipe.ts";

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log("  ok -", msg);
  } else {
    failures++;
    console.error("  FAIL -", msg);
  }
}
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

const source = {
  streamUid: "uid1",
  srcUrl: "https://x/v.mp4",
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 10,
};

console.log("createRecipe");
let r: EditRecipe = createRecipe(source);
const baseId = r.tracks[0].clips[0].id;
assert(r.tracks.length === 1 && r.tracks[0].kind === "video", "starts with one video track");
assert(near(clipLength(r.tracks[0].clips[0]), 10), "base clip length == source duration (10)");

console.log("splitClip at 4s");
r = splitClip(r, baseId, 4);
assert(r.tracks[0].clips.length === 2, "split produces 2 clips");
assert(
  near(clipLength(r.tracks[0].clips[0]), 4) && near(clipLength(r.tracks[0].clips[1]), 6),
  "halves are 4s and 6s",
);
assert(
  near((r.tracks[0].clips[1] as VideoClip).trimIn, 4) && near(r.tracks[0].clips[1].start, 4),
  "second half trimIn/start == 4",
);
assert(near(recipeDuration(r), 10), "total duration preserved after split (10)");

console.log("split no-op outside clip");
const before = r.tracks[0].clips.length;
r = splitClip(r, r.tracks[0].clips[0].id, 99);
assert(r.tracks[0].clips.length === before, "split outside range is a no-op");

console.log("setSpeed 2x on first half (4s of source -> 2s timeline)");
const firstId = r.tracks[0].clips[0].id;
r = setSpeed(r, firstId, 2);
assert(near(clipLength(findClip(r, firstId)!.clip), 2), "2x speed halves timeline length to 2s");
r = setSpeed(r, firstId, 99); // clamp test
assert((findClip(r, firstId)!.clip as VideoClip).speed === 4, "speed clamps to max 4");
r = setSpeed(r, firstId, 1);

console.log("trimClip");
r = trimClip(r, firstId, { trimOut: 2 });
assert(near(clipLength(findClip(r, firstId)!.clip), 2), "trimOut=2 -> length 2");

console.log("look ops");
r = setTransition(r, firstId, "in", "fade");
r = setFilter(r, firstId, "boost");
r = toggleEffect(r, firstId, "zoomIn");
const c = findClip(r, firstId)!.clip;
assert(
  c.transitionIn === "fade" && c.filter === "boost" && c.effects.includes("zoomIn"),
  "transition/filter/effect set",
);
r = toggleEffect(r, firstId, "zoomIn");
assert(
  !findClip(r, firstId)!.clip.effects.includes("zoomIn"),
  "toggleEffect removes on second call",
);

console.log("add text + audio tracks");
r = addTextClip(r, { text: "Trey TV", start: 1, length: 2 });
r = addAudioClip(r, { src: "https://x/song.mp3", start: 0, length: 8 });
assert(
  r.tracks.some((t) => t.kind === "text") && r.tracks.some((t) => t.kind === "audio"),
  "text + audio tracks created",
);

console.log("immutability");
const snapshot = JSON.stringify(r);
deleteClip(r, firstId);
moveClip(r, firstId, 5);
assert(JSON.stringify(r) === snapshot, "mutators do not mutate the input (undo/redo safe)");

console.log("deleteClip");
const r2 = deleteClip(r, firstId);
assert(!findClip(r2, firstId), "clip removed");

console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
