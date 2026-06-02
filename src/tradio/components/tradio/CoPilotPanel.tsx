import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton, GlassCard } from './ui';
import { coPilotReadRoom, coPilotSuggestLine, coPilotSuggestSongs } from '@/lib/trey-i/vertex.server';

type CoPilotPanelProps = {
  live: any;
  interaction: any;
  showId?: string | null;
  myShows?: any[] | null;
};

export const CoPilotPanel: React.FC<CoPilotPanelProps> = ({ live, interaction, showId, myShows }) => {
  const [reading, setReading] = useState(false);
  const [readResult, setReadResult] = useState<{ energy: string; mood: string; highlights: string[]; suggestedTopic: string } | null>(null);

  const [suggesting, setSuggesting] = useState(false);
  const [suggestLine, setSuggestLine] = useState<string | null>(null);

  const [suggestSongsLoading, setSuggestSongsLoading] = useState(false);
  const [songPicks, setSongPicks] = useState<Array<{ title: string; artist: string; why: string }>>([]);

  const handleReadRoom = async () => {
    setReading(true);
    try {
      const messages = (interaction?.chat ?? []).slice(-20).map((c: any) => `${c.authorName || 'Listener'}: ${c.body}`);
      const res = await coPilotReadRoom({ data: { recentChat: messages } });
      setReadResult(res as any);
    } catch (err) {
      console.error('[CoPilotPanel] read error', err);
      setReadResult({ energy: 'low', mood: 'neutral', highlights: [], suggestedTopic: 'Ask the audience what they are into' });
    } finally {
      setReading(false);
    }
  };

  const handleSuggestLine = async () => {
    setSuggesting(true);
    try {
      const show = (myShows ?? []).find((s) => s.id === showId) ?? null;
      const showTitle = show?.title ?? '';
      const segmentTitle = '';
      const recentChat = (interaction?.chat ?? []).slice(-20).map((c: any) => c.body);
      const res = await coPilotSuggestLine({ data: { showTitle, segmentTitle, hostTone: 'casual', recentChat } });
      setSuggestLine((res as any).line ?? null);
    } catch (err) {
      console.error('[CoPilotPanel] suggest line error', err);
      setSuggestLine('(Co-pilot unavailable)');
    } finally {
      setSuggesting(false);
    }
  };

  const handleSpeakLine = (line?: string | null) => {
    if (!line) return;
    try {
      live.aiSpeak(line);
    } catch (err) {
      console.error('[CoPilotPanel] aiSpeak error', err);
    }
  };

  const handleSuggestSongs = async () => {
    setSuggestSongsLoading(true);
    try {
      const recentRequests = (interaction?.requests ?? []).slice(-10).map((r: any) => `${r.songTitle} — ${r.artist || ''}`);
      const mood = readResult?.mood ?? '';
      const res = await coPilotSuggestSongs({ data: { mood, recentRequests } });
      setSongPicks((res as any).picks ?? []);
    } catch (err) {
      console.error('[CoPilotPanel] suggest songs error', err);
      setSongPicks([]);
    } finally {
      setSuggestSongsLoading(false);
    }
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white">AI Co-Pilot</div>
      </div>

      <div className="mt-3 flex gap-2">
        <PrimaryButton onClick={handleReadRoom} disabled={reading}>{reading ? 'Reading…' : 'Read the room'}</PrimaryButton>
        <SecondaryButton onClick={handleSuggestLine} disabled={suggesting}>{suggesting ? 'Suggesting…' : 'Suggest a line'}</SecondaryButton>
        <SecondaryButton onClick={handleSuggestSongs} disabled={suggestSongsLoading}>{suggestSongsLoading ? 'Picking…' : 'Suggest songs'}</SecondaryButton>
      </div>

      <div className="mt-3 space-y-2 text-sm text-white/85">
        {readResult && (
          <div>
            <div className="font-semibold">Room: <span className="text-white/60">{readResult.energy} · {readResult.mood}</span></div>
            <div className="text-xs text-white/60">Highlights: {readResult.highlights.join(' · ') || 'None'}</div>
            <div className="text-xs text-white/60">Topic: {readResult.suggestedTopic}</div>
          </div>
        )}

        {suggestLine && (
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <div className="mb-2 text-sm">Suggestion</div>
            <div className="mb-2 text-white">{suggestLine}</div>
            <div className="flex gap-2">
              <PrimaryButton onClick={() => handleSpeakLine(suggestLine)}>Speak it</PrimaryButton>
              <SecondaryButton onClick={() => navigator.clipboard?.writeText(suggestLine)}>Copy</SecondaryButton>
            </div>
          </div>
        )}

        {songPicks.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Song picks</div>
            {songPicks.map((p, i) => (
              <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
                <div className="font-semibold text-white">{p.title} <span className="text-white/60">— {p.artist}</span></div>
                <div className="text-xs text-white/60">{p.why}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default CoPilotPanel;
