import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { createBrowserClient } from "@/lib/supabase-browser";
import { getAdminPostQueue, type AdminQueueItem } from "@/lib/admin/post-queue.server";

type UseAdminPostQueueReturn = {
  items: AdminQueueItem[];
  loading: boolean;
  reload: () => Promise<void>;
};

export function useAdminPostQueue(): UseAdminPostQueueReturn {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<AdminQueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isAdmin) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setItems([]);
        return;
      }

      const result = await getAdminPostQueue({ data: { accessToken: session.access_token } });
      setItems(result);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, reload: load };
}
