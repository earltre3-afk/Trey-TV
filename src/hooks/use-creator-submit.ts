import { useState } from "react";
import { toast } from "sonner";
import { useCreatorStudio } from "@/hooks/use-creator-studio";
import { createBrowserClient } from "@/lib/supabase-browser";
import type { Submission } from "@/lib/submissions-store";

type EditProjectInsert = {
  id?: string;
  creator_id: string;
  title: string | null;
  description: string | null;
  status: "draft";
  thumbnail_url: string | null;
  utility_state: Record<string, unknown>;
};

export type UseCreatorSubmitReturn = {
  saveDraft: (draft: Submission) => Promise<string | null>;
  submitForReview: (draft: Submission) => Promise<boolean>;
  saving: boolean;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isNewRow(contentId: string): boolean {
  return contentId.startsWith("seed-") || !uuidPattern.test(contentId);
}

export function buildUtilityState(draft: Submission): Record<string, unknown> {
  return {
    show_id: draft.show_id,
    show_title: draft.show_title,
    season_number: draft.season_number,
    episode_number: draft.episode_number,
    episode_type: draft.episode_type,
    category: draft.category,
    tags: draft.tags,
    mood_tags: draft.mood_tags,
    visibility: draft.visibility,
    access_type: draft.access_type,
    content_rating: draft.content_rating,
    language: draft.language,
    explicit_content: draft.explicit_content,
    is_trailer: draft.is_trailer,
    is_bonus: draft.is_bonus,
    is_finale: draft.is_finale,
    is_premiere: draft.is_premiere,
    policy_ack: draft.policy_ack,
    full_description: draft.full_description,
    viewer_context: draft.viewer_context,
    what_to_know: draft.what_to_know,
    why_it_matters: draft.why_it_matters,
    creator_note: draft.creator_note,
    scheduled_at: draft.scheduled_at ?? null,
  };
}

function mapVisibility(v: string): string {
  if (v === "private") return "private";
  if (v === "scheduled") return "scheduled";
  return "submitted";
}

function isPlusContent(episodeNumber: number, accessType: string): boolean {
  if (episodeNumber <= 2) return false;
  return accessType === "subscribers";
}

export function useCreatorSubmit(): UseCreatorSubmitReturn {
  const { channel, isApprovedCreator } = useCreatorStudio();
  const [saving, setSaving] = useState(false);

  const getUserId = async (): Promise<string | null> => {
    if (!isApprovedCreator || !channel) {
      toast.error("Creator access required");
      return null;
    }

    try {
      const supabase = createBrowserClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return user.id;
    } catch {
      return null;
    }
  };

  const saveDraft = async (draft: Submission): Promise<string | null> => {
    if (saving) return null;

    setSaving(true);

    try {
      const userId = await getUserId();
      if (!userId) return null;

      const supabase = createBrowserClient();
      const payload: EditProjectInsert = {
        creator_id: userId,
        title: draft.title || null,
        description: draft.short_description || null,
        status: "draft",
        thumbnail_url: draft.thumbnail_url || null,
        utility_state: buildUtilityState(draft),
      };

      if (isNewRow(draft.content_id)) {
        const { data, error } = await (supabase as any)
          .from("creator_edit_projects")
          .insert(payload)
          .select("id")
          .single();

        if (error) {
          toast.error("Failed to save draft");
          return null;
        }

        return data?.id ?? null;
      }

      const { data, error } = await (supabase as any)
        .from("creator_edit_projects")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", draft.content_id)
        .eq("creator_id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        toast.error("Failed to save draft");
        return null;
      }

      if (!data?.id) {
        const { data: inserted, error: insertError } = await (supabase as any)
          .from("creator_edit_projects")
          .insert({ ...payload, id: draft.content_id })
          .select("id")
          .single();

        if (insertError) {
          toast.error("Failed to save draft");
          return null;
        }

        return inserted?.id ?? null;
      }

      return draft.content_id;
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async (draft: Submission): Promise<boolean> => {
    const rowId = await saveDraft(draft);
    if (!rowId) return false;

    const userId = await getUserId();
    if (!userId) return false;

    try {
      const supabase = createBrowserClient();
      const { error } = await (supabase as any)
        .from("creator_edit_projects")
        .update({ status: "submitted", updated_at: new Date().toISOString() })
        .eq("id", rowId)
        .eq("creator_id", userId);

      if (error) {
        toast.error("Failed to submit");
        return false;
      }

      try {
        const { data: project } = await (supabase as any)
          .from("creator_edit_projects")
          .select("stream_uid")
          .eq("id", rowId)
          .eq("creator_id", userId)
          .maybeSingle();

        const streamUid: string | null = project?.stream_uid?.trim() || null;
        if (!streamUid) return true;

        const { data: existing } = await (supabase as any)
          .from("creator_post_queue")
          .select("id")
          .eq("creator_id", userId)
          .eq("edit_project_id", rowId)
          .maybeSingle();

        if (existing) return true;

        const episodeNumber = draft.episode_number > 0 ? draft.episode_number : null;
        const { error: queueError } = await (supabase as any).from("creator_post_queue").insert({
          creator_id: userId,
          edit_project_id: rowId,
          channel_id: channel?.id ?? null,
          show_id: draft.show_id || null,
          episode_number: episodeNumber,
          title: draft.title.trim(),
          description: draft.short_description?.trim() || null,
          stream_uid: streamUid,
          thumbnail_url: draft.thumbnail_url || null,
          visibility: mapVisibility(draft.visibility),
          is_plus_content: isPlusContent(draft.episode_number, draft.access_type),
          scheduled_at:
            draft.visibility === "scheduled" && draft.scheduled_at
              ? new Date(draft.scheduled_at).toISOString()
              : null,
          approval_status: "pending",
        });

        if (queueError) {
          toast.error("Submission queued but review entry failed - contact support");
        }
      } catch {
        // Queue creation is best-effort; the edit project submission remains valid.
      }

      return true;
    } catch {
      toast.error("Failed to submit");
      return false;
    }
  };

  return { saveDraft, submitForReview, saving };
}
