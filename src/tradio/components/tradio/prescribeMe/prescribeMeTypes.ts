export type TradioMode = "fan" | "artist" | "producer" | "dj" | "admin" | "owner";

export interface QuestionOption {
  label: string;
  value: string;
}

export interface PrescribeMeQuestion {
  id: string;
  category: "currentNeed" | "emotionalState" | "desiredShift" | "familiarity" | "contentType";
  text: string;
  options: QuestionOption[];
}

export interface UserAnswers {
  currentNeed: string;
  emotionalState: string;
  desiredShift: string;
  familiarity: string;
  contentType: string;
}

export interface Prescription {
  id: string;
  title: string;
  routeType: string; // e.g. "Station", "Release Strategy", "Beat Match", "Show Flow", "Platform Telemetry"
  destination: string; // screen or action key
  description: string;
  reason: string; // Dynamic reason based on questions answered
  confidenceLabel: string; // e.g. "98% MATCH"
  primaryCtaLabel: string;
  ctaType: "start_radio" | "navigate_screen" | "open_forge" | "action_alert";
  secondaryCtaLabel?: string;
  timestamp: number;
}

export interface RefinementOption {
  id: string;
  label: string;
  description: string;
}

export interface DailyUsageState {
  prescriptionsLeftToday: number; // starts at 2
  lastPrescription: Prescription | null;
  savedPrescriptions: string[]; // Prescription IDs
}
