import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useAuth$1, c as createBrowserClient } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as ArrowLeft, cw as GitBranch, aw as Trophy, a9 as Clock, a4 as Play, G as Globe, ae as Share2, i as Lock, ao as Pencil, aF as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./index.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "../_libs/zod.mjs";
const IMAGES = {
  costumeRoom: "/interactive-stories/scenes/truth_reveal.png",
  footballDive: "/interactive-stories/scenes/football_showcase.png",
  adjudication: "/interactive-stories/scenes/ballet_adjudication.png",
  coachOffice: "/interactive-stories/scenes/consequences_meeting.png",
  ariStudio: "/interactive-stories/scenes/ari_partner_rehearsal.png",
  lockerRoom: "/interactive-stories/scenes/micah_enters_locker_room.png",
  valentinaStudio: "/interactive-stories/scenes/malik_enters_ballet_world.png",
  hallwaySwitch: "/interactive-stories/scenes/hallway_switch.png",
  danteDoorway: "/interactive-stories/scenes/truth_reveal.png",
  twinsCover: "/interactive-stories/scenes/twins_cover.png"
};
const TONE_COLORS = {
  Risky: { bg: "bg-red-500/15", border: "border-red-500", text: "text-red-400", glow: "shadow-red-500/40" },
  Safe: { bg: "bg-emerald-500/15", border: "border-emerald-500", text: "text-emerald-400", glow: "shadow-emerald-500/40" },
  Romantic: { bg: "bg-pink-500/15", border: "border-pink-500", text: "text-pink-400", glow: "shadow-pink-500/40" },
  Funny: { bg: "bg-amber-500/15", border: "border-amber-500", text: "text-amber-400", glow: "shadow-amber-500/40" },
  Bold: { bg: "bg-violet-500/15", border: "border-violet-500", text: "text-violet-400", glow: "shadow-violet-500/40" }
};
const CHARACTER_PHOTO_MAP = {
  malik_carter: {
    character_id: "malik_carter",
    display_name: "Malik Carter",
    role: "Football Star",
    image_key: "malik_carter_portrait",
    // Football twin portrait. Previously this slot was swapped with Reggie's
    // teammate photo — restored here so Malik gets the twin face that matches
    // Micah, and Reggie keeps the teammate face. Do NOT swap these two back.
    image: "/interactive-stories/characters/malik_carter.png"
  },
  micah_carter: {
    character_id: "micah_carter",
    display_name: "Micah Carter",
    role: "Ballet Dancer",
    image_key: "micah_carter_portrait",
    image: "/interactive-stories/characters/micah_carter.png"
  },
  denise_carter: {
    character_id: "denise_carter",
    display_name: "Denise Carter",
    role: "Mother",
    image_key: "denise_carter_portrait",
    image: "/interactive-stories/characters/denise_carter.png"
  },
  ari: {
    character_id: "ari",
    display_name: 'Ariana "Ari" Cole',
    role: "Lead Dancer",
    image_key: "ari_portrait",
    image: "/interactive-stories/characters/ari.png"
  },
  dante_reeves: {
    character_id: "dante_reeves",
    display_name: "Dante Reeves",
    role: "Backup Quarterback",
    image_key: "dante_reeves_portrait",
    image: "/interactive-stories/characters/dante_reeves.png"
  },
  reggie: {
    character_id: "reggie",
    display_name: "Reggie",
    role: "Football Teammate",
    image_key: "reggie_portrait",
    // Teammate portrait — bigger build / locker-room energy, NOT the twin face.
    // Previously this slot held the twin photo (mixed up with Malik) — restored.
    image: "/interactive-stories/characters/reggie.png"
  },
  coach_bridges: {
    character_id: "coach_bridges",
    display_name: "Coach Bridges",
    role: "Head Coach",
    image_key: "coach_bridges_portrait",
    image: "/interactive-stories/characters/coach_bridges.png"
  },
  ms_valentina: {
    character_id: "ms_valentina",
    display_name: "Ms. Valentina",
    role: "Ballet Director",
    image_key: "ms_valentina_portrait",
    image: "/interactive-stories/characters/ms_valentina.png"
  },
  compliance_officer: {
    character_id: "compliance_officer",
    display_name: "Compliance Officer",
    role: "School Authority",
    image_key: "compliance_officer_portrait",
    image: "/interactive-stories/characters/compliance_officer.png"
  }
};
const CHARACTER_PORTRAITS = Object.fromEntries(
  Object.entries(CHARACTER_PHOTO_MAP).map(([key, v]) => [key, v.image])
);
const CHARACTERS = [
  {
    id: "malik-carter",
    mapKey: "malik_carter",
    relationshipKey: "malik",
    name: "Malik Carter",
    firstName: "Malik",
    role: "Football Star",
    canon: "canonical",
    image: CHARACTER_PORTRAITS.malik_carter,
    fallbackImage: CHARACTER_PORTRAITS.malik_carter,
    discipline: 78,
    emotionalIQ: 62,
    secrets: 2,
    description: "Cocky exterior, soft interior. Performs confidence like a full-time job. Falling for Ari.",
    quote: '"Bro. Bro. I had half a brownie. Time became soup."'
  },
  {
    id: "micah-carter",
    mapKey: "micah_carter",
    relationshipKey: "micah",
    name: "Micah Carter",
    firstName: "Micah",
    role: "Ballet Dancer",
    canon: "canonical",
    image: CHARACTER_PORTRAITS.micah_carter,
    fallbackImage: CHARACTER_PORTRAITS.micah_carter,
    discipline: 94,
    emotionalIQ: 88,
    secrets: 3,
    description: "Controlled, precise, dry humor. Loyal to Malik to a fault. Quietly drawn to Dante.",
    quote: '"That is stupid with a college vocabulary."'
  },
  {
    id: "denise-carter",
    mapKey: "denise_carter",
    relationshipKey: "mom",
    name: "Denise Carter",
    firstName: "Denise",
    role: "Mother",
    canon: "canonical",
    image: CHARACTER_PORTRAITS.denise_carter,
    fallbackImage: CHARACTER_PORTRAITS.denise_carter,
    discipline: 99,
    emotionalIQ: 99,
    secrets: 0,
    description: "The twins' mother. Doesn't yell. Sees everything. The moral gravity of the story.",
    quote: '"Love is not a disguise."'
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
    canon: "app-expanded",
    canonNote: 'Original story names her only "Ari" — full name is app canon.',
    image: CHARACTER_PORTRAITS.ari,
    fallbackImage: CHARACTER_PORTRAITS.ari,
    discipline: 90,
    emotionalIQ: 95,
    secrets: 1,
    description: "Warm, sharp, perceptive. Sees through things. Has a quiet crush on Malik.",
    quote: '"That is not your usual nervous spiral."'
  },
  {
    id: "dante-reeves",
    mapKey: "dante_reeves",
    relationshipKey: "dante",
    name: "Dante Reeves",
    firstName: "Dante",
    role: "Backup Quarterback",
    canon: "canonical",
    image: CHARACTER_PORTRAITS.dante_reeves,
    fallbackImage: CHARACTER_PORTRAITS.dante_reeves,
    discipline: 82,
    emotionalIQ: 86,
    secrets: 2,
    description: "Quiet swagger. Not out. Real feelings for Malik, vulnerable about it.",
    quote: `"You don't have to act tough with me."`
  },
  {
    id: "reggie",
    mapKey: "reggie",
    relationshipKey: "reggie",
    name: "Reggie",
    firstName: "Reggie",
    role: "Football Teammate",
    canon: "canonical",
    image: CHARACTER_PORTRAITS.reggie,
    fallbackImage: CHARACTER_PORTRAITS.reggie,
    discipline: 70,
    emotionalIQ: 72,
    secrets: 1,
    // Reggie absorbs the old "Jordan" function — loud teammate who notices a
    // little too much when something's off with Malik.
    description: "Malik's football teammate. Loud, hilarious, loyal — but he watches a little too closely when something seems off.",
    quote: '"Why you sound like Batman with allergies?"'
  },
  {
    id: "coach-bridges",
    mapKey: "coach_bridges",
    relationshipKey: "coach",
    name: "Coach Bridges",
    firstName: "Coach",
    role: "Head Coach",
    canon: "canonical",
    image: CHARACTER_PORTRAITS.coach_bridges,
    fallbackImage: CHARACTER_PORTRAITS.coach_bridges,
    discipline: 99,
    emotionalIQ: 70,
    secrets: 1,
    description: "Old-school, gruff, secretly fair. Cares more than he shows.",
    quote: `"That's what I'm talking about, Carter!"`
  },
  {
    id: "ms-valentina",
    mapKey: "ms_valentina",
    relationshipKey: "valentina",
    name: "Ms. Valentina",
    firstName: "Valentina",
    role: "Ballet Director",
    canon: "canonical",
    image: CHARACTER_PORTRAITS.ms_valentina,
    fallbackImage: CHARACTER_PORTRAITS.ms_valentina,
    discipline: 98,
    emotionalIQ: 78,
    secrets: 1,
    description: "Emotional warmth of airport security. Dry, exacting, but wants her dancers to succeed.",
    quote: '"Best is subjective."'
  },
  {
    id: "compliance-officer",
    mapKey: "compliance_officer",
    relationshipKey: "compliance",
    name: "Compliance Officer",
    firstName: "Compliance",
    role: "School Authority",
    canon: "app-only",
    canonNote: 'Replaces app-only "Principal Harris". Not a named character in the original story.',
    image: CHARACTER_PORTRAITS.compliance_officer,
    fallbackImage: CHARACTER_PORTRAITS.compliance_officer,
    discipline: 95,
    emotionalIQ: 80,
    secrets: 1,
    description: "The district compliance officer who runs the drug-testing protocol. Calm hand, long memory. When you sit across his desk, you stay sat.",
    quote: `"Let's talk about what really happened."`
  }
];
const CHARACTERS_BY_ID = CHARACTERS.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {}
);
const CHARACTERS_BY_KEY = CHARACTERS.reduce(
  (acc, c) => {
    acc[c.relationshipKey] = c;
    return acc;
  },
  {}
);
const CHAPTER_1 = {
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
    `"Give me your jacket," he said.`
  ]
};
const INITIAL_METERS = {
  trust_ari: 50,
  trust_dante: 50,
  trust_malik_to_micah: 85,
  trust_micah_to_malik: 80,
  suspicion_mom: 10,
  suspicion_coach: 5,
  suspicion_valentina: 5,
  risk_level: 15
};
const CHAPTER_1_CHOICES = [
  {
    label: "A",
    text: "Help Malik and switch.",
    tone: "Risky",
    affectedCharacterIds: ["malik-carter", "micah-carter"],
    relationshipImpactType: "Loyalty"
  },
  {
    label: "B",
    text: "Refuse and let Malik face the consequences.",
    tone: "Safe",
    affectedCharacterIds: ["malik-carter", "coach-bridges"],
    relationshipImpactType: "Distance"
  },
  {
    label: "C",
    text: "Make a deal — only if Malik covers his adjudication.",
    tone: "Bold",
    affectedCharacterIds: ["malik-carter", "micah-carter", "ms-valentina"],
    relationshipImpactType: "Pressure"
  },
  {
    label: "D",
    text: "Help, but set a strict rule.",
    tone: "Funny",
    affectedCharacterIds: ["malik-carter", "reggie"],
    relationshipImpactType: "Trust"
  },
  {
    label: "E",
    text: "Walk away… or so he thinks.",
    tone: "Romantic",
    affectedCharacterIds: ["malik-carter", "denise-carter"],
    relationshipImpactType: "Tension"
  }
];
function inferAffectedCharacters(choice, promptContext = "") {
  if (choice.affectedCharacterIds && choice.affectedCharacterIds.length > 0) {
    return choice.affectedCharacterIds.map((id) => CHARACTERS_BY_ID[id]).filter(Boolean);
  }
  const haystack = `${choice.text} ${promptContext}`.toLowerCase();
  const matched = CHARACTERS.filter((c) => {
    const first = c.firstName.toLowerCase();
    const full = c.name.toLowerCase();
    return new RegExp(`\\b${first}\\b`, "i").test(haystack) || new RegExp(`\\b${full}\\b`, "i").test(haystack);
  });
  return matched;
}
const SCENE_IMAGE_MAP = {
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
    object_position: "center 35%"
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
    object_position: "center 35%"
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
    object_position: "center 35%"
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
    object_position: "center 35%"
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
    object_position: "center center"
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
    object_position: "center 35%"
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
    object_position: "center 35%"
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
    object_position: "center center"
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
    object_position: "center 35%"
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
    object_position: "center 35%"
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
    object_position: "center 35%"
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
    object_position: "center 25%"
  }
};
function getImageMeta(url) {
  if (!url) return { fit: "cover", position: "center 35%" };
  for (const meta of Object.values(SCENE_IMAGE_MAP)) {
    if (meta.image === url) {
      return { fit: meta.recommended_fit, position: meta.object_position, sceneId: meta.scene_id };
    }
  }
  return { fit: "cover", position: "center 35%" };
}
const MOJIBAKE_MAP = [
  // Smart double quotes  "  "
  [/â€œ/g, "“"],
  // "
  [/â€\x9D/g, "”"],
  // "  (â€ + RIGHT DOUBLE QUOTATION MARK byte)
  [/â€/g, "”"],
  // " — catch remaining â€ before broader rules
  // Smart single quotes  '  '
  [/â€˜/g, "‘"],
  // '
  [/â€™/g, "’"],
  // '
  // Ellipsis  …
  [/â€¦/g, "…"],
  // …
  // Em dash  —
  [/â€"/g, "—"],
  // —
  // En dash  –
  [/â€"/g, "–"],
  // –
  // Bullet  •
  [/â€¢/g, "•"],
  // •
  // Arrow  →
  [/â†'/g, "→"],
  // →
  // Non-breaking space artifact
  [/Â\u00A0/g, " "],
  // keep NBSP but drop the Â prefix
  [/Â /g, " "],
  // Â + regular space → just a space
  [/Â/g, ""],
  // lone Â → remove
  // Replacement character / null artifact
  [/\uFFFD/g, ""],
  [/\u0000/g, ""],
  // Euro sign artifact used as em dash stand-in: €"  →  —
  [/€"/g, "—"],
  // Repeated whitespace cleanup
  [/[ \t]{2,}/g, " "]
];
function cleanText(value) {
  if (value === null || value === void 0) return "";
  if (typeof value !== "string") {
    const coerced = String(value);
    if (coerced === "[object Object]" || coerced === "undefined" || coerced === "null") return "";
    return cleanText(coerced);
  }
  let s = value;
  for (const [pattern, replacement] of MOJIBAKE_MAP) {
    s = s.replace(pattern, replacement);
  }
  return s.trim();
}
const TREY_STORY_FILE_EXTENSION = ".ttstory";
const TREY_STORY_FILE_TYPE = "trey-tv-interactive-story";
const TREY_STORY_FORMAT_VERSION = "1.1";
const STORAGE_KEY$1 = "trey_installed_story_packages_v1";
const ALLOWED_TONES = ["Risky", "Safe", "Romantic", "Funny", "Bold"];
const CHOICE_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const BUNDLED_STORY_SOURCES = [
  "/interactive-stories/stories/the-god-ram-book-one.ttstory"
];
class TreyStoryPackageError extends Error {
  constructor(message) {
    super(message);
    this.name = "TreyStoryPackageError";
  }
}
function assertString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TreyStoryPackageError(`${label} must be a non-empty string.`);
  }
}
function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
function normalizeMachineId(value, fallback = "item") {
  const raw = typeof value === "string" ? value : fallback;
  const normalized = raw.trim().toLowerCase().replace(/['"’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return normalized || fallback;
}
function normalizeTone(value) {
  if (typeof value === "string") {
    const match = ALLOWED_TONES.find((tone) => tone.toLowerCase() === value.trim().toLowerCase());
    if (match) return match;
  }
  return "Bold";
}
function normalizeAssetPath(value, kind) {
  if (typeof value !== "string" || value.trim().length === 0) return void 0;
  const raw = value.trim();
  if (/^(https?:|data:image\/|\/)/i.test(raw)) return raw;
  if (raw.includes("/")) return raw.startsWith("/") ? raw : `/${raw}`;
  const hasExtension = /\.(png|jpe?g|webp|gif|svg)$/i.test(raw);
  return `/interactive-stories/${kind}/${hasExtension ? raw : `${raw}.png`}`;
}
function normalizeVoiceProvider(value) {
  const provider = typeof value === "string" ? value.trim().toLowerCase() : "system";
  if (provider === "elevenlabs" || provider === "openai" || provider === "uploaded" || provider === "none") return provider;
  return "system";
}
function normalizeVoiceConfig(value) {
  if (!value || typeof value !== "object") return void 0;
  const raw = value;
  return {
    voiceProvider: normalizeVoiceProvider(raw.voiceProvider || raw.voice_provider || raw.provider),
    voiceId: typeof raw.voiceId === "string" ? raw.voiceId : typeof raw.voice_id === "string" ? raw.voice_id : null,
    voiceName: typeof raw.voiceName === "string" ? raw.voiceName : typeof raw.voice_name === "string" ? raw.voice_name : null,
    audioStyle: typeof raw.audioStyle === "string" ? raw.audioStyle : typeof raw.audio_style === "string" ? raw.audio_style : null,
    settings: raw.settings && typeof raw.settings === "object" ? raw.settings : null
  };
}
function normalizeCharacterVoices(value, characters) {
  const raw = value && typeof value === "object" ? value : {};
  const rawCharacters = raw.characters && typeof raw.characters === "object" ? raw.characters : {};
  const characterVoiceMap = {};
  for (const character of characters) {
    const explicit = normalizeVoiceConfig(rawCharacters[character.character_id]) || character.voice;
    if (explicit) characterVoiceMap[character.character_id] = explicit;
  }
  const narrator = normalizeVoiceConfig(raw.narrator) || {
    voiceProvider: "system",
    voiceId: null,
    voiceName: "Narrator",
    audioStyle: "cinematic narrator",
    settings: null
  };
  if (!Object.keys(characterVoiceMap).length && !narrator) return void 0;
  return {
    narrator,
    characters: characterVoiceMap
  };
}
function decodeBase64Url(payload) {
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  if (typeof atob === "function") return decodeURIComponent(escape(atob(padded)));
  return Buffer.from(padded, "base64").toString("utf8");
}
function decodeTreyStoryText(raw) {
  const text = raw.replace(/^\uFEFF/, "").trim();
  if (!text) throw new TreyStoryPackageError("This .ttstory file is empty.");
  if (text.startsWith("TTS1:")) return decodeBase64Url(text.slice(5).trim());
  if (/^data:/i.test(text)) {
    const comma = text.indexOf(",");
    if (comma === -1) throw new TreyStoryPackageError("Invalid .ttstory data URI.");
    const header = text.slice(0, comma).toLowerCase();
    const body = text.slice(comma + 1).trim();
    if (header.includes(";base64")) return decodeBase64Url(body);
    return decodeURIComponent(body);
  }
  return text;
}
function getSceneLines(scene) {
  const lines = scene.lines || scene.dialogue || scene.beats || [];
  if (!Array.isArray(lines)) return [];
  return lines.filter((line) => line && typeof line === "object" && typeof line.text === "string" && line.text.trim()).map((line, index) => ({
    ...line,
    id: line.id || `line_${index + 1}`,
    text: line.text.trim(),
    voice: normalizeVoiceConfig(line.voice),
    lineIndex: typeof line.lineIndex === "number" ? line.lineIndex : index
  })).sort((a, b) => (a.lineIndex || 0) - (b.lineIndex || 0));
}
function sceneToProse(scene) {
  if (typeof scene.narration === "string" && scene.narration.trim()) return scene.narration.trim();
  const lines = getSceneLines(scene);
  if (!lines.length) return "";
  return lines.map((line) => {
    const speaker = line.character_id || line.characterId || line.speakerId || line.speakerName;
    const isDialogue = line.type === "dialogue" || !!speaker && speaker !== "narrator";
    if (!isDialogue) return line.text.trim();
    const label = line.speakerName || speaker;
    return `${label}: "${line.text.trim()}"`;
  }).join("\n\n");
}
function normalizeCharacters(characters) {
  if (!Array.isArray(characters) || characters.length === 0) {
    throw new TreyStoryPackageError("A .ttstory file needs at least one character.");
  }
  const seen = /* @__PURE__ */ new Set();
  return characters.map((raw, index) => {
    const item = raw;
    const characterId = normalizeMachineId(item.character_id || item.id || item.name, `character_${index + 1}`);
    if (seen.has(characterId)) throw new TreyStoryPackageError(`Duplicate character_id: ${characterId}.`);
    seen.add(characterId);
    const displayName = item.display_name || item.name || characterId.replace(/_/g, " ");
    return {
      character_id: characterId,
      display_name: cleanText(String(displayName)),
      role: cleanText(String(item.role || "Character")),
      portrait: normalizeAssetPath(item.portrait || item.image || characterId, "characters"),
      voice_key: item.voice_key,
      voice: normalizeVoiceConfig(item.voice),
      short_description: item.short_description ? cleanText(item.short_description) : void 0
    };
  });
}
function normalizeChoice(rawChoice, sceneId, index, sceneIds) {
  const choice = rawChoice;
  const id = normalizeMachineId(choice.id || choice.text || `choice_${index + 1}`, `${sceneId}_choice_${index + 1}`);
  const nextSceneId = String(choice.nextSceneId || choice.next_scene_id || choice.next || "").trim();
  assertString(nextSceneId, `choice ${id}.nextSceneId`);
  if (!sceneIds.has(nextSceneId)) {
    throw new TreyStoryPackageError(`choice ${id} points to missing scene ${nextSceneId}.`);
  }
  return {
    id,
    label: typeof choice.label === "string" && choice.label.trim() ? choice.label.trim() : CHOICE_LABELS[index] || String(index + 1),
    text: cleanText(String(choice.text || "Continue")),
    tone: normalizeTone(choice.tone),
    nextSceneId,
    stateDelta: normalizeStateDelta(choice.stateDelta),
    affectedCharacterIds: Array.isArray(choice.affectedCharacterIds) ? choice.affectedCharacterIds.map((idValue) => normalizeMachineId(idValue)).filter(Boolean) : void 0,
    relationshipImpactType: choice.relationshipImpactType,
    impactSummary: choice.impactSummary || choice.impact_summary ? cleanText(String(choice.impactSummary || choice.impact_summary)) : void 0
  };
}
function normalizeStateDelta(value) {
  if (!value || typeof value !== "object") return void 0;
  const delta = value;
  const normalized = {};
  for (const key of Object.keys(INITIAL_METERS)) {
    const n = Number(delta[key]);
    if (Number.isFinite(n) && n !== 0) normalized[key] = n;
  }
  return Object.keys(normalized).length ? normalized : void 0;
}
function normalizeScenes(scenes, initialSceneId) {
  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new TreyStoryPackageError("A .ttstory file needs at least one scene.");
  }
  const sceneIds = /* @__PURE__ */ new Set();
  const firstPass = scenes.map((raw, index) => {
    const item = raw;
    const id = String(item.id || item.scene_id || `scene_${index + 1}`).trim();
    assertString(id, `scene ${index + 1}.id`);
    if (sceneIds.has(id)) throw new TreyStoryPackageError(`Duplicate scene id: ${id}.`);
    sceneIds.add(id);
    return { item, id };
  });
  if (!sceneIds.has(initialSceneId)) {
    throw new TreyStoryPackageError("story.initialSceneId does not match any scene id.");
  }
  return firstPass.map(({ item, id }, index) => {
    const title = cleanText(String(item.title || `Scene ${index + 1}`));
    const lines = getSceneLines(item);
    const narrationRaw = sceneToProse(item);
    const narration = cleanText(narrationRaw);
    if (!narration) throw new TreyStoryPackageError(`scene ${id} needs narration or lines.`);
    return {
      id,
      title,
      narration,
      lines: lines.length ? lines.map((l) => ({ ...l, text: cleanText(l.text) })) : void 0,
      image: normalizeAssetPath(item.image || item.image_key || id, "scenes"),
      imageFit: item.imageFit || item.image_fit || "cover",
      imagePosition: item.imagePosition || item.image_position || "center 35%",
      activeCharacterIds: Array.isArray(item.activeCharacterIds || item.active_characters) ? (item.activeCharacterIds || item.active_characters || []).map((v) => normalizeMachineId(v)).filter(Boolean) : void 0,
      choices: Array.isArray(item.choices) ? item.choices.map((choice, choiceIndex) => normalizeChoice(choice, id, choiceIndex, sceneIds)) : void 0,
      isEnding: !!item.isEnding,
      endingTitle: item.endingTitle ? cleanText(item.endingTitle) : void 0,
      endingTagline: item.endingTagline ? cleanText(item.endingTagline) : void 0,
      endingSummary: item.endingSummary ? cleanText(item.endingSummary) : void 0
    };
  });
}
function parseTreyStoryPackage(raw) {
  let data;
  try {
    data = JSON.parse(decodeTreyStoryText(raw));
  } catch (error) {
    if (error instanceof TreyStoryPackageError) throw error;
    throw new TreyStoryPackageError("This is not a valid .ttstory file. It must be valid JSON or a TTS1 encoded JSON package.");
  }
  const pkg = data;
  const fileType = pkg.fileType || pkg.file_type || pkg.type;
  if (fileType !== TREY_STORY_FILE_TYPE) {
    throw new TreyStoryPackageError(`Invalid fileType. Expected "${TREY_STORY_FILE_TYPE}".`);
  }
  if (!pkg.story || typeof pkg.story !== "object") throw new TreyStoryPackageError("Missing story object.");
  assertString(pkg.story.id, "story.id");
  assertString(pkg.story.title, "story.title");
  assertString(pkg.story.initialSceneId, "story.initialSceneId");
  const storyRecord = pkg.story;
  const characters = normalizeCharacters(pkg.characters || storyRecord.characters);
  const scenes = normalizeScenes(pkg.scenes || storyRecord.scenes, pkg.story.initialSceneId);
  const characterVoices = normalizeCharacterVoices(pkg.story.characterVoices || storyRecord.character_voices, characters);
  return {
    fileType: TREY_STORY_FILE_TYPE,
    formatVersion: String(pkg.formatVersion || TREY_STORY_FORMAT_VERSION),
    story: {
      id: normalizeMachineId(pkg.story.id, "story"),
      title: cleanText(pkg.story.title),
      slug: normalizeMachineId(pkg.story.slug || pkg.story.title || pkg.story.id, pkg.story.id).replace(/_/g, "-"),
      genre: pkg.story.genre ? cleanText(pkg.story.genre) : void 0,
      description: pkg.story.description ? cleanText(pkg.story.description) : void 0,
      coverImage: normalizeAssetPath(pkg.story.coverImage || scenes[0]?.image, "scenes"),
      initialSceneId: pkg.story.initialSceneId,
      initialMeters: normalizeInitialMeters(pkg.story.initialMeters),
      characterVoices
    },
    characters,
    scenes
  };
}
function normalizeInitialMeters(value) {
  if (!value || typeof value !== "object") return void 0;
  const meters = value;
  const normalized = {};
  for (const key of Object.keys(INITIAL_METERS)) {
    const n = Number(meters[key]);
    if (Number.isFinite(n)) normalized[key] = clamp(n);
  }
  return Object.keys(normalized).length ? normalized : void 0;
}
function loadInstalledStoryPackages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY$1);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.filter((x) => x?.fileType === TREY_STORY_FILE_TYPE);
  } catch {
    return [];
  }
}
function saveInstalledStoryPackages(list) {
  localStorage.setItem(STORAGE_KEY$1, JSON.stringify(list));
}
function normalizeStorySlug(slug) {
  const normalized = normalizeMachineId(slug, "story").replace(/_/g, "-");
  if (normalized === "the-god-ram") return "the-god-ram-book-one";
  return normalized;
}
function findInstalledStoryPackageBySlug(slug) {
  const normalized = normalizeStorySlug(slug);
  return loadInstalledStoryPackages().find((pkg) => pkg.story.slug === normalized) || null;
}
async function loadBundledStoryPackages() {
  const packages = [];
  for (const source of BUNDLED_STORY_SOURCES) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new TreyStoryPackageError(`Bundled story package could not be loaded: ${source}`);
    }
    packages.push(parseTreyStoryPackage(await response.text()));
  }
  return packages;
}
async function ensureBundledStoryPackagesInstalled() {
  const bundled = await loadBundledStoryPackages();
  const installed = loadInstalledStoryPackages();
  const merged = [
    ...bundled,
    ...installed.filter((pkg) => !bundled.some((story) => story.story.id === pkg.story.id))
  ];
  saveInstalledStoryPackages(merged);
  return merged;
}
function installTreyStoryPackage(pkg) {
  const current = loadInstalledStoryPackages();
  const next = [pkg, ...current.filter((x) => x.story.id !== pkg.story.id)];
  saveInstalledStoryPackages(next);
  return next;
}
function getInstalledStoryPackage(storyId) {
  return loadInstalledStoryPackages().find((pkg) => pkg.story.id === storyId) || null;
}
async function installTreyStoryFile(file) {
  if (!file.name.toLowerCase().endsWith(TREY_STORY_FILE_EXTENSION)) {
    throw new TreyStoryPackageError(`Upload a ${TREY_STORY_FILE_EXTENSION} story package.`);
  }
  const raw = await file.text();
  const pkg = parseTreyStoryPackage(raw);
  return installTreyStoryPackage(pkg);
}
function toBranchChoice(choice) {
  return {
    id: choice.id,
    label: choice.label,
    text: choice.text,
    tone: choice.tone,
    nextSceneId: choice.nextSceneId,
    stateDelta: choice.stateDelta,
    affectedCharacterIds: choice.affectedCharacterIds,
    relationshipImpactType: choice.relationshipImpactType
  };
}
function continueChoiceForScene(pkg, scene) {
  const currentIndex = pkg.scenes.findIndex((candidate) => candidate.id === scene.id);
  const nextScene = currentIndex >= 0 ? pkg.scenes[currentIndex + 1] : void 0;
  if (!nextScene) return void 0;
  return [
    {
      id: `${scene.id}_continue`,
      label: "Continue",
      text: "Step deeper into the story.",
      tone: "Bold",
      nextSceneId: nextScene.id
    }
  ];
}
function createBranchFromStoryPackage(pkg) {
  const first = pkg.scenes.find((scene) => scene.id === pkg.story.initialSceneId) || pkg.scenes[0];
  const now = Date.now();
  const meters = {
    ...INITIAL_METERS,
    ...pkg.story.initialMeters
  };
  for (const key of Object.keys(meters)) {
    meters[key] = clamp(Number(meters[key]));
  }
  const branchId = `branch_${pkg.story.id}_${now}_${Math.floor(Math.random() * 1e3)}`;
  return {
    id: branchId,
    storyId: pkg.story.id,
    createdAt: now,
    updatedAt: now,
    chapters: [
      {
        number: 1,
        title: `Chapter 1 — ${first.title}`,
        prose: first.narration || sceneToProse(first),
        image: first.image || pkg.story.coverImage,
        imageFit: first.imageFit,
        imagePosition: first.imagePosition,
        sceneId: first.id,
        voiceLines: first.lines,
        characterVoices: pkg.story.characterVoices,
        storyCharacters: pkg.characters,
        summary: (first.endingSummary || first.narration || sceneToProse(first)).slice(0, 220)
      }
    ],
    meters,
    flags: {
      installed_story: true,
      current_scene_id: first.id,
      story_slug: pkg.story.slug
    },
    secrets: {},
    toneHistory: [],
    isComplete: !!first.isEnding,
    ending: first.isEnding ? {
      name: first.endingTitle || first.title,
      tagline: first.endingTagline || first.endingSummary || "Your story reached an ending.",
      unlockedAt: now,
      branchId
    } : void 0,
    pendingStopPoint: first.choices?.length ? {
      prompt: "What happens next?",
      choices: first.choices.map(toBranchChoice)
    } : continueChoiceForScene(pkg, first) ? {
      prompt: "Keep going.",
      choices: continueChoiceForScene(pkg, first) || []
    } : void 0
  };
}
function resolveInstalledStoryChoice(branch, choice) {
  const pkg = getInstalledStoryPackage(branch.storyId);
  if (!pkg) return null;
  const targetSceneId = choice.nextSceneId || String(branch.flags.current_scene_id || pkg.story.initialSceneId);
  const scene = pkg.scenes.find((s) => s.id === targetSceneId);
  if (!scene) return null;
  const prose = scene.narration || sceneToProse(scene);
  return {
    prose,
    image: scene.image || pkg.story.coverImage,
    imageFit: scene.imageFit,
    imagePosition: scene.imagePosition,
    sceneId: scene.id,
    voiceLines: scene.lines,
    characterVoices: pkg.story.characterVoices,
    storyCharacters: pkg.characters,
    state_delta: choice.stateDelta || {},
    tone_tag: choice.tone || "Bold",
    chapter_title: scene.title,
    chapter_summary: scene.endingSummary || prose.slice(0, 220),
    is_ending: !!scene.isEnding || !scene.choices?.length && !continueChoiceForScene(pkg, scene)?.length,
    ending_unlocked: scene.isEnding ? scene.endingTitle || scene.title : null,
    ending_tagline: scene.isEnding ? scene.endingTagline || scene.endingSummary || null : null,
    next_stop_point: scene.choices?.length ? { prompt: "What happens next?", choices: scene.choices.map(toBranchChoice) } : continueChoiceForScene(pkg, scene)?.length ? { prompt: "Keep going.", choices: continueChoiceForScene(pkg, scene) || [] } : null
  };
}
let _client = null;
function getClient() {
  if (!_client) {
    try {
      _client = createBrowserClient();
    } catch {
      console.warn("[InteractiveStories] Supabase client unavailable — local-only mode.");
      return null;
    }
  }
  return _client;
}
const supabase = new Proxy({}, {
  get(_target, prop) {
    const client = getClient();
    if (!client) {
      if (prop === "from") return () => ({ select: () => ({ data: null, error: null }), upsert: () => ({ data: null, error: null }), insert: () => ({ data: null, error: null }), delete: () => ({ eq: () => ({ data: null, error: null }) }) });
      if (prop === "auth") return { getSession: () => Promise.resolve({ data: { session: null } }) };
      if (prop === "functions") return { invoke: () => Promise.resolve({ data: null, error: new Error("Supabase unavailable") }) };
      return void 0;
    }
    return client[prop];
  }
});
const STORAGE_KEY = "switchkicks_branches_v1";
const ENDINGS_KEY = "switchkicks_endings_v1";
function loadBranches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveBranches(branches) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
}
function loadEndings() {
  try {
    const raw = localStorage.getItem(ENDINGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveEnding(ending) {
  const endings = loadEndings();
  endings.push(ending);
  localStorage.setItem(ENDINGS_KEY, JSON.stringify(endings));
}
function createNewBranch() {
  const chapter1 = {
    number: 1,
    title: CHAPTER_1.title,
    prose: CHAPTER_1.paragraphs.join("\n\n"),
    image: CHAPTER_1.image,
    sceneId: CHAPTER_1.sceneId,
    summary: "Malik confesses he ingested edibles and begs Micah to switch places with him for the day. Micah agrees.",
    toneTag: void 0
  };
  const branch = {
    id: `branch_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
    storyId: "switch_kicks",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    chapters: [chapter1],
    meters: { ...INITIAL_METERS },
    flags: {
      switch_revealed_to_ari: false,
      switch_revealed_to_dante: false,
      switch_revealed_to_coach: false,
      switch_revealed_to_mom: false,
      malik_passed_test: "pending",
      micah_did_adjudication: false
    },
    secrets: {
      the_switch: { known_by: ["Malik", "Micah"], suspected_by: [] },
      malik_party_night: { known_by: ["Malik"], suspected_by: [] }
    },
    toneHistory: [],
    isComplete: false,
    pendingStopPoint: {
      prompt: "Micah has to decide. What happens next?",
      choices: CHAPTER_1_CHOICES
    }
  };
  const all = loadBranches();
  all.unshift(branch);
  saveBranches(all);
  return branch;
}
function updateBranch(branch) {
  const all = loadBranches();
  const idx = all.findIndex((b) => b.id === branch.id);
  branch.updatedAt = Date.now();
  if (idx >= 0) all[idx] = branch;
  else all.unshift(branch);
  saveBranches(all);
}
function deleteBranch(id) {
  const all = loadBranches().filter((b) => b.id !== id);
  saveBranches(all);
}
function applyDelta(meters, delta) {
  const clamp2 = (n) => Math.max(0, Math.min(100, n));
  return {
    trust_ari: clamp2(meters.trust_ari + (delta.trust_ari || 0)),
    trust_dante: clamp2(meters.trust_dante + (delta.trust_dante || 0)),
    trust_malik_to_micah: clamp2(meters.trust_malik_to_micah + (delta.trust_malik_to_micah || 0)),
    trust_micah_to_malik: clamp2(meters.trust_micah_to_malik + (delta.trust_micah_to_malik || 0)),
    suspicion_mom: clamp2(meters.suspicion_mom + (delta.suspicion_mom || 0)),
    suspicion_coach: clamp2(meters.suspicion_coach + (delta.suspicion_coach || 0)),
    suspicion_valentina: clamp2(meters.suspicion_valentina + (delta.suspicion_valentina || 0)),
    risk_level: clamp2(meters.risk_level + (delta.risk_level || 0))
  };
}
async function generateNextChapter(branch, choice) {
  const installedResult = resolveInstalledStoryChoice(branch, choice);
  if (installedResult) {
    return {
      prose: installedResult.prose,
      image: installedResult.image,
      imageFit: installedResult.imageFit,
      imagePosition: installedResult.imagePosition,
      sceneId: installedResult.sceneId,
      voiceLines: installedResult.voiceLines,
      characterVoices: installedResult.characterVoices,
      storyCharacters: installedResult.storyCharacters,
      state: {
        state_delta: installedResult.state_delta,
        tone_tag: installedResult.tone_tag,
        chapter_title: installedResult.chapter_title,
        chapter_summary: installedResult.chapter_summary,
        is_ending: installedResult.is_ending,
        ending_unlocked: installedResult.ending_unlocked,
        ending_tagline: installedResult.ending_tagline,
        next_stop_point: installedResult.next_stop_point
      }
    };
  }
  const lastChapter = branch.chapters[branch.chapters.length - 1];
  const summaries = branch.chapters.slice(-3).map((c) => c.summary || "").filter(Boolean);
  const context = {
    chapter_number: lastChapter.number,
    meters: branch.meters,
    flags: branch.flags,
    tone_history: branch.toneHistory.slice(-5),
    summaries
  };
  const { data, error } = await supabase.functions.invoke("switch-kicks-story", {
    body: { choice, context }
  });
  if (error) throw error;
  return data;
}
function pickChapterImage(toneTag, index = 0, sceneText = "") {
  const text = sceneText.toLowerCase();
  if (/compliance|test|officer|folder|office/.test(text)) return "/interactive-stories/scenes/compliance_office.png";
  if (/locker|reggie|teammate|football country/.test(text)) return "/interactive-stories/scenes/micah_enters_locker_room.png";
  if (/ari|partner|rehearsal|chemistry|dance with/.test(text)) return "/interactive-stories/scenes/ari_partner_rehearsal.png";
  if (/adjudication|solo|panel|ms\.? valentina|black-box|ballet piece/.test(text)) return "/interactive-stories/scenes/ballet_adjudication.png";
  if (/showcase|scout|route|catch|field|practice|coach/.test(text)) return "/interactive-stories/scenes/football_showcase.png";
  if (/truth|reveal|costume|storage|secret|discover|figured/.test(text)) return "/interactive-stories/scenes/truth_reveal.png";
  if (/denise|mother|mom|consequence|punishment/.test(text)) return "/interactive-stories/scenes/consequences_meeting.png";
  if (/switch|vending|hallway|clothes|identit/.test(text)) return "/interactive-stories/scenes/hallway_switch.png";
  if (/studio b|request|beg|favor/.test(text)) return "/interactive-stories/scenes/studio_b_request.png";
  const pool = [
    IMAGES.lockerRoom,
    IMAGES.ariStudio,
    IMAGES.danteDoorway,
    IMAGES.coachOffice,
    IMAGES.valentinaStudio,
    IMAGES.footballDive,
    IMAGES.adjudication,
    IMAGES.costumeRoom,
    IMAGES.twinsCover
  ];
  if (toneTag === "Romantic") return IMAGES.ariStudio;
  if (toneTag === "Risky") return IMAGES.danteDoorway;
  if (toneTag === "Bold") return IMAGES.footballDive;
  if (toneTag === "Safe") return IMAGES.coachOffice;
  if (toneTag === "Funny") return IMAGES.lockerRoom;
  return pool[index % pool.length];
}
function createCustomStoryBranch(prompt, tone) {
  const chapter1 = {
    number: 1,
    title: "Chapter 1 — The Custom Spark",
    prose: `Your custom adventure begins here. Driven by a singular premise: "${prompt}". You step forward into this new reality, knowing that every single choice will determine how this path unfolds.`,
    image: IMAGES.twinsCover,
    sceneId: "custom_scene_1",
    summary: `Started custom story with premise: "${prompt}"`,
    toneTag: tone
  };
  const branch = {
    id: `branch_custom_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
    storyId: "switch_kicks",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    chapters: [chapter1],
    meters: { ...INITIAL_METERS },
    flags: {
      custom_story: true,
      custom_premise: prompt,
      custom_tone: tone
    },
    secrets: {},
    toneHistory: [tone],
    isComplete: false,
    pendingStopPoint: {
      prompt: "How do you want to kick off this adventure?",
      choices: [
        { id: "c1", label: "A", text: "Step up with confidence and set a bold new standard.", tone: "Bold", nextSceneId: "custom_scene_2" },
        { id: "c2", label: "B", text: "Observe carefully and look for hidden risks first.", tone: "Risky", nextSceneId: "custom_scene_2" },
        { id: "c3", label: "C", text: "Break the ice with a clever, lighthearted approach.", tone: "Funny", nextSceneId: "custom_scene_2" }
      ]
    }
  };
  const all = loadBranches();
  all.unshift(branch);
  saveBranches(all);
  return branch;
}
const META_KEY = "trey_playthroughs_meta_v1";
function loadMetaAll() {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveMetaAll(all) {
  localStorage.setItem(META_KEY, JSON.stringify(all));
}
const STORY_TITLES = {
  switch_kicks: "Switch Kicks"
};
const STORY_COVERS = {
  switch_kicks: "/interactive-stories/scenes/twins_cover.png"
};
function getStoryCover(storyId) {
  const installed = getInstalledStoryPackage(storyId);
  return installed?.story.coverImage || STORY_COVERS[storyId] || STORY_COVERS.switch_kicks;
}
function getStoryTitle(storyId) {
  const installed = getInstalledStoryPackage(storyId);
  return installed?.story.title || STORY_TITLES[storyId] || "Untitled Story";
}
function computeRelationshipStats(b) {
  const m = b.meters;
  return {
    twin_bond: Math.round((m.trust_malik_to_micah + m.trust_micah_to_malik) / 2),
    ari_connection: m.trust_ari,
    dante_trust: m.trust_dante,
    denise_suspicion: m.suspicion_mom,
    coach_risk: m.suspicion_coach,
    ms_valentina_confidence: 100 - m.suspicion_valentina,
    reggie_respect: 60 + Math.min(40, Math.round((m.trust_malik_to_micah - 60) * 0.5)),
    compliance_pressure: m.risk_level,
    malik_pressure: m.risk_level,
    micah_stress: Math.round((m.risk_level + m.suspicion_valentina) / 2),
    secret_exposure: Math.round(
      (m.suspicion_mom + m.suspicion_coach + m.suspicion_valentina) / 3
    ),
    school_risk: Math.round((m.suspicion_coach + m.risk_level) / 2)
  };
}
function computeStoryStatusStats(b) {
  const tones = b.toneHistory;
  const count = (t) => tones.filter((x) => x === t).length;
  return {
    comedy_chaos: Math.min(100, count("Funny") * 18 + count("Bold") * 6),
    honesty_level: Math.max(0, 100 - b.meters.suspicion_mom - b.meters.suspicion_coach / 2),
    romance_heat: Math.min(100, count("Romantic") * 20 + b.meters.trust_ari / 2),
    performance_momentum: Math.min(100, count("Bold") * 18 + (100 - b.meters.risk_level) / 2)
  };
}
function inferBranchTitle(b) {
  const last = b.chapters[b.chapters.length - 1];
  if (b.ending) return b.ending.name;
  if (last?.toneTag === "Romantic") return "The Soft Path";
  if (last?.toneTag === "Risky") return "The Risk Spiral";
  if (last?.toneTag === "Bold") return "The Bold Move";
  if (last?.toneTag === "Funny") return "The Chaos Route";
  if (last?.toneTag === "Safe") return "The Honest Road";
  return "Day One";
}
const TARGET_CHAPTERS = 8;
function computeProgressPercent(b) {
  if (b.isComplete) return 100;
  return Math.min(95, Math.round(b.chapters.length / TARGET_CHAPTERS * 100));
}
function generateSlug() {
  return Math.random().toString(36).slice(2, 8) + "-" + Math.random().toString(36).slice(2, 6);
}
function getOrCreateMeta(branch, userUid) {
  const all = loadMetaAll();
  const existing = all[branch.id];
  if (existing) return existing;
  const meta = {
    id: branch.id,
    user_uid: userUid,
    story_id: branch.storyId,
    story_title: getStoryTitle(branch.storyId),
    playthrough_name: "New Playthrough",
    current_scene_id: branch.chapters[branch.chapters.length - 1]?.sceneId || `chapter_${branch.chapters.length}`,
    current_chapter: branch.chapters.length,
    current_choice_node: branch.pendingStopPoint ? `stop_${branch.chapters.length}` : null,
    progress_percent: computeProgressPercent(branch),
    branch_title: inferBranchTitle(branch),
    selected_branch_path: branch.chapters.map((c) => c.choiceMade?.label || "").filter(Boolean),
    status: branch.isComplete ? "completed" : "active",
    relationship_stats: computeRelationshipStats(branch),
    story_status_stats: computeStoryStatusStats(branch),
    unlocked_scenes: branch.chapters.map((c, i) => c.sceneId || `chapter_${i + 1}`),
    unlocked_endings: branch.ending ? [branch.ending.name] : [],
    created_at: branch.createdAt,
    updated_at: branch.updatedAt,
    completed_at: branch.isComplete ? branch.updatedAt : null,
    ending_id: branch.ending ? branch.ending.name : null,
    ending_title: branch.ending?.name || null,
    ending_summary: branch.ending?.tagline || null,
    share_enabled: false,
    public_share_slug: null
  };
  all[branch.id] = meta;
  saveMetaAll(all);
  return meta;
}
function syncMetaFromBranch(branch, userUid) {
  const all = loadMetaAll();
  const prev = all[branch.id] || getOrCreateMeta(branch, userUid);
  const next = {
    ...prev,
    user_uid: userUid ?? prev.user_uid,
    story_title: getStoryTitle(branch.storyId),
    current_chapter: branch.chapters.length,
    current_scene_id: branch.chapters[branch.chapters.length - 1]?.sceneId || `chapter_${branch.chapters.length}`,
    current_choice_node: branch.pendingStopPoint ? `stop_${branch.chapters.length}` : null,
    progress_percent: computeProgressPercent(branch),
    branch_title: inferBranchTitle(branch),
    selected_branch_path: branch.chapters.map((c) => c.choiceMade?.label || "").filter(Boolean),
    status: branch.isComplete ? "completed" : "active",
    relationship_stats: computeRelationshipStats(branch),
    story_status_stats: computeStoryStatusStats(branch),
    unlocked_scenes: branch.chapters.map((c, i) => c.sceneId || `chapter_${i + 1}`),
    unlocked_endings: branch.ending ? [branch.ending.name] : prev.unlocked_endings,
    updated_at: branch.updatedAt,
    completed_at: branch.isComplete ? branch.updatedAt : null,
    ending_id: branch.ending?.name || null,
    ending_title: branch.ending?.name || null,
    ending_summary: branch.ending?.tagline || null
  };
  all[branch.id] = next;
  saveMetaAll(all);
  if (userUid) pushToSupabase(next).catch(() => {
  });
  return next;
}
function listMeta(userUid) {
  const all = loadMetaAll();
  for (const b of loadBranches()) {
    if (!all[b.id]) all[b.id] = getOrCreateMeta(b, userUid);
  }
  saveMetaAll(all);
  return Object.values(all).sort((a, b) => b.updated_at - a.updated_at);
}
function renamePlaythrough(id, name, userUid) {
  const all = loadMetaAll();
  if (!all[id]) return;
  all[id] = { ...all[id], playthrough_name: name, updated_at: Date.now() };
  saveMetaAll(all);
  if (userUid) pushToSupabase(all[id]).catch(() => {
  });
}
function deletePlaythroughMeta(id, userUid) {
  const all = loadMetaAll();
  delete all[id];
  saveMetaAll(all);
  if (userUid) {
    supabase.from("user_story_playthroughs").delete().eq("id", id).then(() => {
    });
  }
}
async function enableShare(id, userUid) {
  const all = loadMetaAll();
  const meta = all[id];
  if (!meta) throw new Error("Playthrough not found");
  const slug = meta.public_share_slug || generateSlug();
  const next = {
    ...meta,
    share_enabled: true,
    public_share_slug: slug,
    updated_at: Date.now()
  };
  all[id] = next;
  saveMetaAll(all);
  if (userUid) {
    await pushToSupabase(next);
    if (next.ending_title) {
      await supabase.from("shared_story_endings").upsert({
        id: `share_${id}`,
        playthrough_id: id,
        user_uid: userUid,
        story_id: next.story_id,
        ending_id: next.ending_id,
        ending_title: next.ending_title,
        ending_summary: next.ending_summary,
        ending_card_image: getStoryCover(next.story_id),
        share_slug: slug,
        is_public: true
      }, { onConflict: "id" });
    }
  }
  return slug;
}
async function disableShare(id, userUid) {
  const all = loadMetaAll();
  const meta = all[id];
  if (!meta) return;
  const next = { ...meta, share_enabled: false, updated_at: Date.now() };
  all[id] = next;
  saveMetaAll(all);
  if (userUid) await pushToSupabase(next);
}
async function pushToSupabase(meta) {
  if (!meta.user_uid) return;
  await supabase.from("user_story_playthroughs").upsert({
    id: meta.id,
    user_uid: meta.user_uid,
    story_id: meta.story_id,
    story_title: meta.story_title,
    playthrough_name: meta.playthrough_name,
    current_scene_id: meta.current_scene_id,
    current_chapter: meta.current_chapter,
    current_choice_node: meta.current_choice_node,
    progress_percent: meta.progress_percent,
    branch_title: meta.branch_title,
    selected_branch_path: meta.selected_branch_path,
    status: meta.status,
    relationship_stats: meta.relationship_stats,
    story_status_stats: meta.story_status_stats,
    unlocked_scenes: meta.unlocked_scenes,
    unlocked_endings: meta.unlocked_endings,
    created_at: new Date(meta.created_at).toISOString(),
    updated_at: new Date(meta.updated_at).toISOString(),
    completed_at: meta.completed_at ? new Date(meta.completed_at).toISOString() : null,
    ending_id: meta.ending_id,
    ending_title: meta.ending_title,
    ending_summary: meta.ending_summary,
    share_enabled: meta.share_enabled,
    public_share_slug: meta.public_share_slug
  }, { onConflict: "id" });
}
async function recordChoiceEvent(opts) {
  if (!opts.userUid) return;
  await supabase.from("user_story_choice_events").insert({
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    playthrough_id: opts.playthroughId,
    user_uid: opts.userUid,
    scene_id: `chapter_${opts.chapterNumber}`,
    choice_id: opts.choiceLabel || null,
    choice_text: opts.choiceText,
    chapter_number: opts.chapterNumber,
    stat_changes: opts.statChanges,
    tone_label: opts.toneLabel || null
  });
}
function replayFromChapter(branchId, chapterNumber) {
  const branches = loadBranches();
  const idx = branches.findIndex((b2) => b2.id === branchId);
  if (idx < 0) return;
  const b = branches[idx];
  const trimmed = b.chapters.slice(0, chapterNumber);
  branches[idx] = {
    ...b,
    chapters: trimmed,
    isComplete: false,
    ending: void 0,
    pendingStopPoint: void 0,
    updatedAt: Date.now(),
    toneHistory: b.toneHistory.slice(0, chapterNumber)
  };
  saveBranches(branches);
}
async function fetchSharedBySlug(slug) {
  const { data, error } = await supabase.from("shared_story_endings").select("*").eq("share_slug", slug).maybeSingle();
  if (error || !data) {
    const { data: pt } = await supabase.from("user_story_playthroughs").select("*").eq("public_share_slug", slug).eq("share_enabled", true).maybeSingle();
    return pt;
  }
  return data;
}
const playthroughs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  deletePlaythroughMeta,
  disableShare,
  enableShare,
  fetchSharedBySlug,
  generateSlug,
  getOrCreateMeta,
  getStoryCover,
  getStoryTitle,
  listMeta,
  recordChoiceEvent,
  renamePlaythrough,
  replayFromChapter,
  syncMetaFromBranch
}, Symbol.toStringTag, { value: "Module" }));
const PlaythroughsScreen = ({
  branches,
  onContinue,
  onReplayFrom,
  onDelete,
  onShareEnding
}) => {
  const { user } = useAuth$1();
  const userUid = user?.uid || null;
  const [metas, setMetas] = reactExports.useState([]);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [editName, setEditName] = reactExports.useState("");
  const [replayingId, setReplayingId] = reactExports.useState(null);
  const refresh = () => {
    for (const b of branches) syncMetaFromBranch(b, userUid);
    setMetas(listMeta(userUid));
  };
  reactExports.useEffect(() => {
    refresh();
  }, [branches.length, userUid]);
  const activeCount = reactExports.useMemo(() => metas.filter((m) => m.status === "active").length, [metas]);
  const completedCount = reactExports.useMemo(() => metas.filter((m) => m.status === "completed").length, [metas]);
  const handleRename = (id) => {
    const m = metas.find((x) => x.id === id);
    if (!m) return;
    setEditingId(id);
    setEditName(m.playthrough_name);
  };
  const commitRename = () => {
    if (editingId && editName.trim()) {
      renamePlaythrough(editingId, editName.trim(), userUid);
      toast("Playthrough renamed.");
    }
    setEditingId(null);
  };
  const handleShareToggle = async (m) => {
    if (m.share_enabled) {
      await disableShare(m.id, userUid);
      toast("Sharing turned off — your playthrough is private again.");
    } else {
      const slug = await enableShare(m.id, userUid);
      const url = `${window.location.origin}/games/interactive-stories/share/${slug}`;
      try {
        await navigator.clipboard.writeText(url);
        toast("Share link copied to clipboard.");
      } catch {
        toast(`Share link ready: ${url}`);
      }
      onShareEnding(m.id);
    }
    refresh();
  };
  const handleDelete = (id) => {
    if (!confirm("Delete this playthrough? This cannot be undone.")) return;
    deletePlaythroughMeta(id, userUid);
    onDelete(id);
    refresh();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen pb-28", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-5 pt-10 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400", children: "My Playthroughs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-4xl font-black tracking-tight text-white", children: "Saves" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-white/60", children: "Every path you've walked. Continue, replay from a choice, or share an ending." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "h-3 w-3" }),
            " Active"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-display text-2xl font-black text-white", children: activeCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }),
            " Endings"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-display text-2xl font-black text-amber-200", children: completedCount })
        ] })
      ] })
    ] }),
    metas.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-5 mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60", children: "No saved playthroughs yet. Start the story to create your first save." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 px-5", children: metas.map((m) => {
      const cover = getStoryCover(m.story_id);
      const isComplete = m.status === "completed";
      const lastChoice = m.selected_branch_path[m.selected_branch_path.length - 1];
      const topRel = Object.entries(m.relationship_stats).sort((a, b) => Math.abs(b[1] - 50) - Math.abs(a[1] - 50)).slice(0, 3);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-40 w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: cover, alt: m.story_title, className: "absolute inset-0 h-full w-full object-cover opacity-80" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 left-3 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-violet-600/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white", children: m.story_title }),
                isComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }),
                  " Ending"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] text-white/80 backdrop-blur", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                new Date(m.updated_at).toLocaleDateString()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 left-3 right-3", children: [
                editingId === m.id ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    autoFocus: true,
                    value: editName,
                    onChange: (e) => setEditName(e.target.value),
                    onBlur: commitRename,
                    onKeyDown: (e) => {
                      if (e.key === "Enter") commitRename();
                    },
                    className: "flex-1 rounded-lg border border-white/30 bg-black/60 px-2 py-1 text-sm text-white outline-none"
                  }
                ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl font-black leading-tight text-white drop-shadow-lg", children: m.playthrough_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-widest text-amber-300/90", children: m.branch_title })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Chapter ",
                    m.current_chapter
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    m.progress_percent,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-1.5 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `h-full rounded-full ${isComplete ? "bg-gradient-to-r from-amber-400 to-amber-600" : "bg-gradient-to-r from-violet-500 to-fuchsia-500"}`,
                    style: { width: `${m.progress_percent}%` }
                  }
                ) })
              ] }),
              lastChoice && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 px-3 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-white/50", children: "Last Major Choice" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-sm text-white/90", children: [
                  "Path ",
                  lastChoice
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: topRel.map(([key, val]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-[10px] text-white/70",
                  children: [
                    key.replace(/_/g, " "),
                    ": ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white", children: val })
                  ]
                },
                key
              )) }),
              isComplete && m.ending_summary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-500/30 bg-amber-500/5 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-300", children: "Final Ending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-display text-sm font-bold text-white", children: m.ending_title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xs italic text-white/70", children: m.ending_summary })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => onContinue(m.id),
                    className: "flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/30",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5 fill-current" }),
                      isComplete ? "Re-read" : "Continue"
                    ]
                  }
                ),
                isComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => handleShareToggle(m),
                    className: `flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-widest ${m.share_enabled ? "bg-emerald-600 text-white" : "border border-white/15 bg-white/5 text-white/80"}`,
                    children: [
                      m.share_enabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3.5 w-3.5" }),
                      m.share_enabled ? "Public" : "Share Ending"
                    ]
                  }
                ),
                !isComplete && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleShareToggle(m),
                    title: m.share_enabled ? "Make private" : "Share progress",
                    className: "flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white/70",
                    children: m.share_enabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleRename(m.id),
                    title: "Rename",
                    className: "flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white/70 hover:text-white",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setReplayingId(replayingId === m.id ? null : m.id),
                    title: "Replay from a choice",
                    className: "flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white/70 hover:text-white",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleDelete(m.id),
                    title: "Delete",
                    className: "flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-red-300 hover:bg-red-500/20",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                  }
                )
              ] }),
              replayingId === m.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/40 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-white/60", children: "Replay from chapter…" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setReplayingId(null),
                      className: "text-[10px] uppercase tracking-widest text-white/40",
                      children: "Cancel"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: Array.from({ length: m.current_chapter }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => {
                      onReplayFrom(m.id, i + 1);
                      setReplayingId(null);
                    },
                    className: "rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200 hover:bg-violet-500/20",
                    children: [
                      "Ch ",
                      i + 1
                    ]
                  },
                  i
                )) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[10px] text-white/40", children: "Replaying will rewind this playthrough and discard later chapters." })
              ] })
            ] })
          ]
        },
        m.id
      );
    }) })
  ] });
};
const SharedEndingScreen = ({ slug, onBack }) => {
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    (async () => {
      try {
        const mod = await Promise.resolve().then(() => playthroughs);
        const result = await mod.fetchSharedBySlug(slug);
        setData(result);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-black pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onBack,
        className: "fixed left-4 top-10 z-50 flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
          " Back"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pt-24", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-white/60", children: "Loading shared ending…" }) : !data ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70", children: "This shared ending isn't available — it may have been made private." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 to-black shadow-2xl shadow-amber-500/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-56", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: data.ending_card_image || data.cover_image || "https://d64gsuwffb70l.cloudfront.net/6a0575852fdc9c6f0e9154fd_1778778646387_303e8c18.png",
            alt: data.ending_title || data.branch_title,
            className: "absolute inset-0 h-full w-full object-cover"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300", children: "Trey TV • Shared Ending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-3xl font-black leading-tight text-white", children: data.ending_title || data.branch_title || "A Shared Ending" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-3", children: [
        data.ending_summary && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-serif text-base italic text-white/85", children: [
          '"',
          data.ending_summary,
          '"'
        ] }),
        data.display_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-white/50", children: [
          "Shared by ",
          data.display_name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onBack,
            className: "mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white",
            children: "Start your own playthrough"
          }
        )
      ] })
    ] }) })
  ] });
};
const PlaythroughsScreen$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PlaythroughsScreen,
  SharedEndingScreen
}, Symbol.toStringTag, { value: "Module" }));
export {
  recordChoiceEvent as A,
  PlaythroughsScreen$1 as B,
  CHARACTERS_BY_ID as C,
  IMAGES as I,
  PlaythroughsScreen as P,
  SharedEndingScreen as S,
  TONE_COLORS as T,
  CHARACTERS_BY_KEY as a,
  CHARACTER_PHOTO_MAP as b,
  CHARACTERS as c,
  getImageMeta as d,
  loadEndings as e,
  loadInstalledStoryPackages as f,
  getInstalledStoryPackage as g,
  ensureBundledStoryPackagesInstalled as h,
  inferAffectedCharacters as i,
  syncMetaFromBranch as j,
  findInstalledStoryPackageBySlug as k,
  loadBranches as l,
  createBranchFromStoryPackage as m,
  normalizeStorySlug as n,
  createNewBranch as o,
  CHAPTER_1_CHOICES as p,
  installTreyStoryFile as q,
  deleteBranch as r,
  supabase as s,
  replayFromChapter as t,
  updateBranch as u,
  createCustomStoryBranch as v,
  generateNextChapter as w,
  applyDelta as x,
  pickChapterImage as y,
  saveEnding as z
};
