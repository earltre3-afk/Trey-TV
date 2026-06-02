import {
  NaturalAbility,
  Scenario,
  SignalResult,
  SignalStrength,
  UserAnswer,
} from "@/types/naturalAbility";
import { getSignalBlend } from "./naturalAbilityResults";

const ALL_ABILITIES: NaturalAbility[] = [
  "Diviner",
  "Reaper",
  "Empath",
  "Charmer",
  "Alchemist",
  "Herbalist",
  "Seer",
  "Shapeshifter",
  "Healer",
  "Dreamer",
  "Prophet",
  "Ungifted",
  "Manifestor",
  "Creative",
];

function emptyScores(): Record<NaturalAbility, number> {
  return ALL_ABILITIES.reduce(
    (acc, a) => {
      acc[a] = 0;
      return acc;
    },
    {} as Record<NaturalAbility, number>,
  );
}

// Mock AI classifier. Replace with real API later.
export function classifyCustomAnswer(text: string): {
  primary: NaturalAbility;
  secondary: NaturalAbility;
  confidence: number;
} {
  const t = text.toLowerCase();

  const buckets: { ability: NaturalAbility; keywords: string[] }[] = [
    {
      ability: "Reaper",
      keywords: [
        "block",
        "leav",
        "end",
        "cut off",
        "cut them",
        "remove",
        "delete",
        "walk away",
        "done",
        "over",
        "no more",
        "goodbye",
      ],
    },
    {
      ability: "Healer",
      keywords: [
        "comfort",
        "listen",
        "hold space",
        "support",
        "be there",
        "soft",
        "gentle",
        "safe",
        "forgive",
        "peace",
      ],
    },
    {
      ability: "Empath",
      keywords: [
        "feel",
        "feelings",
        "energy",
        "sense",
        "emotional",
        "absorb",
        "heart",
        "their pain",
      ],
    },
    {
      ability: "Diviner",
      keywords: [
        "pattern",
        "sign",
        "notice",
        "read between",
        "hidden",
        "meaning",
        "clue",
        "watch",
        "observe",
        "clock",
      ],
    },
    {
      ability: "Seer",
      keywords: [
        "future",
        "predict",
        "next step",
        "foresight",
        "coming",
        "ahead",
        "prepare",
        "forecast",
      ],
    },
    {
      ability: "Charmer",
      keywords: [
        "charm",
        "joke",
        "laugh",
        "smile",
        "flirt",
        "win the room",
        "social",
        "work the room",
        "crowd",
      ],
    },
    {
      ability: "Manifestor",
      keywords: [
        "plan",
        "action",
        "make it happen",
        "build",
        "execute",
        "do it",
        "move",
        "push through",
        "go for it",
      ],
    },
    {
      ability: "Creative",
      keywords: [
        "art",
        "song",
        "story",
        "visual",
        "idea",
        "concept",
        "write",
        "design",
        "create",
        "paint",
        "make something",
      ],
    },
    {
      ability: "Alchemist",
      keywords: [
        "transform",
        "turn pain",
        "power",
        "comeback",
        "rise",
        "flip it",
        "use it",
        "learn from",
      ],
    },
    {
      ability: "Herbalist",
      keywords: [
        "food",
        "rest",
        "body",
        "nature",
        "clean",
        "ground",
        "tea",
        "water",
        "sleep",
        "walk",
        "breath",
      ],
    },
    {
      ability: "Shapeshifter",
      keywords: [
        "adapt",
        "switch",
        "become",
        "shift",
        "match",
        "blend",
        "change my",
        "pivot",
        "mode",
      ],
    },
    {
      ability: "Prophet",
      keywords: [
        "truth",
        "call it out",
        "say it",
        "tell them",
        "warn",
        "direct",
        "real talk",
        "honest",
      ],
    },
    {
      ability: "Ungifted",
      keywords: [
        "silent",
        "silence",
        "private",
        "unread",
        "no label",
        "nothing",
        "i dont know",
        "i don't know",
        "skip",
        "mind my",
      ],
    },
    {
      ability: "Dreamer",
      keywords: ["imagine", "fantasy", "dream", "inner world", "vision", "wonder", "what if"],
    },
  ];

  const scores: { ability: NaturalAbility; score: number }[] = buckets.map((b) => {
    let s = 0;
    for (const kw of b.keywords) {
      if (t.includes(kw)) s += 1;
    }
    return { ability: b.ability, score: s };
  });

  scores.sort((a, b) => b.score - a.score);
  const top = scores[0];
  const second = scores[1];

  if (top.score === 0) {
    return { primary: "Ungifted", secondary: "Diviner", confidence: 0 };
  }

  const confidence = Math.min(1, top.score / 3);
  const secondaryAbility = second.score > 0 ? second.ability : "Diviner";
  return { primary: top.ability, secondary: secondaryAbility, confidence };
}

export function calculateResult(answers: UserAnswer[], scenarios: Scenario[]): SignalResult {
  const scores = emptyScores();
  let customCount = 0;
  let lowConfidenceCustom = 0;

  for (const ans of answers) {
    const scenario = scenarios.find((s) => s.id === ans.scenarioId);
    if (!scenario) continue;

    if (ans.selectedChoiceId) {
      const choice = scenario.choices.find((c) => c.id === ans.selectedChoiceId);
      if (choice) {
        scores[choice.primary] += 2;
        scores[choice.secondary] += 1;
      }
    } else if (ans.customText && ans.customText.trim().length >= 8) {
      customCount += 1;
      const { primary, secondary, confidence } = classifyCustomAnswer(ans.customText);
      scores[primary] += 2;
      scores[secondary] += 1;
      if (confidence < 0.34) lowConfidenceCustom += 1;
    }
  }

  // Sort abilities by score
  const ranked = ALL_ABILITIES.map((a) => ({ ability: a, score: scores[a] })).sort(
    (a, b) => b.score - a.score,
  );

  let primary = ranked[0].ability;
  const secondary = ranked[1].ability;

  // Signal strength logic
  const top = ranked[0].score;
  const second = ranked[1].score;
  const totalNonZero = ranked.filter((r) => r.score > 0).length;

  let signalStrength: SignalStrength = "Strong";

  if (primary === "Ungifted" || (customCount > 0 && lowConfidenceCustom / customCount > 0.6)) {
    signalStrength = "Unreadable";
    if (primary !== "Ungifted") primary = "Ungifted";
  } else if (top - second >= 4) {
    signalStrength = "Strong";
  } else if (top - second <= 2 && top > 0) {
    signalStrength = "Mixed";
  } else if (totalNonZero >= 8) {
    signalStrength = "Emerging";
  }

  const signalBlend = getSignalBlend(primary, secondary);

  return {
    primaryAbility: primary,
    secondaryAbility: secondary,
    signalBlend,
    signalStrength,
    scores,
  };
}
