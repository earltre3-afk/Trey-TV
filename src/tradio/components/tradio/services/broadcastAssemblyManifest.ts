import { TradioShowBlock } from "../types/broadcast";
import { TimelineManifest, TimelineManifestItem, TimelineValidationResult } from "../types/broadcastAssemblyTypes";

/**
 * Builds a structured timeline manifest from a list of show blocks.
 */
export function buildEpisodeTimelineManifest(
  showId: string,
  episodeId: string,
  blocks: TradioShowBlock[]
): TimelineManifest {
  let cumulativeTime = 0;

  const items: TimelineManifestItem[] = blocks
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((b) => {
      const start = cumulativeTime;
      const duration = b.duration_seconds || 0;
      cumulativeTime += duration;

      return {
        block_id: b.id,
        block_type: b.block_type,
        title: b.title,
        sort_order: b.sort_order,
        source_audio_url: b.media_url || null,
        source_storage_path: b.metadata?.storage_path || null,
        script_text: b.script_text || null,
        duration_seconds: duration,
        start_time_seconds: start,
        end_time_seconds: start + duration,
        fade_in_seconds: Number(b.fade_in_seconds) || 0,
        fade_out_seconds: Number(b.fade_out_seconds) || 0,
        volume_level: (b.volume_level !== undefined && b.volume_level !== null) ? Number(b.volume_level) : 1.0,
        rights_status: (b as any).rights_status || b.metadata?.rights_status || "unclear",
        approval_status: b.approval_status || "pending",
        metadata: b.metadata || {},
      };
    });

  return {
    episode_id: episodeId,
    show_id: showId,
    block_count: items.length,
    total_duration_seconds: cumulativeTime,
    items,
  };
}

/**
 * Validates the timeline to identify missing audio assets, rights clearance issues, and general assembly readiness.
 */
export async function validateTimelineForAssembly(
  episodeId: string,
  blocks: TradioShowBlock[],
  userRole: string = "artist"
): Promise<TimelineValidationResult> {
  const warnings: string[] = [];
  const missingAudioBlocks: string[] = [];
  const rightsIssueBlocks: string[] = [];

  if (blocks.length === 0) {
    return {
      ready: false,
      validation_state: "draft-ready",
      warnings: ["Episode timeline has zero blocks. Please generate a rundown first."],
      missing_audio_blocks: [],
      rights_issue_blocks: [],
    };
  }

  // 1. Verify block durations are positive when required (all blocks except silence can have positive duration)
  const invalidDurations = blocks.filter((b) => b.duration_seconds <= 0);
  if (invalidDurations.length > 0) {
    warnings.push(`${invalidDurations.length} block(s) have invalid durations of 0 or less.`);
    invalidDurations.forEach(b => missingAudioBlocks.push(b.id));
  }

  // 2. Identify missing audio assets or failed rendering clips
  const audioRequiredTypes = ["intro", "voiceover", "transition", "outro", "station_drop", "ad", "song", "interview", "producer_spotlight", "artist_spotlight"];

  blocks.forEach((b) => {
    // If block needs audio but has no media URL
    if (audioRequiredTypes.includes(b.block_type) && !b.media_url) {
      // Intro/voiceover/outro/transition: can have scripts as fallback for preview, but flag as missing audio
      if (["intro", "voiceover", "transition", "outro"].includes(b.block_type) && b.script_text?.trim()) {
        warnings.push(`Segment "${b.title}" is missing rendered voiceover audio (will fall back to draft warning).`);
      } else {
        warnings.push(`Segment "${b.title}" is completely missing audio and script.`);
        missingAudioBlocks.push(b.id);
      }
    }

    // Check for failed / canceled voice renders
    if (b.media_url && (b.media_url.includes("fail") || b.metadata?.render_status === "failed" || b.metadata?.render_status === "canceled")) {
      warnings.push(`Segment "${b.title}" has a failed or canceled voice render attached.`);
      missingAudioBlocks.push(b.id);
    }
  });

  // 3. Verify Rights and Clearance for Public Assemblies
  blocks.forEach((b) => {
    if (b.block_type === "song") {
      const rights = (b as any).rights_status || b.metadata?.rights_status || "unclear";
      const cleared = b.clearance_status === "cleared";

      if (!cleared || rights === "unclear") {
        warnings.push(`Music Track "${b.title}" does not have cleared broadcast rights.`);
        rightsIssueBlocks.push(b.id);
      }
    }

    if (b.block_type === "ad" && b.approval_status !== "approved") {
      warnings.push(`Sponsor Ad Read "${b.title}" is not approved (must remain draft-only).`);
      rightsIssueBlocks.push(b.id);
    }
  });

  // 4. Classify Validation State
  let validation_state: "draft-ready" | "script-ready" | "voice-ready" | "timeline-preview-ready" | "review-ready" | "publish-ready" = "draft-ready";

  const hasRequiredScripts = !blocks.some(b => ["intro", "voiceover", "transition", "outro"].includes(b.block_type) && !b.script_text?.trim());
  const hasVoiceRenders = !blocks.some(b => ["intro", "voiceover", "transition", "outro"].includes(b.block_type) && !b.media_url);
  const hasAllAudio = missingAudioBlocks.length === 0;
  const hasAllRights = rightsIssueBlocks.length === 0;

  if (hasRequiredScripts) {
    validation_state = "script-ready";
  }
  if (hasRequiredScripts && hasVoiceRenders) {
    validation_state = "voice-ready";
  }
  if (hasAllAudio) {
    validation_state = "timeline-preview-ready";
  }
  if (hasAllAudio && hasAllRights && hasRequiredScripts) {
    validation_state = "review-ready";
  }
  if (hasAllAudio && hasAllRights && hasRequiredScripts && hasVoiceRenders && userRole !== "fan") {
    validation_state = "publish-ready";
  }

  // Preview assembly is allowed as long as we have some blocks and basic structures, but final candidate requires review-ready/publish-ready
  const ready = blocks.length > 0 && invalidDurations.length === 0;

  return {
    ready,
    validation_state,
    warnings,
    missing_audio_blocks: missingAudioBlocks,
    rights_issue_blocks: rightsIssueBlocks,
  };
}
