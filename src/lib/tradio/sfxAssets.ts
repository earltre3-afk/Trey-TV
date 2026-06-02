export interface SfxAsset {
  id: string;
  label: string;
  src: string;
}

export interface BedAsset {
  id: string;
  label: string;
  src: string;
  durationLabel: string;
}

export const SFX_ASSETS: SfxAsset[] = [
  { id: "airhorn", label: "Airhorn", src: "/tradio-sfx/airhorn.wav" },
  { id: "scratch", label: "Scratch", src: "/tradio-sfx/scratch.wav" },
  { id: "crowd", label: "Crowd Cheer", src: "/tradio-sfx/crowd-cheer.wav" },
  { id: "drop", label: "Bass Drop", src: "/tradio-sfx/bass-drop.wav" },
  { id: "reverb", label: "Reverb Out", src: "/tradio-sfx/reverb-out.wav" },
  { id: "ai-drop", label: "AI Drop", src: "/tradio-sfx/ai-drop.wav" },
];

export const BED_ASSETS: BedAsset[] = [
  { id: "intro", label: "Intro Bed", src: "/tradio-beds/intro.wav", durationLabel: "30s" },
  { id: "outro", label: "Outro Bed", src: "/tradio-beds/outro.wav", durationLabel: "45s" },
  { id: "under", label: "Under Bed", src: "/tradio-beds/under.wav", durationLabel: "∞" },
  {
    id: "transition",
    label: "Transition",
    src: "/tradio-beds/transition.wav",
    durationLabel: "8s",
  },
];
