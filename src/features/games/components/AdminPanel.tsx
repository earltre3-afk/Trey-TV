import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Activity,
  Users,
  Trash2,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Server,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  RoomRow,
  listActiveRooms,
  closeRoom,
  clearAbandoned,
} from "@/features/games/lib/services/roomService";
import { supabase } from "@/lib/supabase";

interface Props {
  onBack: () => void;
}

export const AdminPanel: React.FC<Props> = ({ onBack }) => {
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    privateRooms: true,
    bots: true,
    blackjack: true,
    bullshit: true,
    targetScore: 500,
    maxInactiveMin: 30,
  });

  const load = async () => {
    setLoading(true);
    try {
      setRooms(await listActiveRooms());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-rooms")
      .on("postgres_changes", { event: "*", schema: "public", table: "game_rooms" }, () => load())
      .subscribe();
    const interval = setInterval(load, 30000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(interval);
    };
  }, []);

  const toggle = (k: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [k]: !s[k as keyof typeof s] }));

  const handleClose = async (id: string) => {
    await closeRoom(id);
    load();
  };
  const handleClearAbandoned = async () => {
    await clearAbandoned();
    load();
  };

  const minutesAgo = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return `${Math.round(diff)}s`;
    if (diff < 3600) return `${Math.round(diff / 60)}m`;
    return `${Math.round(diff / 3600)}h`;
  };

  return (
    <div className="min-h-screen w-full text-white pb-12" style={{ background: "#05070D" }}>
      <div
        className="sticky top-0 z-20 backdrop-blur-xl border-b"
        style={{ background: "rgba(5,7,13,0.85)", borderColor: "rgba(168,85,247,0.3)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="text-[10px] text-purple-300 tracking-[0.2em]">ADMIN</div>
            <div className="text-lg font-bold">Game Room Monitor</div>
          </div>
          <button onClick={load} className="p-2 rounded-xl hover:bg-white/5" title="Refresh">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </button>
          <span
            className="text-[10px] px-2 py-1 rounded-md"
            style={{
              background: "rgba(34,197,94,0.15)",
              color: "#22C55E",
              border: "1px solid rgba(34,197,94,0.4)",
            }}
          >
            <Server size={11} className="inline mr-1" /> LIVE
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<Activity size={18} />}
            label="Active"
            value={rooms.filter((r) => r.status === "active").length}
            color="#22C55E"
          />
          <StatCard
            icon={<Users size={18} />}
            label="Players"
            value={rooms.reduce((a, r) => a + r.current_players, 0)}
            color="#00B7FF"
          />
          <StatCard
            icon={<ShieldCheck size={18} />}
            label="Abandoned"
            value={rooms.filter((r) => r.status === "abandoned").length}
            color="#EF4444"
          />
          <StatCard
            icon={<Server size={18} />}
            label="Total"
            value={rooms.length}
            color="#A855F7"
          />
        </div>

        <div
          className="rounded-2xl border"
          style={{ background: "rgba(8,17,31,0.6)", borderColor: "rgba(0,183,255,0.2)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "rgba(0,183,255,0.15)" }}
          >
            <h3 className="font-bold">Live Rooms</h3>
            <button
              onClick={handleClearAbandoned}
              disabled={!rooms.some((r) => r.status === "abandoned")}
              className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-30"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#EF4444",
              }}
            >
              Clear Abandoned
            </button>
          </div>
          {loading && rooms.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin mx-auto mb-2" /> Loading…
            </div>
          ) : rooms.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              No rooms yet. When users create rooms they will appear here.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {rooms.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <div
                    className="font-mono text-xs px-2 py-1 rounded-md"
                    style={{
                      background: "rgba(0,183,255,0.12)",
                      border: "1px solid rgba(0,183,255,0.3)",
                    }}
                  >
                    {r.room_code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold capitalize">
                      {r.game_type}
                      {r.is_private ? " • private" : ""}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Host {r.host_display_name} • {r.current_players}/{r.max_players} players •
                      started {minutesAgo(r.created_at)} ago • last active{" "}
                      {minutesAgo(r.last_activity_at)} ago
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                  <button
                    onClick={() => handleClose(r.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                    title="Close room"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <h3 className="font-bold mt-8 mb-3">Game Settings</h3>
        <div
          className="rounded-2xl border divide-y"
          style={{ background: "rgba(8,17,31,0.6)", borderColor: "rgba(0,183,255,0.2)" }}
        >
          <ToggleRow
            label="Enable Private Rooms"
            value={settings.privateRooms}
            onToggle={() => toggle("privateRooms")}
          />
          <ToggleRow
            label="Enable Bot Mode"
            value={settings.bots}
            onToggle={() => toggle("bots")}
          />
          <ToggleRow
            label="Allow Blackjack"
            value={settings.blackjack}
            onToggle={() => toggle("blackjack")}
          />
          <ToggleRow
            label="Allow Bullshit"
            value={settings.bullshit}
            onToggle={() => toggle("bullshit")}
          />
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Target Spades Score</div>
              <div className="text-[11px] text-slate-400">Default for new rooms</div>
            </div>
            <input
              type="number"
              value={settings.targetScore}
              onChange={(e) =>
                setSettings((s) => ({ ...s, targetScore: parseInt(e.target.value) || 500 }))
              }
              className="w-24 bg-black/40 rounded-lg px-3 py-2 text-sm border outline-none"
              style={{ borderColor: "rgba(0,183,255,0.3)" }}
            />
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Max Inactive (min)</div>
              <div className="text-[11px] text-slate-400">
                Auto-mark room as abandoned after this
              </div>
            </div>
            <input
              type="number"
              value={settings.maxInactiveMin}
              onChange={(e) =>
                setSettings((s) => ({ ...s, maxInactiveMin: parseInt(e.target.value) || 30 }))
              }
              className="w-24 bg-black/40 rounded-lg px-3 py-2 text-sm border outline-none"
              style={{ borderColor: "rgba(0,183,255,0.3)" }}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-6 text-center">
          Admin actions are scoped to the Game Room module and never modify other Trey TV systems.
        </p>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div
    className="rounded-2xl p-3 border"
    style={{ background: "rgba(8,17,31,0.6)", borderColor: color + "40" }}
  >
    <div className="flex items-center gap-2 text-xs" style={{ color }}>
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-2xl font-black mt-1">{value}</div>
  </div>
);

const StatusBadge: React.FC<{ status: RoomRow["status"] }> = ({ status }) => {
  const m: Record<RoomRow["status"], { c: string; t: string }> = {
    waiting: { c: "#00B7FF", t: "Waiting" },
    active: { c: "#22C55E", t: "Active" },
    ended: { c: "#94A3B8", t: "Ended" },
    abandoned: { c: "#EF4444", t: "Abandoned" },
  };
  const entry = m[status];
  return (
    <span
      className="text-[10px] font-bold px-2 py-1 rounded-md"
      style={{ background: entry.c + "20", color: entry.c, border: "1px solid " + entry.c + "50" }}
    >
      {entry.t.toUpperCase()}
    </span>
  );
};

const ToggleRow: React.FC<{ label: string; value: boolean; onToggle: () => void }> = ({
  label,
  value,
  onToggle,
}) => (
  <div className="px-4 py-3 flex items-center justify-between">
    <div className="text-sm font-medium">{label}</div>
    <button
      onClick={onToggle}
      className="transition-colors"
      style={{ color: value ? "#22C55E" : "#475569" }}
    >
      {value ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
    </button>
  </div>
);
