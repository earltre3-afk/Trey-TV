import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

import { judgeSignalTest } from "../src/lib/trey-i/vertex.server.ts";
import { SCENARIOS } from "../src/lib/tests/naturalAbilityQuestions.ts";

console.log("Loading .env.development...");
console.log("Scenarios count in test:", SCENARIOS.length);

const mockAnswers = [
  { scenarioId: 1, selectedChoiceId: "B" }, // Manifestor
  { scenarioId: 2, selectedChoiceId: "A" }, // Prophet
  { scenarioId: 3, selectedChoiceId: "B" }, // Prophet
  { scenarioId: 4, selectedChoiceId: "C" }, // Manifestor
  { scenarioId: 5, selectedChoiceId: "B" }, // Manifestor
  { scenarioId: 6, selectedChoiceId: "B" }, // Diviner
  { scenarioId: 7, selectedChoiceId: "B" }, // Creative
  { scenarioId: 8, selectedChoiceId: "A" }, // Creative
  { scenarioId: 9, selectedChoiceId: "A" }, // Herbalist
  { scenarioId: 10, selectedChoiceId: "B" }, // Creative
  { scenarioId: 11, selectedChoiceId: "C" }, // Creative
  { scenarioId: 12, selectedChoiceId: "A" }, // Charmer
  { scenarioId: 13, selectedChoiceId: "B" }, // Manifestor
  { scenarioId: 14, selectedChoiceId: "A" }, // Prophet
  { scenarioId: 15, selectedChoiceId: "A" }, // Charmer
  { scenarioId: 16, selectedChoiceId: "C" }, // Creative
  { scenarioId: 17, selectedChoiceId: "B" }, // Prophet
  { scenarioId: 18, selectedChoiceId: "B" }, // Charmer
  { scenarioId: 19, selectedChoiceId: "A" }, // Empath
  { scenarioId: 20, selectedChoiceId: "C" }, // Creative
  { scenarioId: 21, selectedChoiceId: "A" }  // Prophet / Creative (New Question)
];

async function run() {
  try {
    console.log("Calling judgeSignalTest server function...");
    const result = await judgeSignalTest({ data: { answers: mockAnswers, scenarios: SCENARIOS } });
    console.log("\n--- AI JUDGMENT SUCCESS ---");
    console.log("Primary Ability:", result.primaryAbility);
    console.log("Secondary Ability:", result.secondaryAbility);
    console.log("Signal Blend:", result.signalBlend);
    console.log("Signal Strength:", result.signalStrength);
    console.log("Interpretation:", result.interpretation);
    console.log("---------------------------\n");
  } catch (err) {
    console.error("AI Judge Call Failed:", err);
  }
}

run();
