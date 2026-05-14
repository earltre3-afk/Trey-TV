import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, X, Send, Smile } from 'lucide-react';
import { ChatMessageRow } from '@/features/games/lib/services/chatService';

const SEAT_ACCENTS = ['#00B7FF', '#A855F7', '#FFC857', '#22C55E'];
const QUICK_PHRASES = ['Nice play', 'GG', 'BS!', 'My bag', 'One sec', 'Let’s run it'];
const QUICK_EMOJI = ['👏', '🔥', '💀', '😂', '🤝', '🫡'];

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - t);
  const s = Math.floor(diff / 1000);
  if (s < 5) return 'now';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

interface BadgeProps { unread: number; onClick: () => void; accent?: string; }
export const ChatHeaderButton: React.FC<BadgeProps> = ({ unread, onClick, accent = '#00B7FF' }) => (
  <button
    onClick={onClick}
    className="relative w-10 h-10 rounded-lg hover:bg-white/5 transition border border-white/5 inline-flex items-center justify-center"
    aria-label="Open chat"
    title="Chat"
  >
    <MessageSquare size={16} />
    {unread > 0 && (
      <span
        className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-black tabular-nums leading-none"
        style={{
          background: `linear-gradient(135deg, ${accent}, #fff2)`,
          color: '#fff',
          border: `1px solid ${accent}`,
          boxShadow: `0 0 10px ${accent}aa`,
        }}
      >
        {unread > 99 ? '99+' : unread}
      </span>
    )}
  </button>
);

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessageRow[];
  loading: boolean;
  myUserId: string | undefined;
  mySeat: number | null;
  onSend: (body: string, kind?: 'text' | 'quick' | 'emoji') => void | Promise<void>;
  accent?: string;
}

export const GameChatDrawer: React.FC<DrawerProps> = ({
  open, onClose, messages, loading, myUserId, mySeat, onSend, accent = '#00B7FF',
}) => {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when new messages arrive or drawer opens
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [open, messages.length]);

  const grouped = useMemo(() => {
    // Insert "today/yesterday" separators implicitly by leaving timestamps per-bubble.
    return messages;
  }, [messages]);

  const submit = () => {
    const v = draft.trim();
    if (!v) return;
    setDraft('');
    onSend(v, 'text');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity"
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Drawer */}
      <aside
        className="fixed left-0 right-0 bottom-0 z-50 mx-auto w-full max-w-md text-white"
        style={{
          transform: open ? 'translateY(0)' : 'translateY(102%)',
          transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        aria-hidden={!open}
      >
        <div
          className="rounded-t-3xl overflow-hidden border-t border-x relative flex flex-col trey-chat-drawer"
          style={{
            borderColor: `${accent}55`,
            boxShadow: `0 -28px 60px rgba(0,0,0,0.65), 0 -8px 36px ${accent}33, inset 0 1px 0 rgba(255,255,255,0.06)`,
            maxHeight: '78dvh',
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}, #A855F7, transparent)` }}
          />

          {/* Handle */}
          <div className="pt-2 pb-1 flex justify-center">
            <div className="h-1 w-10 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
          </div>

          {/* Header */}
          <div className="px-4 pb-2 flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
                border: `1px solid ${accent}66`,
                boxShadow: `0 0 14px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.08)`,
              }}
            >
              <MessageSquare size={14} style={{ color: accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[0.3em] font-black" style={{ color: accent }}>TABLE CHAT</div>
              <div className="text-[10px] text-slate-400 leading-tight">Live · room-only</div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 transition border border-white/5"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5"
            style={{ minHeight: '180px', maxHeight: '48dvh' }}
          >
            {loading && messages.length === 0 && (
              <div className="text-center text-xs text-slate-500 py-6">Loading chat…</div>
            )}
            {!loading && messages.length === 0 && (
              <div className="text-center text-xs text-slate-500 py-6">
                Be the first to talk trash. Or say <span className="text-cyan-300">“GG”</span>.
              </div>
            )}
            {grouped.map((m) => {
              const isMine = m.user_id === myUserId;
              const seatColor = m.seat_index != null ? SEAT_ACCENTS[m.seat_index % SEAT_ACCENTS.length] : '#94A3B8';
              const initial = (m.display_name || '?').charAt(0).toUpperCase();
              const isEmojiOnly = m.kind === 'emoji' || (m.body.length <= 4 && /^\p{Extended_Pictographic}+$/u.test(m.body));
              return (
                <div key={m.id} className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                  {!isMine && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                      style={{
                        background: `radial-gradient(circle at 30% 25%, ${seatColor}, ${seatColor}55 70%, #0a1228)`,
                        border: `1px solid ${seatColor}aa`,
                        color: '#fff',
                        textShadow: `0 0 6px ${seatColor}`,
                        boxShadow: `0 0 8px ${seatColor}66`,
                      }}
                      title={m.display_name}
                    >
                      {initial}
                    </div>
                  )}
                  <div className={`min-w-0 max-w-[78%] ${isMine ? 'items-end text-right' : 'items-start'}`}>
                    {!isMine && (
                      <div className="text-[9px] font-bold mb-0.5 px-1 truncate" style={{ color: seatColor }}>
                        {m.display_name}
                        <span className="text-slate-600 font-medium"> · {timeAgo(m.created_at)}</span>
                      </div>
                    )}
                    <div
                      className={`inline-block px-2.5 py-1.5 rounded-2xl text-[12px] leading-snug break-words ${isEmojiOnly ? 'text-2xl px-1.5 py-0.5' : ''}`}
                      style={{
                        background: isMine
                          ? `linear-gradient(135deg, ${accent}33, ${accent}10)`
                          : 'rgba(255,255,255,0.06)',
                        border: '1px solid ' + (isMine ? `${accent}55` : 'rgba(255,255,255,0.08)'),
                        color: '#F8FAFC',
                        boxShadow: isMine ? `0 0 12px ${accent}22` : '0 1px 0 rgba(255,255,255,0.04) inset',
                        borderBottomRightRadius: isMine ? 6 : undefined,
                        borderBottomLeftRadius: !isMine ? 6 : undefined,
                      }}
                    >
                      {m.body}
                    </div>
                    {isMine && (
                      <div className="text-[9px] text-slate-500 mt-0.5 px-1">{timeAgo(m.created_at)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick phrase strip */}
          <div className="px-3 pt-1.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1.5">
              {QUICK_PHRASES.map(q => (
                <button
                  key={q}
                  onClick={() => onSend(q, 'quick')}
                  className="shrink-0 px-2.5 h-7 rounded-full text-[11px] font-bold transition active:scale-95"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${accent}44`,
                    color: '#E2E8F0',
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 8px ${accent}22`,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-1 pb-1.5">
              {QUICK_EMOJI.map(e => (
                <button
                  key={e}
                  onClick={() => onSend(e, 'emoji')}
                  className="shrink-0 w-8 h-8 rounded-full text-base flex items-center justify-center transition active:scale-90"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  aria-label={`React with ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={(ev) => { ev.preventDefault(); submit(); }}
            className="px-3 pt-1.5 pb-3 border-t flex items-center gap-2"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="flex-1 flex items-center gap-1.5 rounded-full pl-3 pr-1 h-10"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${accent}33`,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <Smile size={14} className="text-slate-500 shrink-0" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message the table…"
                maxLength={280}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
                }}
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 active:scale-95 transition"
                style={{
                  background: draft.trim() ? `linear-gradient(135deg, ${accent}, #A855F7)` : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  boxShadow: draft.trim() ? `0 0 14px ${accent}66` : 'none',
                }}
                aria-label="Send"
              >
                <Send size={13} />
              </button>
            </div>
            {mySeat != null && (
              <div
                className="text-[9px] font-black tracking-widest px-2 py-1 rounded-full shrink-0"
                style={{
                  color: SEAT_ACCENTS[mySeat % SEAT_ACCENTS.length],
                  border: `1px solid ${SEAT_ACCENTS[mySeat % SEAT_ACCENTS.length]}55`,
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                SEAT {mySeat + 1}
              </div>
            )}
          </form>
        </div>
      </aside>
    </>
  );
};
