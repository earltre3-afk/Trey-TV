/**
 * Tradio Post-Show Producer AI Prompts (Pass 10)
 * Generates structured JSON prompts for AI to create post-show assets
 */

import type { PostShowSourceSnapshot, PostShowAIPackageResponse } from './broadcastPostShowTypes';

/**
 * Build comprehensive post-show generation prompt
 */
export function buildPostShowGenerationPrompt(
  snapshot: PostShowSourceSnapshot,
  assetTypes: string[],
  includeFollowUps: boolean = false,
): string {
  const assets = assetTypes.join(', ');

  return `You are a professional podcast/broadcast post-show producer assistant.

Given this broadcast/recording metadata, generate high-quality post-show assets in JSON format.

BROADCAST DATA:
${formatSnapshot(snapshot)}

REQUIRED OUTPUT:
Generate these asset types: ${assets}

For each asset, provide:
- assetType: exact asset type name
- platform: target platform (tradio, instagram, tiktok, youtube, facebook, x, newsletter, website, generic)
- title: catchy title or header (required for clip titles, episode descriptions)
- body: the actual content (required)
- tone: tone (professional, humorous, emotional, urgent, inspirational, casual)
- tags: relevant tags for categorization
- metadata: any additional context as a flat object

CONSTRAINTS (CRITICAL):
1. Only reference facts from the provided broadcast data.
2. DO NOT invent listener counts, views, or statistics.
3. DO NOT claim rights clearances, sponsorships, or partnerships not mentioned.
4. DO NOT quote private users by name without explicit mention.
5. DO NOT claim verified social metrics.
6. DO NOT create fake call-to-actions with unverified offers.
7. Keep all content accurate and truthful to the broadcast.
8. Tailor tone and platform-specific copy appropriately.
9. Be creative but factual.
${includeFollowUps ? '10. Include 2-3 follow-up show topic suggestions based on listener engagement.' : ''}

RESPONSE FORMAT (valid JSON only):
{
  "assets": [
    {
      "assetType": "string",
      "platform": "string",
      "title": "string",
      "body": "string",
      "tone": "string",
      "tags": ["string"],
      "metadata": {}
    }
  ],
  "followUpTopics": ${includeFollowUps ? '[{"title": "string", "reason": "string", "tags": ["string"]}]' : '[]'},
  "warnings": ["string"]
}

Generate valid JSON only. No markdown, no explanations.`;
}

/**
 * Format snapshot for prompt
 */
function formatSnapshot(snapshot: PostShowSourceSnapshot): string {
  const lines: string[] = [];

  if (snapshot.show_title) lines.push(`Show: ${snapshot.show_title}`);
  if (snapshot.episode_title) lines.push(`Episode: ${snapshot.episode_title}`);
  if (snapshot.clip_title) lines.push(`Clip: ${snapshot.clip_title}`);
  if (snapshot.channel_title) lines.push(`Channel: ${snapshot.channel_title}`);

  if (snapshot.recording_duration_seconds) {
    lines.push(`Duration: ${formatDuration(snapshot.recording_duration_seconds)}`);
  }
  if (snapshot.clip_duration_seconds) {
    lines.push(`Clip Duration: ${formatDuration(snapshot.clip_duration_seconds)}`);
  }

  if (snapshot.segment_type) lines.push(`Segment: ${snapshot.segment_type}`);

  if (snapshot.reaction_count) {
    lines.push(`Reactions: ${snapshot.reaction_count} total`);
    if (snapshot.top_reaction_types?.length) {
      lines.push(`  Top reactions: ${snapshot.top_reaction_types.join(', ')}`);
    }
  }

  if (snapshot.chat_count) lines.push(`Chat messages: ${snapshot.chat_count}`);

  if (snapshot.poll_results?.length) {
    lines.push(`Polls:`);
    snapshot.poll_results.forEach((p) => {
      lines.push(`  - "${p.question}" → ${p.winner} (${p.percentage}%)`);
    });
  }

  if (snapshot.call_in_moments?.length) {
    lines.push(`Call-in moments: ${snapshot.call_in_moments.length}`);
    snapshot.call_in_moments.forEach((c) => {
      lines.push(`  - ${c.name}: ${formatDuration(c.duration_seconds)}`);
    });
  }

  if (snapshot.sfx_events?.length) {
    lines.push(`SFX events: ${snapshot.sfx_events.map((s) => `${s.name} (${s.count}x)`).join(', ')}`);
  }

  if (snapshot.completion_rate !== undefined) {
    lines.push(`Completion rate: ${(snapshot.completion_rate * 100).toFixed(0)}%`);
  }
  if (snapshot.replay_count !== undefined) {
    lines.push(`Replays: ${snapshot.replay_count}`);
  }

  if (snapshot.mood_tags?.length) lines.push(`Moods: ${snapshot.mood_tags.join(', ')}`);
  if (snapshot.genre_tags?.length) lines.push(`Genres: ${snapshot.genre_tags.join(', ')}`);
  if (snapshot.audience_tags?.length) lines.push(`Audience: ${snapshot.audience_tags.join(', ')}`);

  if (snapshot.transcript_available) {
    lines.push(`Transcript: available`);
  }

  return lines.join('\n');
}

/**
 * Format seconds to readable duration
 */
function formatDuration(seconds: number): string {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Parse and validate AI response
 */
export function parsePostShowAIResponse(rawResponse: string): PostShowAIPackageResponse {
  try {
    const response = JSON.parse(rawResponse) as PostShowAIPackageResponse;

    // Validate structure
    if (!Array.isArray(response.assets)) {
      throw new Error('Missing or invalid assets array');
    }

    // Validate each asset
    response.assets.forEach((asset, idx) => {
      if (!asset.assetType) throw new Error(`Asset ${idx}: missing assetType`);
      if (!asset.body) throw new Error(`Asset ${idx}: missing body`);
      if (!asset.platform) throw new Error(`Asset ${idx}: missing platform`);
    });

    // Ensure warnings array
    if (!Array.isArray(response.warnings)) {
      response.warnings = [];
    }

    return response;
  } catch (err) {
    throw new Error(`Failed to parse AI response: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Validate asset content against safety constraints
 */
export function validateAssetContent(body: string, title?: string): string[] {
  const warnings: string[] = [];
  const content = `${title || ''} ${body}`.toLowerCase();

  // Check for fake statistics patterns
  if (
    /(over|more than|nearly)?\s*[\d,]+\s*(listeners?|viewers?|subscribers?|followers?|followers?)/i.test(
      content,
    )
  ) {
    warnings.push('Contains listener/viewer counts that should be verified');
  }

  // Check for unverified claims
  if (/\b(sponsor|sponsored|partnership|partners with|brought to you by)\b/i.test(content)) {
    warnings.push('Contains sponsorship/partnership claims that need verification');
  }

  if (/\b(exclusive|only here|world premiere|first time)\b/i.test(content)) {
    warnings.push('Contains exclusive/premiere claims that should be verified');
  }

  // Check for quote patterns
  if (/["'].*?["']/i.test(content)) {
    warnings.push('Contains quoted content that should be verified as accurate');
  }

  return warnings;
}

/**
 * Filter out deceptive or risky patterns
 */
export function filterDeceptiveContent(
  response: PostShowAIPackageResponse,
): { response: PostShowAIPackageResponse; blockedAssets: number[] } {
  const blockedAssets: number[] = [];

  response.assets = response.assets.filter((asset, idx) => {
    const warnings = validateAssetContent(asset.body, asset.title);

    // Only block if critical safety issue
    if (
      asset.body.includes('[redacted]') ||
      asset.body.includes('[REDACTED]') ||
      asset.body.includes('unverified') ||
      asset.body.includes('alleged')
    ) {
      blockedAssets.push(idx);
      return false;
    }

    // Add warnings to asset metadata
    if (warnings.length > 0) {
      asset.metadata = asset.metadata || {};
      (asset.metadata as any).safety_warnings = warnings;
    }

    return true;
  });

  return { response, blockedAssets };
}
