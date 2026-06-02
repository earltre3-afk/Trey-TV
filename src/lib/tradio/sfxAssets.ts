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
  { id: "airhorn", label: "Airhorn", src: "/tradio-sfx/airhorn.mp3" },
  { id: "scratch", label: "Scratch", src: "/tradio-sfx/scratch.mp3" },
  { id: "crowd", label: "Crowd Cheer", src: "/tradio-sfx/crowd-cheer.mp3" },
  { id: "drop", label: "Bass Drop", src: "/tradio-sfx/bass-drop.mp3" },
  { id: "reverb", label: "Reverb Out", src: "/tradio-sfx/reverb-out.mp3" },
  { id: "ai-drop", label: "AI Drop", src: "/tradio-sfx/ai-drop.mp3" },
];

export const BED_ASSETS: BedAsset[] = [
  { id: "intro", label: "Intro Bed", src: "/tradio-beds/intro.mp3", durationLabel: "30s" },
  { id: "outro", label: "Outro Bed", src: "/tradio-beds/outro.mp3", durationLabel: "45s" },
  { id: "under", label: "Under Bed", src: "/tradio-beds/under.mp3", durationLabel: "∞" },
  {
    id: "transition",
    label: "Transition",
    src: "/tradio-beds/transition.mp3",
    durationLabel: "8s",
  },
];
