// Generates placeholder WAV audio for the Tradio soundboard + music beds so the
// live console is audible out of the box. Replace these with real royalty-free
// assets later (same filenames). Run: node scripts/gen-tradio-placeholder-audio.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SR = 44100;

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(s * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const env = (i, n, attack = 0.01, release = 0.3) => {
  const t = i / n;
  const a = Math.min(1, t / attack);
  const r = Math.min(1, (1 - t) / release);
  return Math.max(0, Math.min(a, r));
};

// SFX: short, punchy, distinct per id.
function sfx(kind, durSec, gain = 0.6) {
  const n = Math.floor(SR * durSec);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    switch (kind) {
      case "airhorn":
        s = (Math.sign(Math.sin(2 * Math.PI * 440 * t)) * 0.5 + Math.sin(2 * Math.PI * 660 * t) * 0.5);
        break;
      case "scratch":
        s = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(2 * Math.PI * 8 * t));
        break;
      case "crowd":
        s = (Math.random() * 2 - 1) * 0.8;
        break;
      case "drop":
        s = Math.sin(2 * Math.PI * (220 - 180 * (i / n)) * t);
        break;
      case "reverb":
        s = Math.sin(2 * Math.PI * 520 * t);
        break;
      case "ai-drop":
        s = Math.sin(2 * Math.PI * (300 + 500 * (i / n)) * t);
        break;
      default:
        s = Math.sin(2 * Math.PI * 440 * t);
    }
    out[i] = s * env(i, n, 0.01, kind === "crowd" ? 0.5 : 0.35) * gain;
  }
  return out;
}

// Beds: soft sustained pad chord, lower gain, longer.
function bed(rootHz, durSec, gain = 0.25) {
  const n = Math.floor(SR * durSec);
  const out = new Float32Array(n);
  const partials = [1, 1.5, 2];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    for (const p of partials) s += Math.sin(2 * Math.PI * rootHz * p * t);
    out[i] = (s / partials.length) * env(i, n, 0.08, 0.2) * gain;
  }
  return out;
}

const sfxDir = join(root, "public", "tradio-sfx");
const bedDir = join(root, "public", "tradio-beds");
mkdirSync(sfxDir, { recursive: true });
mkdirSync(bedDir, { recursive: true });

const sfxSpecs = [
  ["airhorn", 0.6], ["scratch", 0.4], ["crowd-cheer", 0.9, "crowd"],
  ["bass-drop", 0.7, "drop"], ["reverb-out", 0.8, "reverb"], ["ai-drop", 0.6, "ai-drop"],
];
for (const [name, dur, kind] of sfxSpecs) {
  writeFileSync(join(sfxDir, `${name}.wav`), wav(sfx(kind ?? name, dur)));
}

const bedSpecs = [["intro", 2.5, 196], ["outro", 2.5, 165], ["under", 3, 147], ["transition", 1.2, 262]];
for (const [name, dur, hz] of bedSpecs) {
  writeFileSync(join(bedDir, `${name}.wav`), wav(bed(hz, dur)));
}

console.log("Wrote placeholder Tradio SFX + bed WAVs to public/tradio-sfx and public/tradio-beds");
