import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, Save, ShieldCheck } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin-api";
import { calculateZodiacIdentity, type BirthTimePrecision } from "@/lib/zodiac";
import { ZodiacBadge } from "@/components/zodiac";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/zodiac")({
  component: AdminZodiac,
  head: () => ({ meta: [{ title: "Zodiac Support - Admin" }] }),
});

function AdminZodiac() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [birthLocation, setBirthLocation] = useState("");
  const [birthTimePrecision, setBirthTimePrecision] = useState<BirthTimePrecision>("unknown");
  const [birthTimeLocal, setBirthTimeLocal] = useState("");
  const [birthTimezone, setBirthTimezone] = useState("");
  const [reason, setReason] = useState("");
  if (!isAdmin) return null;

  const { data } = useQuery({
    queryKey: ["admin", "zodiac", query],
    queryFn: async () => {
      let q = supabase
        .from("profiles")
        .select(
          "id, display_name, username, date_of_birth, location, zodiac_sun_sign, zodiac_is_cusp, zodiac_cusp_label, zodiac_badge_key, zodiac_locked_at, birth_location_label, birth_time_precision, birth_time_local, birth_timezone, birth_chart_json",
        )
        .order("updated_at", { ascending: false })
        .limit(100);
      if (query.trim())
        q = q.or(`username.ilike.%${query.trim()}%,display_name.ilike.%${query.trim()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const beginEdit = (profile: any) => {
    setEditing(profile);
    setBirthLocation(profile.birth_location_label ?? profile.location ?? "");
    setBirthTimePrecision((profile.birth_time_precision ?? "unknown") as BirthTimePrecision);
    setBirthTimeLocal(profile.birth_time_local ?? "");
    setBirthTimezone(profile.birth_timezone ?? "");
    setReason("");
  };

  const preview = editing?.date_of_birth
    ? calculateZodiacIdentity({
        dateOfBirth: editing.date_of_birth,
        birthLocationLabel: birthLocation,
        birthTimePrecision,
        birthTimeLocal,
        birthTimezone,
      })
    : null;

  const saveCorrection = async () => {
    if (!editing || !preview || !reason.trim()) {
      toast.error("Add a correction reason first");
      return;
    }
    const { data: auth } = await supabase.auth.getUser();
    const adminUserId = auth.user?.id;
    if (!adminUserId) return;
    const now = new Date().toISOString();
    const previous = {
      zodiac_sun_sign: editing.zodiac_sun_sign,
      zodiac_is_cusp: editing.zodiac_is_cusp,
      zodiac_cusp_label: editing.zodiac_cusp_label,
      zodiac_badge_key: editing.zodiac_badge_key,
      birth_chart_json: editing.birth_chart_json,
    };
    const corrected = {
      zodiac_sun_sign: preview.sunSign,
      zodiac_is_cusp: preview.isCusp,
      zodiac_cusp_label: preview.cuspLabel,
      zodiac_badge_key: preview.badgeKey,
      birth_time_local: birthTimePrecision === "exact" && birthTimeLocal ? birthTimeLocal : null,
      birth_time_precision: birthTimePrecision,
      birth_location_label: birthLocation || null,
      birth_timezone: birthTimezone || null,
      birth_chart_json: preview.chart,
      birth_chart_generated_at: now,
      zodiac_locked_at: editing.zodiac_locked_at ?? now,
      zodiac_corrected_at: now,
      zodiac_corrected_by: adminUserId,
      updated_at: now,
    };

    const { error } = await (supabase as any)
      .from("profiles")
      .update(corrected)
      .eq("id", editing.id);
    if (error) return toast.error(error.message);

    await (supabase as any).from("zodiac_identity_corrections").insert({
      user_id: editing.id,
      admin_user_id: adminUserId,
      reason: reason.trim(),
      previous_identity: previous,
      corrected_identity: corrected,
    });
    await logAdminAction({
      action: "zodiac_identity_corrected",
      target_type: "profile",
      target_id: editing.id,
      reason: reason.trim(),
      metadata: { previous, corrected },
    });
    toast.success("Zodiac identity corrected");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "zodiac"] });
  };

  return (
    <AdminShell
      title="Zodiac Support"
      subtitle="Correct locked zodiac identities without opening casual profile editing."
    >
      <div className="rounded-3xl liquid-glass border border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="size-5 text-primary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by username or display name"
            className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="grid gap-3">
        {(data ?? []).map((profile: any) => (
          <div key={profile.id} className="rounded-2xl liquid-glass border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black">
                  {profile.display_name || profile.username || profile.id}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  @{profile.username ?? "no-handle"} ·{" "}
                  {profile.date_of_birth ? "DOB on file" : "No DOB"}
                </div>
              </div>
              {profile.zodiac_sun_sign ? (
                <ZodiacBadge
                  sign={profile.zodiac_sun_sign}
                  isCusp={!!profile.zodiac_is_cusp}
                  cuspLabel={profile.zodiac_cusp_label}
                  size="sm"
                  showName
                />
              ) : (
                <span className="text-xs text-muted-foreground">No zodiac</span>
              )}
              <button
                onClick={() => beginEdit(profile)}
                className="h-9 rounded-xl bg-primary px-3 text-xs font-black text-primary-foreground"
              >
                Correct
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-3xl liquid-glass border border-primary/30 p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" />
              <div>
                <h2 className="text-lg font-black">Support correction</h2>
                <p className="text-xs text-muted-foreground">
                  This writes an admin correction record and keeps zodiac locked.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <input
                value={birthLocation}
                onChange={(event) => setBirthLocation(event.target.value)}
                placeholder="Birth location label"
                className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none"
              />
              <input
                value={birthTimezone}
                onChange={(event) => setBirthTimezone(event.target.value)}
                placeholder="Birth timezone, e.g. America/Chicago"
                className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={birthTimePrecision}
                  onChange={(event) =>
                    setBirthTimePrecision(event.target.value as BirthTimePrecision)
                  }
                  className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none"
                >
                  <option value="unknown">I don't know</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                  <option value="exact">Exact time</option>
                </select>
                <input
                  type="time"
                  value={birthTimeLocal}
                  onChange={(event) => setBirthTimeLocal(event.target.value)}
                  className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none"
                />
              </div>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Correction reason required"
                rows={3}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
              />
            </div>
            {preview && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <ZodiacBadge
                  sign={preview.sunSign}
                  isCusp={preview.isCusp}
                  cuspLabel={preview.cuspLabel}
                  showName
                />
                <div className="mt-2 text-[11px] text-muted-foreground">
                  {preview.calculationMethod.replaceAll("_", " ")} ·{" "}
                  {preview.confidence.replace("_", " ")}
                </div>
              </div>
            )}
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setEditing(null)}
                className="h-10 flex-1 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveCorrection}
                className="h-10 flex-1 rounded-xl bg-primary text-sm font-black text-primary-foreground inline-flex items-center justify-center gap-2"
              >
                <Save className="size-4" /> Save Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
