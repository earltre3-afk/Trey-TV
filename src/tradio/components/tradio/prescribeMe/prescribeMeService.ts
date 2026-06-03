import type { Prescription, TradioMode, UserAnswers, DailyUsageState } from "./prescribeMeTypes";
import { generateAIPreRoutePrescription } from "./prescribeMeMockData";

const DAILY_LIMIT_KEY = (userId: string) => `tradio_rx_limit_${userId}`;
const DATE_KEY = (userId: string) => `tradio_rx_date_${userId}`;
const LAST_RX_KEY = (userId: string) => `tradio_rx_last_${userId}`;

/**
 * Get current daily prescription usage state.
 * Detects if a new day has arrived and resets usage count.
 */
export function getDailyUsageState(userId: string): DailyUsageState {
  const todayStr = new Date().toLocaleDateString();
  let storedDate = "";
  let leftCount = 2;
  let lastRx: Prescription | null = null;

  try {
    storedDate = localStorage.getItem(DATE_KEY(userId)) || "";
    const storedCount = localStorage.getItem(DAILY_LIMIT_KEY(userId));
    if (storedCount !== null) {
      leftCount = parseInt(storedCount, 10);
    }

    const storedLast = localStorage.getItem(LAST_RX_KEY(userId));
    if (storedLast) {
      lastRx = JSON.parse(storedLast);
    }
  } catch (e) {
    console.warn("[prescribeMeService] Failed reading prescription storage:", e);
  }

  // If date has changed, reset daily limit
  if (storedDate !== todayStr) {
    leftCount = 2;
    try {
      localStorage.setItem(DATE_KEY(userId), todayStr);
      localStorage.setItem(DAILY_LIMIT_KEY(userId), "2");
    } catch (e) {
      // ignore
    }
  }

  return {
    prescriptionsLeftToday: leftCount,
    lastPrescription: lastRx,
    savedPrescriptions: [],
  };
}

/**
 * Executes a prescription routing formula, decrementing a daily use.
 */
export function executeNewPrescription(
  userId: string,
  mode: TradioMode,
  answers: UserAnswers,
): { success: boolean; prescription: Prescription | null; leftCount: number } {
  const state = getDailyUsageState(userId);

  if (state.prescriptionsLeftToday <= 0) {
    return { success: false, prescription: null, leftCount: 0 };
  }

  const prescription = generateAIPreRoutePrescription(mode, answers);
  const newLeftCount = state.prescriptionsLeftToday - 1;

  try {
    localStorage.setItem(DAILY_LIMIT_KEY(userId), String(newLeftCount));
    localStorage.setItem(LAST_RX_KEY(userId), JSON.stringify(prescription));
    localStorage.setItem(DATE_KEY(userId), new Date().toLocaleDateString());
  } catch (e) {
    console.error("[prescribeMeService] Failed saving new prescription:", e);
  }

  return {
    success: true,
    prescription,
    leftCount: newLeftCount,
  };
}

/**
 * Refines the active prescription (In-session; does not deduct a daily use).
 */
export function refineCurrentPrescription(
  userId: string,
  mode: TradioMode,
  answers: UserAnswers,
  refinementId: string,
): Prescription {
  const prescription = generateAIPreRoutePrescription(mode, answers, refinementId);

  try {
    // Overwrite the last prescription with refined values
    localStorage.setItem(LAST_RX_KEY(userId), JSON.stringify(prescription));
  } catch (e) {
    // ignore
  }

  return prescription;
}

/**
 * Simulates saving a prescription to profile.
 */
export function handleSavePrescription(prescription: Prescription): boolean {
  console.log("[prescribeMeService] Prescription saved:", prescription.id);
  // Simulates persistence success
  return true;
}

/**
 * Simulates feedback log submission.
 */
export function handleFeedback(prescription: Prescription, type: "like" | "dislike"): boolean {
  console.log(`[prescribeMeService] Feedback for ${prescription.title}: ${type}`);
  return true;
}

/**
 * Mock reset for testing/development (clears daily use limits).
 */
export function debugResetDailyLimit(userId: string): DailyUsageState {
  try {
    localStorage.setItem(DAILY_LIMIT_KEY(userId), "2");
    localStorage.removeItem(LAST_RX_KEY(userId));
  } catch (e) {
    // ignore
  }
  return {
    prescriptionsLeftToday: 2,
    lastPrescription: null,
    savedPrescriptions: [],
  };
}
