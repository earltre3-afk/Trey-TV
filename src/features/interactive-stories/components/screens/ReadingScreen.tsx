import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  SkipForward,
  Play,
  Mic2,
  Radio,
  Volume2,
  ListMusic,
  Square,
  Sparkles,
} from "lucide-react";
import { Branch } from "../../lib/storyTypes";
import { MeterBar } from "../MeterBar";
import { VoicePlayer, VoiceSettingsToolbar } from "../VoicePlayer";
import { CHARACTERS, CHARACTER_PHOTO_MAP, getImageMeta } from "../../lib/storyData";
import {
  VoiceCharacterId,
  toVoiceId,
  stopVoice,
  loadVoiceSettings,
  resolveStoryVoiceForLine,
} from "../../lib/voiceLines";
import type { StoryBeatVoiceLine, StoryVoiceConfig } from "../../lib/storyVoiceTypes";
import {
  connectInteractiveStoryNarrator,
  getLiveKitNarratorConfig,
  type InteractiveStoryLiveKitSession,
  type NarrationStatusUpdate,
  type StoryDirectionUpdate,
} from "@/lib/livekitClientTools";
import {
  getInteractiveStoryMetadata,
  setCurrentInteractiveStoryNarrationContext,
} from "@/lib/interactiveStoryLiveKitAdapter";

interface Props {
  branch: Branch;
  onBack: () => void;
  onContinue: () => void;
  onOpenStatus: () => void;
  onReread?: () => void;
}

type Beat =
  | {
      kind: "narration";
      text: string;
      speakerId: string;
      speakerName: string;
      voice?: StoryVoiceConfig | null;
    }
  | {
      kind: "dialogue";
      text: string;
      speakerId: string;
      speakerName: string;
      avatar: string;
      voice?: StoryVoiceConfig | null;
    };

function characterAvatar(characterId: string, fallback?: string) {
  const match = CHARACTERS.find((candidate) => candidate.id === characterId);
  if (!match) return fallback || "/interactive-stories/portraits/narrator.png";
  const map = CHARACTER_PHOTO_MAP[match.mapKey];
  return map?.image || match.image || fallback || "/interactive-stories/portraits/narrator.png";
}

function beatsFromStructuredLines(
  lines: StoryBeatVoiceLine[] | undefined,
  chapter: Branch["chapters"][number],
): Beat[] {
  if (!lines?.length) return [];
  return [...lines]
    .filter((line) => typeof line.text === "string" && line.text.trim())
    .sort((a, b) => (a.lineIndex || 0) - (b.lineIndex || 0))
    .map((line) => {
      const resolved = resolveStoryVoiceForLine(
        line,
        chapter.characterVoices,
        chapter.storyCharacters,
      );
      const isDialogue =
        line.type === "dialogue" ||
        (resolved.characterId !== "narrator" && line.type !== "narration");
      if (!isDialogue) {
        return {
          kind: "narration",
          text: line.text.trim(),
          speakerId: "narrator",
          speakerName: "Narrator",
          voice: resolved.voice,
        };
      }
      return {
        kind: "dialogue",
        text: line.text.trim(),
        speakerId: resolved.characterId,
        speakerName: resolved.speakerName,
        avatar: characterAvatar(
          resolved.characterId,
          chapter.storyCharacters?.find((c) => c.character_id === resolved.characterId)?.portrait,
        ),
        voice: resolved.voice,
      };
    });
}

function getFriendlyNarratorError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || "");
  const lower = message.toLowerCase();

  if (
    lower.includes("invalid token") ||
    lower.includes("no valid credentials") ||
    lower.includes("authentication failed")
  ) {
    return "LiveKit rejected the narrator token. Check the API key and secret for this LiveKit URL.";
  }
  if (
    lower.includes("not configured") ||
    lower.includes("livekit url") ||
    lower.includes("missing")
  ) {
    return "LiveKit env missing. Add the LiveKit URL and server token credentials.";
  }
  if (lower.includes("token") && (lower.includes("failed") || lower.includes("unavailable"))) {
    return "LiveKit token route failed.";
  }
  if (lower.includes("signal") || lower.includes("connection") || lower.includes("websocket")) {
    return "Room connection failed.";
  }

  return "Live narration could not connect yet. Check the LiveKit project credentials and try again.";
}

/** Parse a chapter's prose into beats (narration + character dialogue). */
function parseBeats(prose: string): Beat[] {
  const paragraphs = prose
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const beats: Beat[] = [];

  // We'll detect "Speaker said," patterns and quoted text. If a paragraph
  // begins with a quoted line, we attempt to attribute it; otherwise we treat
  // the whole paragraph as narration but split out the embedded dialogue.
  let lastSpeaker: { id: VoiceCharacterId; name: string; avatar: string } | null = null;

  const findSpeakerInText = (text: string) => {
    const lower = text.toLowerCase();
    for (const c of CHARACTERS) {
      const re = new RegExp(`\\b${c.firstName}\\b`, "i");
      if (re.test(text) || lower.includes(c.name.toLowerCase())) {
        const map = CHARACTER_PHOTO_MAP[c.mapKey];
        return {
          id: toVoiceId(c.id),
          name: c.firstName,
          avatar: map?.image || c.image,
        };
      }
    }
    return null;
  };

  for (const p of paragraphs) {
    // Pull out quoted runs.
    const quoteRegex = /"([^"]+)"/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    let hadQuote = false;
    while ((m = quoteRegex.exec(p)) !== null) {
      hadQuote = true;
      const before = p.slice(lastIndex, m.index).trim();
      const quoted = m[1].trim();
      const after = p.slice(m.index + m[0].length, m.index + m[0].length + 60); // attribution lookahead

      if (before && !/^[,;.\s]+$/.test(before)) {
        // Look for speaker tag in the "before" segment first, then "after".
        const spk = findSpeakerInText(before) || findSpeakerInText(after);
        if (spk) lastSpeaker = spk;
        beats.push({
          kind: "narration",
          text: before,
          speakerId: "narrator",
          speakerName: "Narrator",
        });
      } else {
        const spk = findSpeakerInText(after);
        if (spk) lastSpeaker = spk;
      }

      const spk = lastSpeaker;
      if (spk) {
        beats.push({
          kind: "dialogue",
          text: quoted,
          speakerId: spk.id,
          speakerName: spk.name,
          avatar: spk.avatar,
        });
      } else {
        // Unattributed dialogue → narrator reads it.
        beats.push({
          kind: "narration",
          text: `"${quoted}"`,
          speakerId: "narrator",
          speakerName: "Narrator",
        });
      }
      lastIndex = m.index + m[0].length;
    }
    const tail = p.slice(lastIndex).trim();
    if (!hadQuote) {
      beats.push({ kind: "narration", text: p, speakerId: "narrator", speakerName: "Narrator" });
    } else if (tail && !/^[,;.\s]+$/.test(tail)) {
      beats.push({ kind: "narration", text: tail, speakerId: "narrator", speakerName: "Narrator" });
    }
  }

  return beats;
}

export const ReadingScreen: React.FC<Props> = ({
  branch,
  onBack,
  onContinue,
  onOpenStatus,
  onReread,
}) => {
  const chapter = branch.chapters[branch.chapters.length - 1];
  const [railOpen, setRailOpen] = useState(false);
  const [autoNarrate, setAutoNarrate] = useState(true);
  const [narratorStatus, setNarratorStatus] = useState<NarrationStatusUpdate>({
    message: "Not connected",
  });
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [spokenDirection, setSpokenDirection] = useState<StoryDirectionUpdate | null>(null);
  const [narratorMessage, setNarratorMessage] = useState(
    "Live narrator unavailable until connected.",
  );
  const sessionRef = React.useRef<InteractiveStoryLiveKitSession | null>(null);
  const narratorConfig = getLiveKitNarratorConfig();
  const storyMeta = useMemo(() => getInteractiveStoryMetadata(branch), [branch]);

  const beats = useMemo(() => {
    const structured = beatsFromStructuredLines(chapter.voiceLines, chapter);
    return structured.length ? structured : parseBeats(chapter.prose);
  }, [chapter]);
  const [revealCount, setRevealCount] = useState(1);
  const visibleBeats = beats.slice(0, revealCount);
  const isComplete = revealCount >= beats.length;
  const currentBeat = beats[revealCount - 1];

  useEffect(() => {
    setCurrentInteractiveStoryNarrationContext({
      branch,
      story: storyMeta,
      chapter,
      beat: chapter,
      currentBeatIndex: Math.max(0, chapter.number - 1),
    });
    return () => setCurrentInteractiveStoryNarrationContext(null);
  }, [branch, chapter, storyMeta]);

  // Reset on chapter change
  useEffect(() => {
    setRevealCount(1);
    stopVoice();
    return () => stopVoice();
  }, [chapter.number]);

  useEffect(() => {
    if (!autoNarrate || !sessionRef.current || connectionStatus !== "connected") return;
    sessionRef.current.sendCue("beat-changed").catch(() => {
      setNarratorMessage("The narrator could not receive the new beat cue.");
    });
  }, [autoNarrate, chapter.sceneId, chapter.number, connectionStatus]);

  const settings = loadVoiceSettings();
  const playbackSceneId = chapter.sceneId || `chapter_${chapter.number}`;
  const currentLineIndex = Math.max(0, revealCount - 1);
  const playbackToken = `${branch.id}:${playbackSceneId}:${currentLineIndex}`;

  const advance = () => {
    stopVoice();
    if (!isComplete) setRevealCount((n) => Math.min(beats.length, n + 1));
  };

  const skipAll = () => {
    stopVoice();
    setRevealCount(beats.length);
  };

  // Resolve face-safe framing for the chapter's hero image. Falls back to
  // "center 35%" cover, which keeps faces visible on the typical character
  // composition (faces in the upper-middle of the frame).
  const imgMeta = getImageMeta(chapter.image);
  const imageFit = chapter.imageFit || imgMeta.fit;
  const imagePosition = chapter.imagePosition || imgMeta.position;
  const heroFitClass = imageFit === "contain" ? "object-contain bg-zinc-950" : "object-cover";

  const startNarrator = async () => {
    if (sessionRef.current) return;
    setConnectionStatus("connecting");
    setNarratorMessage("token requested");
    try {
      const session = await connectInteractiveStoryNarrator({
        storyId: branch.storyId,
        beatId: chapter.sceneId || `chapter-${chapter.number}`,
        agentName: narratorConfig.agentName,
        onNarrationStatus: (status) => {
          setNarratorStatus(status);
          setNarratorMessage(status.message || `Narration ${status.status || "updated"}.`);
        },
        onSpokenDirection: setSpokenDirection,
        onStatusMessage: (message) => {
          setNarratorMessage(message);
          const lower = message.toLowerCase();
          if (lower === "connected" || lower.includes("reachable")) {
            setConnectionStatus("connected");
          }
          if (lower.includes("did not join") || lower.includes("failed")) {
            setConnectionStatus("error");
          }
          if (lower.includes("disconnected")) {
            setConnectionStatus("idle");
            sessionRef.current = null;
          }
        },
      });
      sessionRef.current = session;
      setConnectionStatus("connected");
      setNarratorStatus({
        status: "started",
        message: "connected",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setConnectionStatus("error");
      setNarratorMessage(`failed: ${getFriendlyNarratorError(error)}`);
      sessionRef.current?.disconnect();
      sessionRef.current = null;
    }
  };

  useEffect(() => {
    startNarrator();
    return () => {
      sessionRef.current?.disconnect();
      sessionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const testCurrentPageRpc = () => {
    if (!sessionRef.current) {
      setNarratorMessage("RPC tool not registered");
      return;
    }
    try {
      const result = sessionRef.current.testCurrentPageRpc();
      console.info("[LiveKit] local narrator tool check", {
        pageAvailable: Boolean((result.page as { available?: boolean })?.available),
        charactersAvailable: Boolean((result.characters as { available?: boolean })?.available),
        narrationScriptAvailable: Boolean(
          (result.narrationScript as { available?: boolean })?.available,
        ),
      });
      setNarratorMessage("RPC tools registered");
    } catch {
      setNarratorMessage("failed: RPC tool not registered");
    }
  };

  const stopNarrator = () => {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
    setConnectionStatus("idle");
    setNarratorStatus({
      status: "paused",
      message: "Narrator stopped.",
      timestamp: new Date().toISOString(),
    });
    setNarratorMessage("disconnected");
  };

  const sendNarratorCue = (cue: "read-current-beat" | "read-choices") => {
    if (!sessionRef.current || connectionStatus !== "connected") {
      setNarratorMessage("disconnected");
      return;
    }
    setNarratorMessage(
      cue === "read-current-beat" ? "reading current beat/page" : "reading choices",
    );
    sessionRef.current
      .sendCue(cue)
      .then(() => {
        setNarratorMessage(
          cue === "read-current-beat" ? "reading current beat/page" : "reading choices",
        );
      })
      .catch(() => {
        setNarratorMessage("failed: narrator cue could not be sent.");
      });
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Hero image — face-safe framing driven by SCENE_IMAGE_MAP metadata. */}
      {chapter.image && (
        <div className="relative aspect-[4/3] min-h-[260px] w-full overflow-hidden bg-zinc-950 sm:aspect-[16/9]">
          <img
            src={chapter.image}
            alt={chapter.title}
            className={`absolute inset-0 h-full w-full ${heroFitClass}`}
            style={{ objectPosition: imagePosition }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
          <button
            onClick={onBack}
            className="absolute left-4 top-10 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onOpenStatus}
            className="absolute right-4 top-10 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md"
          >
            <Activity className="h-5 w-5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
              Chapter {chapter.number}
            </div>
            <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-white">
              {chapter.title.replace(/^Chapter \d+\s*[—-]\s*/, "")}
            </h1>
          </div>
        </div>
      )}

      <section className="mx-5 mt-4 overflow-hidden rounded-[1.35rem] border border-cyan-300/20 bg-zinc-950/60 shadow-[0_0_34px_rgba(34,211,238,0.12)] backdrop-blur-xl">
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(8,47,73,0.62),rgba(88,28,135,0.28),rgba(0,0,0,0.2))] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200/80">
                <Mic2 className="h-4 w-4 text-cyan-300" />
                LiveKit Narrator
              </div>
              <h2 className="mt-1 font-display text-lg font-black text-white">
                Agent: {narratorConfig.agentName}
              </h2>
            </div>
            <div
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                connectionStatus === "connected"
                  ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.22)]"
                  : connectionStatus === "connecting"
                    ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100"
                    : connectionStatus === "error"
                      ? "border-red-300/40 bg-red-400/15 text-red-100"
                      : "border-white/15 bg-white/5 text-white/50"
              }`}
            >
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "connecting"
                  ? "Connecting"
                  : connectionStatus === "error"
                    ? "Failed"
                    : "Disconnected"}
            </div>
          </div>

          <div className="mt-3 grid gap-2 text-xs text-white/65 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              <div className="text-[9px] uppercase tracking-widest text-white/35">Story</div>
              <div className="truncate font-semibold text-white">{storyMeta.title}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              <div className="text-[9px] uppercase tracking-widest text-white/35">
                Chapter / Beat
              </div>
              <div className="truncate font-semibold text-white">{chapter.title}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              <div className="text-[9px] uppercase tracking-widest text-white/35">
                Narration Status
              </div>
              <div className="truncate font-semibold text-white">
                {narratorStatus.status || "idle"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-2 p-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={startNarrator}
            disabled={connectionStatus === "connecting" || connectionStatus === "connected"}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-cyan-100 transition hover:bg-cyan-400/15 disabled:opacity-45"
          >
            <Radio className="h-4 w-4" /> Start Narrator
          </button>
          <button
            type="button"
            onClick={stopNarrator}
            disabled={!sessionRef.current}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white/80 transition hover:bg-white/10 disabled:opacity-45"
          >
            <Square className="h-4 w-4" /> Stop Narrator
          </button>
          <button
            type="button"
            onClick={() => sendNarratorCue("read-current-beat")}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-violet-300/30 bg-violet-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-violet-100 transition hover:bg-violet-500/15"
          >
            <Volume2 className="h-4 w-4" /> Read Current Beat
          </button>
          <button
            type="button"
            onClick={() => sendNarratorCue("read-choices")}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-fuchsia-100 transition hover:bg-fuchsia-500/15"
          >
            <ListMusic className="h-4 w-4" /> Read Choices
          </button>
          <button
            type="button"
            onClick={testCurrentPageRpc}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-amber-100 transition hover:bg-amber-500/15"
          >
            <Activity className="h-4 w-4" /> Test Current Page RPC
          </button>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm text-white/75">
            <input
              type="checkbox"
              checked={autoNarrate}
              onChange={(event) => setAutoNarrate(event.target.checked)}
              className="h-4 w-4 accent-cyan-300"
            />
            Auto-Narrate Beats
          </label>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            {narratorMessage}
          </div>
        </div>

        {spokenDirection && (
          <div className="border-t border-white/10 bg-black/25 px-4 py-3 text-xs text-white/70">
            <div className="font-bold uppercase tracking-widest text-cyan-200/80">
              Spoken Direction
            </div>
            <div className="mt-1">{spokenDirection.transcript}</div>
            {spokenDirection.matchedChoiceText && (
              <div className="mt-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-emerald-100">
                Closest choice: {spokenDirection.matchedChoiceLabel}.{" "}
                {spokenDirection.matchedChoiceText}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Cinematic playback toolbar */}
      <div className="mx-5 mt-4 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur">
        <VoiceSettingsToolbar />
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
          <span>
            {Math.min(revealCount, beats.length)}/{beats.length}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              skipAll();
            }}
            className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/70"
          >
            <SkipForward className="h-3 w-3" /> Skip
          </button>
        </div>
      </div>

      {/* Collapsible meter rail */}
      <button
        onClick={() => setRailOpen((o) => !o)}
        className="mx-5 mt-3 flex w-[calc(100%-2.5rem)] items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80"
      >
        <span className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-violet-400" />
          Relationships & Risk
        </span>
        {railOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {railOpen && (
        <div className="mx-5 mt-2 space-y-2.5 rounded-xl border border-white/10 bg-black/40 p-4">
          <MeterBar label="Trust — Ari" value={branch.meters.trust_ari} color="pink" compact />
          <MeterBar
            label="Trust — Dante"
            value={branch.meters.trust_dante}
            color="violet"
            compact
          />
          <MeterBar
            label="Mom Suspicion"
            value={branch.meters.suspicion_mom}
            color="amber"
            compact
          />
          <MeterBar
            label="Coach Risk"
            value={branch.meters.suspicion_coach}
            color="amber"
            compact
          />
          <MeterBar label="Risk Level" value={branch.meters.risk_level} color="red" compact />
        </div>
      )}

      {/* Cinematic dialogue stream */}
      <div
        onClick={advance}
        className="mx-auto mt-4 max-w-2xl cursor-pointer select-none px-5"
        role="button"
        aria-label="Tap to advance"
      >
        <div className="space-y-3">
          {visibleBeats.map((b, i) => {
            const isLatest = i === visibleBeats.length - 1;
            if (b.kind === "narration") {
              return (
                <div
                  key={i}
                  className={`rounded-2xl px-2 py-1 ${isLatest ? "animate-in fade-in" : ""}`}
                >
                  <p className="font-serif text-[17px] leading-[1.75] text-white/85">{b.text}</p>
                  {isLatest && (
                    <div className="mt-2">
                      <VoicePlayer
                        characterId="narrator"
                        text={b.text}
                        speakerName={b.speakerName}
                        voice={b.voice}
                        compact
                        autoplayKey={`${branch.id}-${playbackSceneId}-${i}`}
                        playbackToken={playbackToken}
                        sceneId={playbackSceneId}
                        lineIndex={i}
                        onEnded={() => advance()}
                      />
                    </div>
                  )}
                </div>
              );
            }
            // Dialogue bubble
            return (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md ${
                  isLatest ? "ring-1 ring-violet-500/50 shadow-lg shadow-violet-500/10" : ""
                }`}
              >
                <img
                  src={b.avatar}
                  alt={b.speakerName}
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-white/20"
                  style={{ objectPosition: "center 25%" }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-display text-sm font-bold text-white">{b.speakerName}</div>
                    <div className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/60">
                      Voice Line
                    </div>
                  </div>
                  <p className="mt-1 font-serif text-[16px] italic leading-snug text-white/95">
                    "{b.text}"
                  </p>
                  {isLatest && (
                    <div className="mt-2">
                      <VoicePlayer
                        characterId={b.speakerId}
                        text={b.text}
                        voice={b.voice}
                        speakerName={b.speakerName}
                        avatarUrl={b.avatar}
                        compact
                        autoplayKey={`${branch.id}-${playbackSceneId}-${i}`}
                        playbackToken={playbackToken}
                        sceneId={playbackSceneId}
                        lineIndex={i}
                        onEnded={() => advance()}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!isComplete && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
            <Play className="h-3 w-3 fill-current" /> Tap to advance
          </div>
        )}
      </div>

      {/* Continue */}
      {isComplete && (
        <div className="space-y-2.5 px-5 pt-6">
          <button
            type="button"
            onClick={() => {
              stopVoice();
              onContinue();
            }}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 font-display text-base font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/30 transition-transform active:scale-[0.98]"
          >
            Continue
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          {onReread && branch.chapters.length > 1 && (
            <button
              type="button"
              onClick={() => {
                stopVoice();
                onReread();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/80 transition-colors hover:bg-white/10"
            >
              <Layers className="h-3.5 w-3.5" /> Re-read Chapters
            </button>
          )}
          <div className="mt-3 text-center text-xs text-white/40">
            Chapter {chapter.number} • {branch.chapters.length} chapter
            {branch.chapters.length === 1 ? "" : "s"} played •{" "}
            {branch.isComplete ? "Branch Complete" : "Branch In Progress"}
          </div>
        </div>
      )}
    </div>
  );
};
