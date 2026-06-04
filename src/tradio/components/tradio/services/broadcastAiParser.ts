import type {
  TradioShowBlock,
  BlockType,
  RightsStatus,
  ApprovalStatus,
  ClearanceStatus
} from "../types/broadcast";

/**
 * Strips markdown fence blocks from AI responses (e.g. ```json ... ```)
 */
export function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, "");
    cleaned = cleaned.replace(/\n```$/, "");
    cleaned = cleaned.trim();
  }
  return cleaned;
}

/**
 * Validates and coerces a block type string to a valid BlockType enum.
 */
export function coerceBlockType(raw: string): BlockType {
  const validTypes: BlockType[] = [
    "intro", "station_drop", "voiceover", "song", "ad", "interview",
    "producer_spotlight", "artist_spotlight", "submission_block", "silence", "transition", "outro"
  ];
  const type = raw.toLowerCase().trim() as BlockType;
  return validTypes.includes(type) ? type : "voiceover";
}

/**
 * Validates and coerces a rights status string to a valid RightsStatus enum.
 */
export function coerceRightsStatus(raw: string): RightsStatus {
  const validStatus: RightsStatus[] = [
    "tradio_native", "creator_owned", "approved_submission", "licensed_catalog", "unclear"
  ];
  const status = raw.toLowerCase().trim() as RightsStatus;
  return validStatus.includes(status) ? status : "unclear";
}

/**
 * Validates and coerces an approval status.
 */
export function coerceApprovalStatus(raw: string): ApprovalStatus {
  const validStatus: ApprovalStatus[] = ["pending", "approved", "rejected"];
  const status = raw.toLowerCase().trim() as ApprovalStatus;
  return validStatus.includes(status) ? status : "pending";
}

export interface ParsedRundownResponse {
  episodeTitle: string;
  episodeSummary: string;
  targetDurationSeconds: number;
  blocks: Array<{
    blockType: BlockType;
    title: string;
    description: string;
    scriptText: string;
    durationSeconds: number;
    rightsStatus: RightsStatus;
    approvalStatus: ApprovalStatus;
    metadata: Record<string, any>;
  }>;
}

/**
 * Parses and validates the AI Program Director's rundown JSON payload.
 * Throws clean, recoverable errors on structure failure.
 */
export function parseRundownJson(rawJson: string): ParsedRundownResponse {
  const cleaned = cleanJsonString(rawJson);
  let parsed: any;

  try {
    parsed = JSON.parse(cleaned);
  } catch (e: any) {
    throw new Error(`Invalid JSON syntax in AI Program Director output: ${e.message}`);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI output parsed successfully but is not a valid JSON object.");
  }

  const episodeTitle = typeof parsed.episodeTitle === "string" ? parsed.episodeTitle : "AI Draft Episode";
  const episodeSummary = typeof parsed.episodeSummary === "string" ? parsed.episodeSummary : "Curated AI Draft";
  const targetDurationSeconds = typeof parsed.targetDurationSeconds === "number" ? parsed.targetDurationSeconds : 1800;

  if (!Array.isArray(parsed.blocks)) {
    throw new Error("AI output JSON is missing the required 'blocks' array parameter.");
  }

  const validatedBlocks = parsed.blocks.map((b: any, index: number) => {
    if (!b || typeof b !== "object") {
      throw new Error(`Block at index ${index} is not a valid object.`);
    }

    return {
      blockType: coerceBlockType(b.blockType || b.block_type || "voiceover"),
      title: typeof b.title === "string" ? b.title : `Segment ${index + 1}`,
      description: typeof b.description === "string" ? b.description : "",
      scriptText: typeof b.scriptText === "string" ? b.scriptText : (typeof b.script_text === "string" ? b.script_text : ""),
      durationSeconds: typeof b.durationSeconds === "number" ? b.durationSeconds : (typeof b.duration_seconds === "number" ? b.duration_seconds : 180),
      rightsStatus: coerceRightsStatus(b.rightsStatus || b.rights_status || "unclear"),
      approvalStatus: coerceApprovalStatus(b.approvalStatus || b.approval_status || "pending"),
      metadata: b.metadata && typeof b.metadata === "object" ? b.metadata : {},
    };
  });

  return {
    episodeTitle,
    episodeSummary,
    targetDurationSeconds,
    blocks: validatedBlocks,
  };
}

export interface ParsedScriptResponse {
  scriptText: string;
  styleMode: string;
  metadata: {
    wordCount: number;
    styleApplied: string;
    deliveryPacing: "slow" | "moderate" | "fast";
  };
}

/**
 * Parses and validates the AI Host's script generation JSON payload.
 */
export function parseScriptJson(rawJson: string): ParsedScriptResponse {
  const cleaned = cleanJsonString(rawJson);
  let parsed: any;

  try {
    parsed = JSON.parse(cleaned);
  } catch (e: any) {
    throw new Error(`Invalid JSON syntax in AI Host Script output: ${e.message}`);
  }

  if (!parsed || typeof parsed !== "object" || !parsed.scriptText) {
    throw new Error("AI Script output is missing the required 'scriptText' parameter.");
  }

  const scriptText = parsed.scriptText;
  const styleMode = typeof parsed.styleMode === "string" ? parsed.styleMode : "late_night_radio";
  const rawMeta = parsed.metadata || {};

  return {
    scriptText,
    styleMode,
    metadata: {
      wordCount: typeof rawMeta.wordCount === "number" ? rawMeta.wordCount : scriptText.split(/\s+/).length,
      styleApplied: typeof rawMeta.styleApplied === "string" ? rawMeta.styleApplied : "Custom AI Vibe",
      deliveryPacing: ["slow", "moderate", "fast"].includes(rawMeta.deliveryPacing) ? rawMeta.deliveryPacing : "moderate",
    }
  };
}
