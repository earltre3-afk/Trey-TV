export type Tone = 'Risky' | 'Safe' | 'Romantic' | 'Funny' | 'Bold';

/** What kind of relationship pressure does this choice create? */
export type RelationshipImpactType =
  | 'Trust'
  | 'Tension'
  | 'Loyalty'
  | 'Respect'
  | 'Pressure'
  | 'Distance'
  | 'Bond'
  | 'Rivalry';

export interface Choice {
  label: string;
  text: string;
  tone: Tone;
  /** Optional machine id for installed .ttstory packages. */
  id?: string;
  /** Scene to jump to after this choice in installed .ttstory packages. */
  nextSceneId?: string;
  /** Optional meter changes applied by installed story packages. */
  stateDelta?: StateDelta;
  /** Official character IDs this choice will affect. Drives faces on the choice card. */
  affectedCharacterIds?: string[];
  /** One-word emotional dimension this choice pressures (Trust / Tension / Loyalty / …). */
  relationshipImpactType?: RelationshipImpactType;
}

export interface Meters {
  trust_ari: number;
  trust_dante: number;
  trust_malik_to_micah: number;
  trust_micah_to_malik: number;
  suspicion_mom: number;
  suspicion_coach: number;
  suspicion_valentina: number;
  risk_level: number;
}

export interface ChapterRecord {
  number: number;
  title: string;
  prose: string;
  image?: string;
  /** Optional per-package image framing. Installed .ttstory scenes can provide these. */
  imageFit?: 'cover' | 'contain';
  imagePosition?: string;
  /** Locked scene id used to pull image metadata and resume playthroughs. */
  sceneId?: string;
  summary?: string;
  toneTag?: Tone;
  choiceMade?: { label: string; text: string; tone: Tone };
}

export interface Ending {
  name: string;
  tagline: string;
  unlockedAt: number;
  branchId: string;
}

export interface Branch {
  id: string;
  storyId: string;
  createdAt: number;
  updatedAt: number;
  chapters: ChapterRecord[];
  meters: Meters;
  flags: Record<string, boolean | string>;
  secrets: Record<string, { known_by: string[]; suspected_by: string[] }>;
  toneHistory: Tone[];
  isComplete: boolean;
  ending?: Ending;
  pendingStopPoint?: {
    prompt: string;
    choices: Choice[];
  };
}

export interface StateDelta {
  trust_ari?: number;
  trust_dante?: number;
  trust_malik_to_micah?: number;
  trust_micah_to_malik?: number;
  suspicion_mom?: number;
  suspicion_coach?: number;
  suspicion_valentina?: number;
  risk_level?: number;
}
