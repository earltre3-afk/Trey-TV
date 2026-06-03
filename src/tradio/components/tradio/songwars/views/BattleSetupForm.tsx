import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowLeft,
  Plus,
  Check,
  Shield,
  AlertCircle,
  Calendar,
  Play,
  Radio,
  Volume2,
  ShieldAlert,
  Users,
  Award,
  Trophy,
} from "lucide-react";
import { GlassCard, PrimaryButton, SecondaryButton } from "../../ui";
import { ContentFeelAnalysisPanel } from "../../../content-feel/ContentFeelComponents";
import { useContentFeelAnalysis } from "../../../content-feel/useContentFeelAnalysis";
import { LegalAcceptanceGroup } from "../../legal/LegalPrimitives";
import {
  createLegalAcceptanceValues,
  isLegalFlowAccepted,
  LEGAL_ACCEPTANCE_FLOWS,
  recordLegalFlowAcceptance,
  type LegalAcceptanceValues,
} from "../../legal/legalAcceptanceConfig";
import { MOCK_SONG_WAR_ARTISTS } from "../data";
import type { SongWarArtist, SongWarTrack, SongWarBattle } from "../types";

interface BattleSetupFormProps {
  onBack: () => void;
  onPublish: (newBattle: SongWarBattle) => void;
}

export const BattleSetupForm: React.FC<BattleSetupFormProps> = ({ onBack, onPublish }) => {
  // Setup inputs
  const [title, setTitle] = useState("Neon Horizon Battle Showcase");
  const [battleType, setBattleType] = useState<
    | "Artist vs Artist"
    | "Producer Beat Battle"
    | "DJ Mix Battle"
    | "City vs City"
    | "New Release Battle"
    | "Fan Pick Battle"
  >("Artist vs Artist");

  const [artistA, setArtistA] = useState<SongWarArtist | null>(MOCK_SONG_WAR_ARTISTS.treyTrizzy);
  const [artistB, setArtistB] = useState<SongWarArtist | null>(null); // Start with missing artist for validation testing

  const [roundsCount, setRoundsCount] = useState(3);
  const [roundDuration, setRoundDuration] = useState(90); // seconds
  const [votingDuration, setVotingDuration] = useState(45); // seconds
  const [hostName, setHostName] = useState("DJ Midnight Spin");
  const [scheduleDate, setScheduleDate] = useState("2025-06-15T21:00");
  const [visibility, setVisibility] = useState<"Public" | "Private" | "Invite Only">("Public");
  const [moderationMode, setModerationMode] = useState<"Auto" | "Host Controlled" | "Admin Only">(
    "Host Controlled",
  );

  // Interactive toggles
  const [allowFanChat, setAllowFanChat] = useState(true);
  const [allowGIFs, setAllowGIFs] = useState(true);
  const [allowEmojiReactions, setAllowEmojiReactions] = useState(true);
  const [allowAnimatedReactions, setAllowAnimatedReactions] = useState(true);
  const [allowFanSongRequests, setAllowFanSongRequests] = useState(false);

  const [prize, setPrize] = useState("Tradio Champions Diamond Disc Badge");

  const [legalValues, setLegalValues] = useState<LegalAcceptanceValues>(() =>
    createLegalAcceptanceValues("song_wars_create"),
  );
  const [legalStatus, setLegalStatus] = useState<
    "idle" | "saving" | "saved" | "fallback" | "error"
  >("idle");
  const [legalMessage, setLegalMessage] = useState<string | null>(null);
  const legalAccepted = isLegalFlowAccepted("song_wars_create", legalValues);

  const battleContentFeel = useContentFeelAnalysis({
    contentId: "draft-song-war-battle",
    contentType: "song_war_battle",
    sourcePlatform: "tradio",
    title,
    description: `${battleType} battle${artistA ? ` featuring ${artistA.name}` : ""}${artistB ? ` vs ${artistB.name}` : ""}`,
    creatorTags: [battleType],
  });

  // Track selection lists per round
  const [tracksA, setTracksA] = useState<string[]>(["", "", "", "", ""]);
  const [tracksB, setTracksB] = useState<string[]>(["", "", "", "", ""]);

  // Validation warnings
  const [validation, setValidation] = useState<{
    status: "missing_artist" | "round_mismatch" | "missing_songs" | "ready";
    message: string;
  }>({ status: "missing_artist", message: "Artist B is not selected." });

  // Mock track names list for easy selection
  const mockTrackOptions = [
    { title: "Midnight Velvet", artist: "Trey Trizzy" },
    { title: "6AM Thoughts", artist: "Trey Trizzy" },
    { title: "Neon Heartbreak", artist: "Trey Trizzy" },
    { title: "Falling For You", artist: "Mila Rain" },
    { title: "Sunset Boulevard Beat", artist: "JAYE." },
    { title: "City Lights", artist: "JAYE." },
    { title: "Under City Lights", artist: "JAYE." },
    { title: "Grid Runner Loop", artist: "Darius Cole" },
    { title: "Deep Soul Blend", artist: "Kiana Lane" },
    { title: "Late Night Soul", artist: "Kiana Lane" },
  ];

  // Perform setup validation on change
  useEffect(() => {
    if (!artistA || !artistB) {
      setValidation({
        status: "missing_artist",
        message:
          "A battle requires two distinct artists. Please select Challenger B in the Blue Corner.",
      });
      return;
    }

    if (artistA.id === artistB.id) {
      setValidation({
        status: "missing_artist",
        message: "Artists must be different. Please select a separate challenger for Competitor B.",
      });
      return;
    }

    // Verify songs selection up to rounds count
    let missingSong = false;
    for (let i = 0; i < roundsCount; i++) {
      if (!tracksA[i] || !tracksB[i]) {
        missingSong = true;
        break;
      }
    }

    if (missingSong) {
      setValidation({
        status: "missing_songs",
        message: `Some rounds are missing song selections. Make sure to assign tracks for all ${roundsCount} rounds or click 'Quick Auto-Fill'.`,
      });
      return;
    }

    // Success state
    setValidation({
      status: "ready",
      message:
        "All system validation checks passed! Your Song Wars battle configuration is locked in and ready to go live.",
    });
  }, [artistA, artistB, roundsCount, tracksA, tracksB]);

  const handleTrackChange = (artist: "A" | "B", index: number, value: string) => {
    if (artist === "A") {
      const copy = [...tracksA];
      copy[index] = value;
      setTracksA(copy);
    } else {
      const copy = [...tracksB];
      copy[index] = value;
      setTracksB(copy);
    }
  };

  const handlePreFillSongs = () => {
    if (artistA && artistB) {
      const selectedSongsA = mockTrackOptions
        .filter((o) => o.artist === artistA.name)
        .map((o) => o.title);
      const selectedSongsB = mockTrackOptions
        .filter((o) => o.artist === artistB.name)
        .map((o) => o.title);

      const filledA = [...tracksA];
      const filledB = [...tracksB];

      for (let i = 0; i < roundsCount; i++) {
        filledA[i] = selectedSongsA[i % selectedSongsA.length] || "Improvised Loop " + (i + 1);
        filledB[i] = selectedSongsB[i % selectedSongsB.length] || "Challenger Track " + (i + 1);
      }

      setTracksA(filledA);
      setTracksB(filledB);
    } else {
      const filledA = [...tracksA];
      const filledB = [...tracksB];
      for (let i = 0; i < roundsCount; i++) {
        filledA[i] = "Midnight Velvet";
        filledB[i] = "Falling For You";
      }
      setTracksA(filledA);
      setTracksB(filledB);
    }
  };

  const handlePublishClick = async (launchLive: boolean) => {
    if (validation.status !== "ready" || !legalAccepted || legalStatus === "saving") return;
    setLegalStatus("saving");
    const result = await recordLegalFlowAcceptance("song_wars_create", legalValues, {
      referenceId: title,
      title,
      battleType,
      hostName,
      launchLive,
      roundsCount,
    });
    setLegalStatus(result.source === "supabase" ? "saved" : "fallback");
    setLegalMessage(
      result.source === "supabase" ? "Song Wars acknowledgement saved." : result.warning,
    );

    const roundsList = Array.from({ length: roundsCount }).map((_, i) => {
      return {
        roundNumber: i + 1,
        trackA: {
          id: `setup-a-${i}`,
          title: tracksA[i],
          artist: artistA!.name,
          art: artistA!.avatar,
          src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        },
        trackB: {
          id: `setup-b-${i}`,
          title: tracksB[i],
          artist: artistB!.name,
          art: artistB!.avatar,
          src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        },
        votesA: launchLive && i === 0 ? 120 : 0,
        votesB: launchLive && i === 0 ? 140 : 0,
        winner: null as "A" | "B" | null,
        duration: roundDuration,
        status:
          launchLive && i === 0
            ? ("playing" as "pending" | "playing" | "voting" | "completed")
            : ("pending" as "pending" | "playing" | "voting" | "completed"),
      };
    });

    const newBattle: SongWarBattle = {
      id: `battle-custom-${Date.now()}`,
      title,
      type: battleType,
      artistA: artistA!,
      artistB: artistB!,
      roundsCount,
      rounds: roundsList,
      currentRoundIndex: 0,
      duration: roundDuration,
      votingDuration,
      hostId: "host-user",
      hostName,
      scheduleDate: launchLive ? "LIVE NOW" : new Date(scheduleDate).toLocaleString(),
      visibility,
      moderationMode,
      settings: {
        allowFanChat,
        allowGIFs,
        allowEmojiReactions,
        allowAnimatedReactions,
        allowFanSongRequests,
      },
      prize,
      status: launchLive ? "live" : "upcoming",
      listenersCount: launchLive ? 2300 : 0,
      scoreA: 0,
      scoreB: 0,
      winnerId: null,
      category: battleType,
    };

    onPublish(newBattle);
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation Back */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/50 hover:text-white hover:translate-x-[-2px] transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Song Wars Hub
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Inputs (Left & Center Columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Title & Type Setup */}
          <div className="rounded-[2rem] border-[0.5px] border-white/10 bg-gradient-to-br from-[#150D2E]/40 to-[#05050A]/95 p-6 md:p-8 backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-fuchsia-400" /> Setup New Song War
            </h1>
            <p className="text-xs text-white/50 mt-1 font-medium">
              Configure live voting rules, artists slots, rounds, and fan interactive features.
            </p>

            <div className="mt-8 space-y-6">
              {/* Title input */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-purple-300 mb-2.5">
                  Battle Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.02] px-4.5 py-3.5 text-sm text-white focus:border-purple-500/50 focus:bg-white/[0.04] focus:outline-none transition-all duration-300 shadow-inner"
                  placeholder="e.g. East Coast vs West Coast Melodic Clash"
                />
              </div>

              {/* Custom Selector Cards for Battle Category */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-purple-300 mb-3">
                  Battle Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(
                    [
                      "Artist vs Artist",
                      "Producer Beat Battle",
                      "DJ Mix Battle",
                      "City vs City",
                      "New Release Battle",
                      "Fan Pick Battle",
                    ] as const
                  ).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBattleType(type)}
                      className={`rounded-2xl border text-left p-4.5 transition-all duration-300 flex flex-col justify-between h-24 relative overflow-hidden group ${
                        battleType === type
                          ? "border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] scale-[1.02]"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="text-xs font-black text-white leading-snug group-hover:text-purple-300 transition-colors">
                        {type}
                      </span>
                      <span className="text-[9px] text-purple-300/60 font-black uppercase tracking-widest mt-2">
                        Active Type
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Competitors Corner */}
          <div className="rounded-[2rem] border-[0.5px] border-white/10 bg-gradient-to-br from-[#150D2E]/40 to-[#05050A]/95 p-6 md:p-8 backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <h2 className="text-xl font-black text-white">Challenger Slots</h2>
            <p className="text-xs text-white/50 mt-1 font-medium">
              Select the competitors entering the live-clash arena.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Artist A Column */}
              <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-950/10 p-5 relative overflow-hidden">
                <div className="flex items-center gap-2 text-xs font-black text-fuchsia-400 uppercase tracking-widest mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                  </span>
                  Competitor A (Red Corner)
                </div>

                <div className="relative">
                  <select
                    value={artistA?.id || ""}
                    onChange={(e) =>
                      setArtistA(
                        Object.values(MOCK_SONG_WAR_ARTISTS).find((a) => a.id === e.target.value) ||
                          null,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#07050d] px-3.5 py-3 text-xs text-white focus:outline-none focus:border-fuchsia-500/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose Artist --</option>
                    {Object.values(MOCK_SONG_WAR_ARTISTS).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-white/40 text-xs"></div>
                </div>

                {artistA && (
                  <div className="mt-4 flex items-center gap-3.5 bg-black/40 border border-white/5 p-3.5 rounded-xl shadow-inner">
                    <img
                      src={artistA.avatar}
                      alt=""
                      className="h-11 w-11 rounded-xl object-cover border border-white/10"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white flex items-center gap-1">
                        {artistA.name}
                        {artistA.verified && (
                          <Check className="h-3.5 w-3.5 text-fuchsia-400 fill-current bg-fuchsia-400/10 p-0.5 rounded-full" />
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-fuchsia-300/80 uppercase tracking-wider truncate mt-0.5">
                        {artistA.station}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Artist B Column */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-5 relative overflow-hidden">
                <div className="flex items-center gap-2 text-xs font-black text-cyan-400 uppercase tracking-widest mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  Competitor B (Blue Corner)
                </div>

                <div className="relative">
                  <select
                    value={artistB?.id || ""}
                    onChange={(e) =>
                      setArtistB(
                        Object.values(MOCK_SONG_WAR_ARTISTS).find((a) => a.id === e.target.value) ||
                          null,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#05060d] px-3.5 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose Artist --</option>
                    {Object.values(MOCK_SONG_WAR_ARTISTS).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-white/40 text-xs"></div>
                </div>

                {artistB ? (
                  <div className="mt-4 flex items-center gap-3.5 bg-black/40 border border-white/5 p-3.5 rounded-xl shadow-inner">
                    <img
                      src={artistB.avatar}
                      alt=""
                      className="h-11 w-11 rounded-xl object-cover border border-white/10"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white flex items-center gap-1">
                        {artistB.name}
                        {artistB.verified && (
                          <Check className="h-3.5 w-3.5 text-cyan-400 fill-current bg-cyan-400/10 p-0.5 rounded-full" />
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-cyan-300/80 uppercase tracking-wider truncate mt-0.5">
                        {artistB.station}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center py-4 bg-rose-500/10 border border-dashed border-rose-500/20 rounded-xl text-[11px] text-rose-300 flex flex-col items-center justify-center gap-1">
                    <ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse" />
                    <span>Awaiting Challenger Selection</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rounds Setup */}
          <div className="rounded-[2rem] border-[0.5px] border-white/10 bg-gradient-to-br from-[#150D2E]/40 to-[#05050A]/95 p-6 md:p-8 backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Rounds Configuration</h2>
                <p className="text-xs text-white/50 mt-1 font-medium">
                  Assign specific battle songs for every individual round matchup.
                </p>
              </div>
              <button
                onClick={handlePreFillSongs}
                className="text-[10px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/15 border border-purple-500/30 rounded-full px-4.5 py-2 hover:bg-purple-500/25 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              >
                Quick Auto-Fill Songs
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Number of rounds selector */}
              <div className="flex items-center gap-4 bg-black/20 p-2.5 rounded-2xl border border-white/5 inline-flex">
                <span className="text-xs font-bold text-white/60 pl-2">Number of Rounds:</span>
                <div className="flex gap-1.5">
                  {[1, 3, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRoundsCount(n)}
                      className={`h-9 w-10 rounded-xl border text-xs font-black transition-all ${
                        roundsCount === n
                          ? "bg-purple-500 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                          : "bg-white/5 text-white/60 border-white/8 hover:bg-white/10"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic list inputs based on roundsCount */}
              <div className="space-y-5">
                {Array.from({ length: roundsCount }).map((_, i) => {
                  const roundNum = i + 1;
                  return (
                    <div key={roundNum} className="border-t border-white/5 pt-5">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-400/20 px-3 py-1 text-[10px] font-black text-purple-300 uppercase tracking-widest mb-4">
                        Round {roundNum} Matches
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Competitor A Song */}
                        <div>
                          <label className="block text-[9px] font-black text-fuchsia-400 uppercase tracking-widest mb-1.5">
                            {artistA ? artistA.name : "Artist A"} Song
                          </label>
                          <div className="relative">
                            <select
                              value={tracksA[i] || ""}
                              onChange={(e) => handleTrackChange("A", i, e.target.value)}
                              className="w-full rounded-xl border border-white/8 bg-[#0d091a] px-3.5 py-3 text-xs text-white focus:outline-none focus:border-purple-500/30 appearance-none cursor-pointer"
                            >
                              <option value="">-- Choose Song --</option>
                              {mockTrackOptions.map((o, idx) => (
                                <option key={idx} value={o.title}>
                                  {o.title} ({o.artist})
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/40 text-xs"></div>
                          </div>
                        </div>

                        {/* Competitor B Song */}
                        <div>
                          <label className="block text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1.5">
                            {artistB ? artistB.name : "Artist B"} Song
                          </label>
                          <div className="relative">
                            <select
                              value={tracksB[i] || ""}
                              onChange={(e) => handleTrackChange("B", i, e.target.value)}
                              className="w-full rounded-xl border border-white/8 bg-[#05060d] px-3.5 py-3 text-xs text-white focus:outline-none focus:border-purple-500/30 appearance-none cursor-pointer"
                            >
                              <option value="">-- Choose Song --</option>
                              {mockTrackOptions.map((o, idx) => (
                                <option key={idx} value={o.title}>
                                  {o.title} ({o.artist})
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/40 text-xs"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Advanced Session Rules */}
          <div className="rounded-[2rem] border-[0.5px] border-white/10 bg-gradient-to-br from-[#150D2E]/40 to-[#05050A]/95 p-6 md:p-8 backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <h2 className="text-xl font-black text-white">Advanced Session Rules</h2>
            <p className="text-xs text-white/50 mt-1 font-medium">
              Control pacing, moderation parameters, and accessibility tier.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              {/* Duration inputs */}
              <div className="space-y-5">
                <div>
                  <label className="flex justify-between text-xs font-bold text-white/60 mb-2">
                    <span>Round Duration</span>
                    <strong className="text-purple-300 font-black">{roundDuration} seconds</strong>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="180"
                    step="15"
                    value={roundDuration}
                    onChange={(e) => setRoundDuration(Number(e.target.value))}
                    className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold text-white/60 mb-2">
                    <span>Voting Duration</span>
                    <strong className="text-purple-300 font-black">{votingDuration} seconds</strong>
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="90"
                    step="5"
                    value={votingDuration}
                    onChange={(e) => setVotingDuration(Number(e.target.value))}
                    className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>

              {/* Host & Date inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-purple-300 mb-1.5">
                    Host / Moderator Name
                  </label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-[#0d091a] px-3.5 py-3 text-xs text-white focus:outline-none focus:border-purple-500/30 transition-all"
                    placeholder="e.g. DJ Midnight Spin"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-purple-300 mb-1.5">
                    Schedule Launch Date
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-[#0d091a] px-3.5 py-3 text-xs text-white focus:outline-none focus:border-purple-500/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Visibility, Moderation & Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/5 pt-6 mt-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-purple-300 mb-3">
                  Visibility State
                </label>
                <div className="flex flex-col gap-2">
                  {(["Public", "Private", "Invite Only"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVisibility(v)}
                      className={`text-left rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all ${
                        visibility === v
                          ? "border-purple-500 bg-purple-500/10 text-purple-300"
                          : "border-white/5 bg-white/[0.01] text-white/50 hover:bg-white/5"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-purple-300 mb-3">
                  Moderation Mode
                </label>
                <div className="flex flex-col gap-2">
                  {(["Auto", "Host Controlled", "Admin Only"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModerationMode(m)}
                      className={`text-left rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all ${
                        moderationMode === m
                          ? "border-purple-500 bg-purple-500/10 text-purple-300"
                          : "border-white/5 bg-white/[0.01] text-white/50 hover:bg-white/5"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles (Premium Sliders) */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-purple-300 mb-3">
                  Interactive Privileges
                </label>
                <div className="space-y-2">
                  {/* Chat Toggle */}
                  <button
                    type="button"
                    onClick={() => setAllowFanChat(!allowFanChat)}
                    className="flex items-center justify-between w-full rounded-xl bg-black/30 border border-white/5 p-2.5 px-3 hover:bg-black/50 transition-all text-left"
                  >
                    <span className="text-[11px] font-semibold text-white/70">Fan Chat</span>
                    <div
                      className={`relative h-4 w-8 rounded-full p-0.5 transition-colors ${allowFanChat ? "bg-fuchsia-500" : "bg-white/10"}`}
                    >
                      <div
                        className={`h-3 w-3 rounded-full bg-white transition-transform ${allowFanChat ? "translate-x-4" : "translate-x-0"}`}
                      />
                    </div>
                  </button>

                  {/* GIFs Toggle */}
                  <button
                    type="button"
                    onClick={() => setAllowGIFs(!allowGIFs)}
                    className="flex items-center justify-between w-full rounded-xl bg-black/30 border border-white/5 p-2.5 px-3 hover:bg-black/50 transition-all text-left"
                  >
                    <span className="text-[11px] font-semibold text-white/70">GIF Pickers</span>
                    <div
                      className={`relative h-4 w-8 rounded-full p-0.5 transition-colors ${allowGIFs ? "bg-fuchsia-500" : "bg-white/10"}`}
                    >
                      <div
                        className={`h-3 w-3 rounded-full bg-white transition-transform ${allowGIFs ? "translate-x-4" : "translate-x-0"}`}
                      />
                    </div>
                  </button>

                  {/* Emoji Toggle */}
                  <button
                    type="button"
                    onClick={() => setAllowEmojiReactions(!allowEmojiReactions)}
                    className="flex items-center justify-between w-full rounded-xl bg-black/30 border border-white/5 p-2.5 px-3 hover:bg-black/50 transition-all text-left"
                  >
                    <span className="text-[11px] font-semibold text-white/70">Emoji Trays</span>
                    <div
                      className={`relative h-4 w-8 rounded-full p-0.5 transition-colors ${allowEmojiReactions ? "bg-fuchsia-500" : "bg-white/10"}`}
                    >
                      <div
                        className={`h-3 w-3 rounded-full bg-white transition-transform ${allowEmojiReactions ? "translate-x-4" : "translate-x-0"}`}
                      />
                    </div>
                  </button>

                  {/* Screen Bursts Toggle */}
                  <button
                    type="button"
                    onClick={() => setAllowAnimatedReactions(!allowAnimatedReactions)}
                    className="flex items-center justify-between w-full rounded-xl bg-black/30 border border-white/5 p-2.5 px-3 hover:bg-black/50 transition-all text-left"
                  >
                    <span className="text-[11px] font-semibold text-white/70">Screen Bursts</span>
                    <div
                      className={`relative h-4 w-8 rounded-full p-0.5 transition-colors ${allowAnimatedReactions ? "bg-fuchsia-500" : "bg-white/10"}`}
                    >
                      <div
                        className={`h-3 w-3 rounded-full bg-white transition-transform ${allowAnimatedReactions ? "translate-x-4" : "translate-x-0"}`}
                      />
                    </div>
                  </button>

                  {/* Song Requests Toggle */}
                  <button
                    type="button"
                    onClick={() => setAllowFanSongRequests(!allowFanSongRequests)}
                    className="flex items-center justify-between w-full rounded-xl bg-black/30 border border-white/5 p-2.5 px-3 hover:bg-black/50 transition-all text-left"
                  >
                    <span className="text-[11px] font-semibold text-white/70">Run-it-backs</span>
                    <div
                      className={`relative h-4 w-8 rounded-full p-0.5 transition-colors ${allowFanSongRequests ? "bg-fuchsia-500" : "bg-white/10"}`}
                    >
                      <div
                        className={`h-3 w-3 rounded-full bg-white transition-transform ${allowFanSongRequests ? "translate-x-4" : "translate-x-0"}`}
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/5 pt-5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-purple-300 mb-1.5">
                Prize Placement / Trophy Title
              </label>
              <input
                type="text"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                className="w-full rounded-xl border border-white/8 bg-[#0d091a] px-3.5 py-3 text-xs text-white focus:outline-none focus:border-purple-500/30 transition-all"
                placeholder="e.g. Gold Record Badge"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Card & Validation Panel (Right Column) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6 space-y-6">
            {/* Live Updating Card Preview */}
            <div className="rounded-[2rem] border-[0.5px] border-purple-500/30 bg-gradient-to-br from-[#1C0B2E]/90 to-[#0A0A0F]/95 p-6 shadow-[0_0_35px_rgba(168,85,247,0.2)] overflow-hidden relative">
              <div className="absolute top-0 right-0 h-32 w-32 bg-purple-500/10 blur-2xl rounded-full pointer-events-none" />

              <span className="text-[9px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-400/20 px-3 py-1 rounded-full">
                CARD PREVIEW
              </span>

              <div className="mt-5">
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 px-3 py-1 text-[9px] font-black text-cyan-300 uppercase tracking-wider">
                  {visibility} {battleType}
                </span>
                <h3 className="mt-4 text-xl font-black text-white tracking-tight leading-snug truncate">
                  {title}
                </h3>
                <p className="text-[10px] text-white/40 mt-1">Session Host: {hostName}</p>
              </div>

              {/* Competitors versus row */}
              <div className="mt-6 flex items-center justify-between bg-black/40 rounded-2xl border border-white/5 p-4 text-center relative">
                <div className="w-[42%] min-w-0">
                  <div className="relative inline-block p-1 bg-white/5 border border-white/10 rounded-xl">
                    <img
                      src={artistA ? artistA.avatar : MOCK_SONG_WAR_ARTISTS.treyTrizzy.avatar}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    {artistA?.verified && (
                      <span className="absolute -bottom-1 -right-1 block h-4 w-4 rounded-full bg-fuchsia-500 text-[10px] font-black text-white border-2 border-[#0A0A0F]" />
                    )}
                  </div>
                  <div className="text-[11px] font-black text-white mt-2 truncate">
                    {artistA ? artistA.name : "Awaiting competitor"}
                  </div>
                </div>

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[9px] font-black italic text-white/50 border border-white/5">
                  VS
                </div>

                <div className="w-[42%] min-w-0">
                  <div className="relative inline-block p-1 bg-white/5 border border-white/10 rounded-xl">
                    <img
                      src={artistB ? artistB.avatar : MOCK_SONG_WAR_ARTISTS.milaRain.avatar}
                      alt=""
                      className={`h-12 w-12 rounded-lg object-cover ${artistB ? "" : "opacity-40"}`}
                    />
                    {artistB?.verified && (
                      <span className="absolute -bottom-1 -right-1 block h-4 w-4 rounded-full bg-cyan-500 text-[10px] font-black text-white border-2 border-[#0A0A0F]" />
                    )}
                  </div>
                  <div className="text-[11px] font-black text-white mt-2 truncate">
                    {artistB ? artistB.name : "Awaiting challenger"}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2.5 text-xs text-white/50 border-t border-white/5 pt-5">
                <div className="flex justify-between">
                  <span>Match Setup:</span>
                  <span className="text-white font-black">
                    {roundsCount} Rounds ({roundDuration}s play)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sponsor Prize:</span>
                  <span className="text-purple-300 font-black max-w-[120px] truncate">{prize}</span>
                </div>
              </div>
            </div>

            {/* Validation Panel */}
            <div
              className={`rounded-3xl border p-6 backdrop-blur-2xl shadow-lg transition-all duration-500 ${
                validation.status === "ready"
                  ? "border-emerald-500/25 bg-gradient-to-br from-[#031D0E]/80 to-[#020704]/95 shadow-[0_10px_30px_rgba(16,185,129,0.15)]"
                  : "border-rose-500/25 bg-gradient-to-br from-[#2D0B12]/80 to-[#0A0507]/95"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 shrink-0">
                  {validation.status === "ready" ? (
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <Check className="h-4 w-4 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center animate-pulse">
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white">
                    System Verification
                  </h4>
                  <p className="mt-2 text-xs text-white/60 leading-relaxed font-medium">
                    {validation.message}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <ContentFeelAnalysisPanel
                  profile={battleContentFeel.profile}
                  status={battleContentFeel.status}
                  onRun={battleContentFeel.run}
                  compact
                />
              </div>

              <div className="mt-5">
                <LegalAcceptanceGroup
                  config={LEGAL_ACCEPTANCE_FLOWS.song_wars_create}
                  values={legalValues}
                  onChange={setLegalValues}
                  status={legalStatus}
                  statusMessage={legalMessage}
                  compact
                />
              </div>

              {/* Actions panel */}
              <div className="mt-6 space-y-3">
                <button
                  disabled={
                    validation.status !== "ready" || !legalAccepted || legalStatus === "saving"
                  }
                  onClick={() => handlePublishClick(true)}
                  className={`w-full flex items-center justify-center gap-2 rounded-full py-4 text-xs font-black uppercase tracking-widest text-white transition-all shadow-[0_10px_25px_rgba(176,38,255,0.3)] ${
                    validation.status === "ready" && legalAccepted && legalStatus !== "saving"
                      ? "bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 hover:scale-[1.02] hover:shadow-[0_15px_35px_rgba(6,182,212,0.4)] cursor-pointer"
                      : "bg-white/5 border border-white/5 text-white/20 cursor-not-allowed shadow-none"
                  }`}
                >
                  <Play className="h-4 w-4 fill-current" /> Start Live Now
                </button>

                <button
                  disabled={
                    validation.status !== "ready" || !legalAccepted || legalStatus === "saving"
                  }
                  onClick={() => handlePublishClick(false)}
                  className={`w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-xs font-black uppercase tracking-widest text-white border transition-all ${
                    validation.status === "ready" && legalAccepted && legalStatus !== "saving"
                      ? "border-white/12 bg-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                      : "border-white/5 text-white/15 cursor-not-allowed"
                  }`}
                >
                  <Calendar className="h-4 w-4" /> Schedule Song War
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
