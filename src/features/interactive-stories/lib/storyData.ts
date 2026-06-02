// Static story data for Switch Kicks

export const IMAGES = {
  costumeRoom: "/interactive-stories/scenes/truth_reveal.png",
  footballDive: "/interactive-stories/scenes/football_showcase.png",
  adjudication: "/interactive-stories/scenes/ballet_adjudication.png",
  coachOffice: "/interactive-stories/scenes/consequences_meeting.png",
  ariStudio: "/interactive-stories/scenes/ari_partner_rehearsal.png",
  lockerRoom: "/interactive-stories/scenes/micah_enters_locker_room.png",
  valentinaStudio: "/interactive-stories/scenes/malik_enters_ballet_world.png",
  hallwaySwitch: "/interactive-stories/scenes/hallway_switch.png",
  danteDoorway: "/interactive-stories/scenes/truth_reveal.png",
  twinsCover: "/interactive-stories/scenes/twins_cover.png",
};

export const TONE_COLORS: Record<
  string,
  { bg: string; border: string; text: string; glow: string }
> = {
  Risky: {
    bg: "bg-red-500/15",
    border: "border-red-500",
    text: "text-red-400",
    glow: "shadow-red-500/40",
  },
  Safe: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/40",
  },
  Romantic: {
    bg: "bg-pink-500/15",
    border: "border-pink-500",
    text: "text-pink-400",
    glow: "shadow-pink-500/40",
  },
  Funny: {
    bg: "bg-amber-500/15",
    border: "border-amber-500",
    text: "text-amber-400",
    glow: "shadow-amber-500/40",
  },
  Bold: {
    bg: "bg-violet-500/15",
    border: "border-violet-500",
    text: "text-violet-400",
    glow: "shadow-violet-500/40",
  },
};

// ---------------------------------------------------------------------------
// CHARACTER PHOTO MAP — STRICT, FIXED, SINGLE SOURCE OF TRUTH.
//
// Every Cast & Connections card (and any other profile circle anywhere in the
// app — choice cards, meters, ending posters, branch map avatars, archive)
// MUST render its image from CHARACTER_PHOTO_MAP[character_id].image.
//
// HARD RULES — do not violate:
// • DO NOT generate new character faces.
// • DO NOT replace these uploaded portraits.
// • DO NOT use scene stills for profile circles.
// • DO NOT auto-select images based on role labels.
// • DO NOT crop from story scenes unless no portrait exists.
// • DO NOT use the Reggie/Dante portrait for Malik (or vice versa).
// • DO NOT use football gear for Micah's profile portrait.
// • DO NOT use the twins' image for Denise.
// • Malik & Micah are identical twins — separated ONLY by world:
// Malik = football gear / stadium lighting
// Micah = ballet dancewear / studio lighting
// • Dante is "Dante Reeves" (Backup QB) — never "Dante Williams".
// • "Jordan" is not canon; merged into Reggie.
// • "Principal Harris" is not canon; replaced with Compliance Officer.
// ---------------------------------------------------------------------------

/**
 * CHARACTER_PHOTO_MAP — fixed character_id → portrait asset.
 * This is the ONLY allowed source for profile imagery.
 */
export const CHARACTER_PHOTO_MAP: Record<
  string,
  { character_id: string; display_name: string; role: string; image_key: string; image: string }
> = {
  malik_carter: {
    character_id: "malik_carter",
    display_name: "Malik Carter",
    role: "Football Star",
    image_key: "malik_carter_portrait",
    // Football twin portrait. Previously this slot was swapped with Reggie's
    // teammate photo — restored here so Malik gets the twin face that matches
    // Micah, and Reggie keeps the teammate face. Do NOT swap these two back.
    image: "/interactive-stories/characters/malik_carter.png",
  },
  micah_carter: {
    character_id: "micah_carter",
    display_name: "Micah Carter",
    role: "Ballet Dancer",
    image_key: "micah_carter_portrait",
    image: "/interactive-stories/characters/micah_carter.png",
  },
  denise_carter: {
    character_id: "denise_carter",
    display_name: "Denise Carter",
    role: "Mother",
    image_key: "denise_carter_portrait",
    image: "/interactive-stories/characters/denise_carter.png",
  },
  ari: {
    character_id: "ari",
    display_name: 'Ariana "Ari" Cole',
    role: "Lead Dancer",
    image_key: "ari_portrait",
    image: "/interactive-stories/characters/ari.png",
  },
  dante_reeves: {
    character_id: "dante_reeves",
    display_name: "Dante Reeves",
    role: "Backup Quarterback",
    image_key: "dante_reeves_portrait",
    image: "/interactive-stories/characters/dante_reeves.png",
  },
  reggie: {
    character_id: "reggie",
    display_name: "Reggie",
    role: "Football Teammate",
    image_key: "reggie_portrait",
    // Teammate portrait — bigger build / locker-room energy, NOT the twin face.
    // Previously this slot held the twin photo (mixed up with Malik) — restored.
    image: "/interactive-stories/characters/reggie.png",
  },
  coach_bridges: {
    character_id: "coach_bridges",
    display_name: "Coach Bridges",
    role: "Head Coach",
    image_key: "coach_bridges_portrait",
    image: "/interactive-stories/characters/coach_bridges.png",
  },
  ms_valentina: {
    character_id: "ms_valentina",
    display_name: "Ms. Valentina",
    role: "Ballet Director",
    image_key: "ms_valentina_portrait",
    image: "/interactive-stories/characters/ms_valentina.png",
  },
  compliance_officer: {
    character_id: "compliance_officer",
    display_name: "Compliance Officer",
    role: "School Authority",
    image_key: "compliance_officer_portrait",
    image: "/interactive-stories/characters/compliance_officer.png",
  },
};

/**
 * Legacy alias retained so older imports keep working. Resolves a map_key
 * (e.g. "malik_carter") to the canonical portrait URL via CHARACTER_PHOTO_MAP.
 * ALWAYS prefer CHARACTER_PHOTO_MAP[character_id].image for new code.
 */
export const CHARACTER_PORTRAITS: Record<string, string> = Object.fromEntries(
  Object.entries(CHARACTER_PHOTO_MAP).map(([key, v]) => [key, v.image]),
);

export const CHARACTERS = [
  {
    id: "malik-carter",
    mapKey: "malik_carter",
    relationshipKey: "malik",
    name: "Malik Carter",
    firstName: "Malik",
    role: "Football Star",
    canon: "canonical" as const,
    image: CHARACTER_PORTRAITS.malik_carter,
    fallbackImage: CHARACTER_PORTRAITS.malik_carter,
    discipline: 78,
    emotionalIQ: 62,
    secrets: 2,
    description:
      "Cocky exterior, soft interior. Performs confidence like a full-time job. Falling for Ari.",
    quote: '"Bro. Bro. I had half a brownie. Time became soup."',
  },
  {
    id: "micah-carter",
    mapKey: "micah_carter",
    relationshipKey: "micah",
    name: "Micah Carter",
    firstName: "Micah",
    role: "Ballet Dancer",
    canon: "canonical" as const,
    image: CHARACTER_PORTRAITS.micah_carter,
    fallbackImage: CHARACTER_PORTRAITS.micah_carter,
    discipline: 94,
    emotionalIQ: 88,
    secrets: 3,
    description:
      "Controlled, precise, dry humor. Loyal to Malik to a fault. Quietly drawn to Dante.",
    quote: '"That is stupid with a college vocabulary."',
  },
  {
    id: "denise-carter",
    mapKey: "denise_carter",
    relationshipKey: "mom",
    name: "Denise Carter",
    firstName: "Denise",
    role: "Mother",
    canon: "canonical" as const,
    image: CHARACTER_PORTRAITS.denise_carter,
    fallbackImage: CHARACTER_PORTRAITS.denise_carter,
    discipline: 99,
    emotionalIQ: 99,
    secrets: 0,
    description:
      "The twins' mother. Doesn't yell. Sees everything. The moral gravity of the story.",
    quote: '"Love is not a disguise."',
  },
  {
    id: "ari",
    mapKey: "ari",
    relationshipKey: "ari",
    // The original story names her simply "Ari". The app expands the canon
    // with the full name "Ariana 'Ari' Cole" — flagged as app-canon.
    name: 'Ariana "Ari" Cole',
    firstName: "Ari",
    role: "Lead Dancer",
    canon: "app-expanded" as const,
    canonNote: 'Original story names her only "Ari" — full name is app canon.',
    image: CHARACTER_PORTRAITS.ari,
    fallbackImage: CHARACTER_PORTRAITS.ari,
    discipline: 90,
    emotionalIQ: 95,
    secrets: 1,
    description: "Warm, sharp, perceptive. Sees through things. Has a quiet crush on Malik.",
    quote: '"That is not your usual nervous spiral."',
  },
  {
    id: "dante-reeves",
    mapKey: "dante_reeves",
    relationshipKey: "dante",
    name: "Dante Reeves",
    firstName: "Dante",
    role: "Backup Quarterback",
    canon: "canonical" as const,
    image: CHARACTER_PORTRAITS.dante_reeves,
    fallbackImage: CHARACTER_PORTRAITS.dante_reeves,
    discipline: 82,
    emotionalIQ: 86,
    secrets: 2,
    description: "Quiet swagger. Not out. Real feelings for Malik, vulnerable about it.",
    quote: '"You don\'t have to act tough with me."',
  },
  {
    id: "reggie",
    mapKey: "reggie",
    relationshipKey: "reggie",
    name: "Reggie",
    firstName: "Reggie",
    role: "Football Teammate",
    canon: "canonical" as const,
    image: CHARACTER_PORTRAITS.reggie,
    fallbackImage: CHARACTER_PORTRAITS.reggie,
    discipline: 70,
    emotionalIQ: 72,
    secrets: 1,
    // Reggie absorbs the old "Jordan" function — loud teammate who notices a
    // little too much when something's off with Malik.
    description:
      "Malik's football teammate. Loud, hilarious, loyal — but he watches a little too closely when something seems off.",
    quote: '"Why you sound like Batman with allergies?"',
  },
  {
    id: "coach-bridges",
    mapKey: "coach_bridges",
    relationshipKey: "coach",
    name: "Coach Bridges",
    firstName: "Coach",
    role: "Head Coach",
    canon: "canonical" as const,
    image: CHARACTER_PORTRAITS.coach_bridges,
    fallbackImage: CHARACTER_PORTRAITS.coach_bridges,
    discipline: 99,
    emotionalIQ: 70,
    secrets: 1,
    description: "Old-school, gruff, secretly fair. Cares more than he shows.",
    quote: "\"That's what I'm talking about, Carter!\"",
  },
  {
    id: "ms-valentina",
    mapKey: "ms_valentina",
    relationshipKey: "valentina",
    name: "Ms. Valentina",
    firstName: "Valentina",
    role: "Ballet Director",
    canon: "canonical" as const,
    image: CHARACTER_PORTRAITS.ms_valentina,
    fallbackImage: CHARACTER_PORTRAITS.ms_valentina,
    discipline: 98,
    emotionalIQ: 78,
    secrets: 1,
    description:
      "Emotional warmth of airport security. Dry, exacting, but wants her dancers to succeed.",
    quote: '"Best is subjective."',
  },
  {
    id: "compliance-officer",
    mapKey: "compliance_officer",
    relationshipKey: "compliance",
    name: "Compliance Officer",
    firstName: "Compliance",
    role: "School Authority",
    canon: "app-only" as const,
    canonNote: 'Replaces app-only "Principal Harris". Not a named character in the original story.',
    image: CHARACTER_PORTRAITS.compliance_officer,
    fallbackImage: CHARACTER_PORTRAITS.compliance_officer,
    discipline: 95,
    emotionalIQ: 80,
    secrets: 1,
    description:
      "The district compliance officer who runs the drug-testing protocol. Calm hand, long memory. When you sit across his desk, you stay sat.",
    quote: '"Let\'s talk about what really happened."',
  },
];

// Quick-lookup helpers so screens never have to guess which image belongs to which person.
export const CHARACTERS_BY_ID: Record<string, (typeof CHARACTERS)[number]> = CHARACTERS.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<string, (typeof CHARACTERS)[number]>,
);

export const CHARACTERS_BY_KEY: Record<string, (typeof CHARACTERS)[number]> = CHARACTERS.reduce(
  (acc, c) => {
    acc[c.relationshipKey] = c;
    return acc;
  },
  {} as Record<string, (typeof CHARACTERS)[number]>,
);

/** Find a character by matching their name (or first name) inside any free-text string. */
export const findCharacterInText = (text: string) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  return (
    CHARACTERS.find((c) => lower.includes(c.firstName.toLowerCase())) ||
    CHARACTERS.find((c) => lower.includes(c.name.toLowerCase())) ||
    null
  );
};

export const CHAPTER_1 = {
  title: "Chapter 1 — The Carter Twin Agreement",
  image: "/interactive-stories/scenes/studio_b_request.png",
  sceneId: "studio_b_request",
  paragraphs: [
    `The fluorescent lights in the east hallway buzzed like they had something to confess. Vending machines hummed. The smell of the school — floor wax, ancient pizza, low-grade ambition — hung in the air.`,
    `Malik Carter was sweating in a way that wasn't entirely about the temperature.`,
    `"Bro. Bro. Bro." He grabbed Micah's shoulders. "I need you to listen to me with your face and not your judgment."`,
    `Micah, in his rehearsal blacks and warm-up jacket, set his water bottle down very slowly. The way you set down a thing when you already know the next sentence is going to ruin your morning.`,
    `"Malik. It's seven-forty in the morning."`,
    `"I know what time it is."`,
    `"You're shaking."`,
    `"I'm caffeinated. And concerned. Different things."`,
    `Micah folded his arms. "What did you do."`,
    `Malik did the thing he always did before a bad confession — he laughed once, like he was about to tell a joke. The joke never came.`,
    `"Okay. So. Last night. I may have been… recreationally unwise."`,
    `"That is stupid," Micah said, "with a college vocabulary."`,
    `"Half a brownie. Maybe one and a half. Time became soup."`,
    `Micah closed his eyes. Behind his eyelids, his entire ballet adjudication walked off a cliff in slow motion.`,
    `"Malik. You have a compliance test today. Today. The draft showcase is in three weeks."`,
    `"I am aware of every word you just said."`,
    `A locker slammed somewhere down the hall. Malik flinched like it was a starter pistol.`,
    `"I need a favor," he said. "A big one. A — okay, listen, before you say no — a switch-shaped one."`,
    `Micah opened his eyes. "No."`,
    `"You didn't even —"`,
    `"No."`,
    `"Bro. We are LITERALLY identical. God designed us for this exact moment. This is divine engineering."`,
    `"God designed us so you could fail a drug test in my body? That's the theology you're going with at seven-forty in the morning?"`,
    `Malik clutched his chest. "When you say it like that it sounds bad."`,
    `"It sounds like what it is."`,
    `Micah looked at his brother — really looked at him. Under the cocky he could see the scared. The kid who used to climb into his bed during thunderstorms and pretend it was a strategic decision.`,
    `Malik saw the look. He pressed.`,
    `"One day. ONE day. You go to football, you keep your mouth shut, you let Reggie do most of the talking — which, let's be honest, Reggie's gonna do anyway — you sit in the back of practice, you pee in the cup, you come home. That's it. That's the whole movie."`,
    `"And what am I doing about my adjudication?"`,
    `Malik froze.`,
    `Just a half-second. But Micah caught it.`,
    `"Oh," Micah said. "Oh, you forgot I had an adjudication today."`,
    `"I did not forget —"`,
    `"You forgot."`,
    `"I momentarily de-prioritized."`,
    `Micah laughed. Once. Sharp.`,
    `"Malik. Ms. Valentina is choosing the featured solo today. TODAY. I have been preparing for this for eight months. EIGHT. MONTHS."`,
    `"I know."`,
    `"You don't know. You think you know. You're using the voice you use when you don't know."`,
    `Malik looked at the floor. Then back up. And the thing about Malik was — when he was actually scared, his whole face changed. The performance dropped. And what was underneath was so much younger than seventeen.`,
    `"Micah. If I fail this test, I lose the showcase. If I lose the showcase, I lose the offer. If I lose the offer —" He stopped. Swallowed. "Mom worked three jobs. Three. I'm not — I can't be the reason that was for nothing."`,
    `The hallway went quiet. Even the vending machines seemed to lower their voices.`,
    `Micah's stomach fell down a flight of stairs.`,
    `Because here was the thing nobody talked about: he loved his brother. Stupidly. Completely. The kind of love that made you do things you'd later have to explain in a therapist's office.`,
    `He took a breath.`,
    `"Give me your jacket," he said.`,
  ],
};

export const INITIAL_METERS = {
  trust_ari: 50,
  trust_dante: 50,
  trust_malik_to_micah: 85,
  trust_micah_to_malik: 80,
  suspicion_mom: 10,
  suspicion_coach: 5,
  suspicion_valentina: 5,
  risk_level: 15,
};

export const CHAPTER_1_CHOICES = [
  {
    label: "A",
    text: "Help Malik and switch.",
    tone: "Risky" as const,
    affectedCharacterIds: ["malik-carter", "micah-carter"],
    relationshipImpactType: "Loyalty" as const,
  },
  {
    label: "B",
    text: "Refuse and let Malik face the consequences.",
    tone: "Safe" as const,
    affectedCharacterIds: ["malik-carter", "coach-bridges"],
    relationshipImpactType: "Distance" as const,
  },
  {
    label: "C",
    text: "Make a deal — only if Malik covers his adjudication.",
    tone: "Bold" as const,
    affectedCharacterIds: ["malik-carter", "micah-carter", "ms-valentina"],
    relationshipImpactType: "Pressure" as const,
  },
  {
    label: "D",
    text: "Help, but set a strict rule.",
    tone: "Funny" as const,
    affectedCharacterIds: ["malik-carter", "reggie"],
    relationshipImpactType: "Trust" as const,
  },
  {
    label: "E",
    text: "Walk away… or so he thinks.",
    tone: "Romantic" as const,
    affectedCharacterIds: ["malik-carter", "denise-carter"],
    relationshipImpactType: "Tension" as const,
  },
];

/**
 * Infer which characters a free-text choice affects.
 * Uses the official character registry — never invents new characters.
 * Falls back to scanning for first names / full names inside choice + prompt text.
 */
export function inferAffectedCharacters(
  choice: { text: string; affectedCharacterIds?: string[] },
  promptContext: string = "",
): typeof CHARACTERS {
  if (choice.affectedCharacterIds && choice.affectedCharacterIds.length > 0) {
    return choice.affectedCharacterIds
      .map((id) => CHARACTERS_BY_ID[id])
      .filter(Boolean) as typeof CHARACTERS;
  }
  const haystack = `${choice.text} ${promptContext}`.toLowerCase();
  const matched = CHARACTERS.filter((c) => {
    const first = c.firstName.toLowerCase();
    const full = c.name.toLowerCase();
    // Use word-boundary-ish check so "ari" doesn't match "Mariah"
    return (
      new RegExp(`\\b${first}\\b`, "i").test(haystack) ||
      new RegExp(`\\b${full}\\b`, "i").test(haystack)
    );
  });
  return matched as typeof CHARACTERS;
}

// ---------------------------------------------------------------------------
// SCENE IMAGE MAP — STRICT, FIXED, SCENE-ID → IMAGE METADATA.
//
// Every story scene image must resolve through this map (or its tone-based
// fallback in pickChapterImage). The map encodes face-safe framing so the
// renderer can pick the correct object-fit + object-position for the image's
// composition. Profile portraits NEVER come from here; they always come from
// CHARACTER_PHOTO_MAP. This map is for cinematic scene stills only.
//
// HARD RULES:
// • Scene images are NEVER used inside profile circles.
// • Faces of focal characters must remain visible after cropping.
// • If a wide image would cut faces in a vertical container, prefer
// recommended_fit: "contain" (zoom out) over a tight cover crop.
// • Never randomly pick a scene image by mood or role — use scene_id.
// • Tone-based fallback (pickChapterImage) is only for AI-generated
// chapters that don't carry a scene_id yet.
// ---------------------------------------------------------------------------

export type RecommendedFit = "cover" | "contain";
export type ObjectPos =
  | "center top"
  | "center center"
  | "center bottom"
  | "center 25%"
  | "center 35%"
  | "center 65%";

export interface SceneImageMeta {
  scene_id: string;
  image_key: string;
  image: string;
  scene_description: string;
  focal_characters: string[];
  /** Vertical focal point as a fraction of image height (0 = top, 1 = bottom). */
  focal_point_x: number;
  focal_point_y: number;
  safe_crop: true;
  recommended_fit: RecommendedFit;
  object_position: ObjectPos;
}

/**
 * SCENE_IMAGE_MAP — locked scene_id → metadata. Renderers MUST pull framing
 * (recommended_fit + object_position) from here so faces aren't cropped out.
 */
export const SCENE_IMAGE_MAP: Record<string, SceneImageMeta> = {
  studio_b_request: {
    scene_id: "studio_b_request",
    image_key: "malik_begs_micah_studio_b",
    image: "/interactive-stories/scenes/studio_b_request.png",
    scene_description: "Malik begs Micah inside/near Studio B before the switch.",
    focal_characters: ["malik_carter", "micah_carter"],
    focal_point_x: 0.5,
    focal_point_y: 0.35,
    safe_crop: true,
    recommended_fit: "cover",
    object_position: "center 35%",
  },
  hallway_switch: {
    scene_id: "hallway_switch",
    image_key: "twins_switch_clothes_vending_machine_hallway",
    image: "/interactive-stories/scenes/hallway_switch.png",
    scene_description: "The twins switch clothes and identities in the back hallway.",
    focal_characters: ["malik_carter", "micah_carter"],
    focal_point_x: 0.5,
    focal_point_y: 0.4,
    safe_crop: true,
    recommended_fit: "cover",
    object_position: "center 35%",
  },
  malik_enters_ballet_world: {
    scene_id: "malik_enters_ballet_world",
    image_key: "malik_in_ballet_studio_with_ms_valentina",
    image: "/interactive-stories/scenes/malik_enters_ballet_world.png",
    scene_description: "Malik, pretending to be Micah, enters the ballet studio.",
    focal_characters: ["malik_carter", "ms_valentina"],
    focal_point_x: 0.5,
    focal_point_y: 0.35,
    safe_crop: true,
    recommended_fit: "cover",
    object_position: "center 35%",
  },
  micah_enters_locker_room: {
    scene_id: "micah_enters_locker_room",
    image_key: "micah_in_football_locker_room",
    image: "/interactive-stories/scenes/micah_enters_locker_room.png",
    scene_description: "Micah, pretending to be Malik, enters the football locker room.",
    focal_characters: ["micah_carter", "reggie", "dante_reeves"],
    focal_point_x: 0.5,
    focal_point_y: 0.4,
    safe_crop: true,
    recommended_fit: "cover",
    object_position: "center 35%",
  },
  ari_partner_rehearsal: {
    scene_id: "ari_partner_rehearsal",
    image_key: "malik_and_ari_partner_rehearsal",
    image: "/interactive-stories/scenes/ari_partner_rehearsal.png",
    scene_description: "Malik dances with Ari during partner rehearsal.",
    focal_characters: ["malik_carter", "ari"],
    focal_point_x: 0.5,
    focal_point_y: 0.45,
    safe_crop: true,
    recommended_fit: "contain",
    object_position: "center center",
  },
  compliance_office: {
    scene_id: "compliance_office",
    image_key: "micah_at_compliance_test",
    image: "/interactive-stories/scenes/compliance_office.png",
    scene_description: "Micah tries to survive Malik's compliance test across the officer's desk.",
    focal_characters: ["micah_carter", "compliance_officer"],
    focal_point_x: 0.5,
    focal_point_y: 0.35,
    safe_crop: true,
    recommended_fit: "cover",
    object_position: "center 35%",
  },
  coach_office: {
    scene_id: "coach_office",
    image_key: "micah_meets_coach_bridges",
    image: "/interactive-stories/scenes/compliance_office.png",
    scene_description: "Micah, pretending to be Malik, sits across from Coach Bridges.",
    focal_characters: ["micah_carter", "coach_bridges"],
    focal_point_x: 0.5,
    focal_point_y: 0.35,
    safe_crop: true,
    recommended_fit: "cover",
    object_position: "center 35%",
  },
  football_dive: {
    scene_id: "football_dive",
    image_key: "football_practice_field",
    image: "/interactive-stories/scenes/football_showcase.png",
    scene_description: "Football practice on the field — Malik's world, full intensity.",
    focal_characters: ["malik_carter", "reggie", "dante_reeves"],
    focal_point_x: 0.5,
    focal_point_y: 0.45,
    safe_crop: true,
    recommended_fit: "cover",
    object_position: "center center",
  },
  ballet_adjudication: {
    scene_id: "ballet_adjudication",
    image_key: "micah_solo_adjudication",
    image: "/interactive-stories/scenes/ballet_adjudication.png",
    scene_description: "The ballet adjudication where the featured solo is decided.",
    focal_characters: ["micah_carter", "ms_valentina", "ari"],
    focal_point_x: 0.5,
    focal_point_y: 0.4,
    safe_crop: true,
    recommended_fit: "cover",
    object_position: "center 35%",
  },
  dante_doorway: {
    scene_id: "dante_doorway",
    image_key: "dante_in_doorway",
    image: "/interactive-stories/scenes/truth_reveal.png",
    scene_description: "Dante catches Malik off-guard in a quiet doorway moment.",
    focal_characters: ["dante_reeves", "malik_carter"],
    focal_point_x: 0.5,
    focal_point_y: 0.35,
    safe_crop: true,
    recommended_fit: "cover",
    object_position: "center 35%",
  },
  costume_room: {
    scene_id: "costume_room",
    image_key: "costume_room_change",
    image: "/interactive-stories/scenes/truth_reveal.png",
    scene_description: "Behind-the-scenes costume room — quick change, full tension.",
    focal_characters: ["malik_carter", "micah_carter"],
    focal_point_x: 0.5,
    focal_point_y: 0.4,
    safe_crop: true,
    recommended_fit: "cover",
    object_position: "center 35%",
  },
  twins_cover: {
    scene_id: "twins_cover",
    image_key: "switch_kicks_cover_twins",
    image: "/interactive-stories/scenes/twins_cover.png",
    scene_description: "Cover image — the twins, identical, separated by their two worlds.",
    focal_characters: ["malik_carter", "micah_carter"],
    focal_point_x: 0.5,
    focal_point_y: 0.35,
    safe_crop: true,
    recommended_fit: "cover",
    object_position: "center 25%",
  },
};

/**
 * Lookup framing metadata for a given image URL. Lets renderers preserve
 * face-safe framing even when chapters only carry the raw URL (e.g. when
 * pickChapterImage returns from a tone-based pool).
 *
 * Returns sane defaults if the URL isn't in SCENE_IMAGE_MAP — defaults
 * favor showing the upper third of the frame (where faces usually live).
 */
export function getImageMeta(url?: string | null): {
  fit: RecommendedFit;
  position: ObjectPos;
  sceneId?: string;
} {
  if (!url) return { fit: "cover", position: "center 35%" };
  for (const meta of Object.values(SCENE_IMAGE_MAP)) {
    if (meta.image === url) {
      return { fit: meta.recommended_fit, position: meta.object_position, sceneId: meta.scene_id };
    }
  }
  return { fit: "cover", position: "center 35%" };
}

/** Convenience: pull a scene by id (returns undefined if not mapped). */
export function getSceneById(scene_id: string): SceneImageMeta | undefined {
  return SCENE_IMAGE_MAP[scene_id];
}
