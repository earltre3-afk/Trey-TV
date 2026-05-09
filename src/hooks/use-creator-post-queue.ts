import { useEffect, useState } from "react";
import { useCreatorStudio } from "@/hooks/use-creator-studio";
import { createBrowserClient } from "@/lib/supabase-browser";

type ApprovalStatus = "pending" | "approved" | "rejected" | "needs_changes";

export type QueueRow = {
  id: string;
  edit_project_id: string | null;
  channel_id: string | null;
  show_id: string | null;
  episode_number: number | null;
  title: string;
  description: string | null;
  stream_uid: string;
  thumbnail_url: string | null;
  visibility: string;
  is_plus_content: boolean;
  scheduled_at: string | null;
  approval_status: ApprovalStatus;
  created_at: string;
  updated_at: string;
};

type UseCreatorPostQueueReturn = {
  queueRows: QueueRow[];
  loading: boolean;
};

export function useCreatorPostQueue(): UseCreatorPostQueueReturn {
  const { isApprovedCreator } = useCreatorStudio();
  const [queueRows, setQueueRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isApprovedCreator) {
      setQueueRows([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    async function loadQueueRows() {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) setQueueRows([]);
          return;
        }

        const { data, error } = await (supabase as any)
          .from("creator_post_queue")
          .select(
            "id, edit_project_id, channel_id, show_id, episode_number, title, description, stream_uid, thumbnail_url, visibility, is_plus_content, scheduled_at, approval_status, created_at, updated_at",
          )
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          if (mounted) setQueueRows([]);
          return;
        }

        if (mounted) setQueueRows((data as QueueRow[]) ?? []);
      } catch {
        if (mounted) setQueueRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadQueueRows();

    return () => {
      mounted = false;
    };
  }, [isApprovedCreator]);

  return { queueRows, loading };
}
