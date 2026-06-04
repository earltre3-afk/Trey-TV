/**
 * Tradio Broadcast Studio Pass 9B: Publishing Gates
 * Server-side validation before clip can be published publicly
 */

import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from '@/integrations/supabase/client.server';

const supabase = supabaseAdmin;

export interface PublishingGateResult {
  canPublish: boolean;
  errors: string[];
  warnings: string[];
  isAdmin?: boolean;
  isOwner?: boolean;
}

/**
 * Validate all publishing gates before allowing clip to become public
 */
export async function validatePublishingGatesServer(input: {
  clip_id: string;
  verifiedUserId: string;
}): Promise<PublishingGateResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Fetch the clip
    const { data: clip, error: clipError } = await (supabase as any)
      .from('tradio_live_highlight_clips')
      .select('*')
      .eq('id', input.clip_id)
      .single();

    if (clipError || !clip) {
      return {
        canPublish: false,
        errors: ['Clip not found'],
        warnings: [],
      };
    }

    // Gate 1: User is owner or admin
    // verifiedUserId comes from server-verified access token, cannot be spoofed
    const isOwner = clip.owner_user_id === input.verifiedUserId;

    // For admin check, use the project's trusted is_admin RPC
    // This checks app-level admin status via profiles.role = 'admin'
    let isAdmin = false;
    if (!isOwner) {
      // Only check admin if not owner (optimization)
      const { data: adminCheck } = await supabase.rpc("is_admin", {
        _user_id: input.verifiedUserId,
      });
      isAdmin = adminCheck === true;
    }

    if (!isAdmin && !isOwner) {
      errors.push('Only the creator or an admin can publish this clip');
    }

    // Gate 2: Clip is rendered or approved
    if (clip.clip_status !== 'rendered' && clip.clip_status !== 'approved') {
      errors.push(`Clip must be rendered or approved to publish (current: ${clip.clip_status})`);
    }

    // Gate 3: Audio/storage exists
    if (!clip.storage_path && !clip.audio_url) {
      errors.push('Clip audio has not been rendered or stored');
    }

    // Gate 4: Review is approved (if pending_review)
    if (clip.clip_status === 'pending_review') {
      errors.push('Clip must be approved by moderator before publishing');
    }

    // Gate 5: Rights are not blocked
    if (clip.rights_snapshot) {
      const rightsStatus = (clip.rights_snapshot as Record<string, unknown>)?.status;
      if (rightsStatus === 'blocked') {
        errors.push('Clip has rights issues and cannot be published');
      }
      if (rightsStatus === 'needs_review') {
        warnings.push('Clip rights require manual verification');
      }
    }

    // Gate 6: Recording and consent records exist
    const { data: recording } = await (supabase as any)
      .from('tradio_live_recordings')
      .select('id, consent_snapshot')
      .eq('id', clip.recording_id)
      .single();

    if (!recording) {
      errors.push('Original recording not found');
    }

    // Gate 7: Participant consents present
    if (recording?.consent_snapshot) {
      const consentSnapshot = recording.consent_snapshot as Record<string, unknown>;
      const participants = (consentSnapshot.participants as Array<Record<string, unknown>>) || [];

      // Check if any participants are in the clip segment and didn't consent
      const declinedParticipants = participants.filter(
        (p) => p.consent_status === 'declined' || p.consent_status === 'removed_from_recording',
      );

      if (declinedParticipants.length > 0) {
        warnings.push(
          `${declinedParticipants.length} participant(s) declined recording. Verify they are not in this clip segment.`,
        );
      }
    }

    // Gate 8: Visibility transition is allowed
    const validVisibilityTransitions: Record<string, string[]> = {
      private: ['unlisted', 'public'],
      unlisted: ['public', 'private'],
      public: ['private', 'unlisted'],
    };

    const validTransitions = validVisibilityTransitions[clip.visibility] || [];
    if (!validTransitions.includes('public')) {
      errors.push(`Cannot publish clip with visibility: ${clip.visibility}`);
    }

    return {
      canPublish: errors.length === 0,
      errors,
      warnings,
      isAdmin,
      isOwner,
    };
  } catch (err) {
    return {
      canPublish: false,
      errors: [`Validation error: ${err instanceof Error ? err.message : 'Unknown error'}`],
      warnings: [],
      isAdmin: false,
      isOwner: false,
    };
  }
}

/**
 * Attempt to publish a clip after validating all gates
 */
export async function publishClipWithGatesServer(input: {
  clip_id: string;
  verifiedUserId: string;
  visibility?: string;
}): Promise<{ success: boolean; error?: string; warnings?: string[] }> {
  // Validate gates first
  const gateResult = await validatePublishingGatesServer({
    clip_id: input.clip_id,
    verifiedUserId: input.verifiedUserId,
  });

  if (!gateResult.canPublish) {
    return {
      success: false,
      error: gateResult.errors.join('; '),
      warnings: gateResult.warnings,
    };
  }

  // All gates passed, proceed with publish
  // If owner: require ownership match (defense in depth)
  // If admin: publish any clip after admin role verified
  let query = (supabase as any)
    .from('tradio_live_highlight_clips')
    .update({
      clip_status: 'published',
      visibility: input.visibility || 'public',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.clip_id);

  // Owner must match clip owner; admin can publish any clip
  if (!gateResult.isAdmin) {
    query = query.eq('owner_user_id', input.verifiedUserId);
  }

  // Verify the update actually matched and returned the clip
  const { data: updatedClip, error } = await query
    .select('id, clip_status, visibility, published_at')
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
      warnings: gateResult.warnings,
    };
  }

  if (!updatedClip) {
    return {
      success: false,
      error: 'Clip publish failed because no authorized clip row was updated.',
      warnings: gateResult.warnings,
    };
  }

  return {
    success: true,
    warnings: gateResult.warnings,
  };
}
