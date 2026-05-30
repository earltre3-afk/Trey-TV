import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  Smartphone,
  Maximize2,
  Minimize2,
  Tv,
  MessageSquare,
  Bot,
  Heart,
  Volume2,
  Send,
  Zap,
  Bookmark,
  Share2,
  User,
  Plus,
  Play,
  Pause,
  ChevronRight,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Battery,
  Wifi,
  Disc,
  Sliders,
  Activity,
  Flame,
  VolumeX,
  Radio,
  CheckCircle,
  Eye,
  Music,
} from "lucide-react";
import { posts, creators } from "@/lib/mock-data";

export type FoldMode = "standard" | "cover" | "unfolded" | "flex";

interface FoldableLayoutManagerProps {
  children: React.ReactNode;
}

export const FoldableLayoutManager: React.FC<FoldableLayoutManagerProps> = ({ children }) => {
  const [mode, setMode] = useState<FoldMode>("standard");

  // Cover Screen Widget States
  const [vibeScanning, setVibeScanning] = useState(false);
  const [vibeResult, setVibeResult] = useState<string | null>(null);
  const [coverChatMsg, setCoverChatMsg] = useState("");
  const [coverChatHistory, setCoverChatHistory] = useState<Array<{ sender: "user" | "trey-i"; text: string }>>([
    { sender: "trey-i", text: "Hey! Trey-I assistant active. Need a quick vibe check or session curation?" },
  ]);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicTrack, setMusicTrack] = useState({ title: "Pull Up On Me (360 RA)", artist: "Trey Trizzy" });

  // Flex Mode States
  const [flexNotes, setFlexNotes] = useState("");
  const [meterTrust, setMeterTrust] = useState(75);
  const [meterRisk, setMeterRisk] = useState(20);

  // Audio equalizer bars mock
  const [eqHeights, setEqBars] = useState<number[]>([12, 24, 8, 16, 20, 10, 18, 14, 6]);

  // Simulator telemetry states (for elite feel)
  const [isSimulatorExpanded, setIsSimulatorExpanded] = useState(true);
  const [screenTension, setScreenTension] = useState(0); // 0-100%
  const [hingeAngle, setAngle] = useState(180); // 0-180 deg
  const [deviceTemp, setDeviceTemp] = useState(32.4); // celsius
  const [batteryLevel, setBattery] = useState(98);
  const [vibeAlignment, setVibeAlignment] = useState(88); // %
  const [soundboardNotification, setSoundboardNotification] = useState<string | null>(null);

  // Draft text area draft writer state
  const [draftText, setDraftText] = useState("");

  // Sound generator Web Audio API helper (Zero dependencies, 100% self-contained)
  const playWebAudioTone = (type: "beep" | "bass" | "synth" | "applause") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "beep") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "bass") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.4);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === "synth") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.25); // C5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "applause") {
        // High-end synth laser sweep for retro applause vibe
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  // EQ Animation effect when music is active
  useEffect(() => {
    let animId: any;
    if (musicPlaying) {
      const runEq = () => {
        setEqBars(Array.from({ length: 9 }, () => Math.floor(Math.random() * 26) + 4));
        // Increase temp very slightly during playback to simulate workload
        setDeviceTemp((prev) => parseFloat(Math.min(38.5, prev + 0.02).toFixed(1)));
        animId = setTimeout(runEq, 150);
      };
      runEq();
    } else {
      setEqBars([4, 6, 4, 8, 5, 4, 6, 5, 4]);
    }
    return () => clearTimeout(animId);
  }, [musicPlaying]);

  // Handle automatic telemetry updates on mode change
  useEffect(() => {
    if (mode === "standard") {
      setAngle(180);
      setScreenTension(0);
    } else if (mode === "cover") {
      setAngle(0);
      setScreenTension(100);
    } else if (mode === "unfolded") {
      setAngle(180);
      setScreenTension(0);
    } else if (mode === "flex") {
      setAngle(90);
      setScreenTension(55);
    }
  }, [mode]);

  // Simulate slow battery discharge/charge and temp flux
  useEffect(() => {
    const timer = setInterval(() => {
      setBattery((prev) => (prev > 5 ? prev - 1 : 100));
      setDeviceTemp((prev) => {
        const drift = Math.random() * 0.4 - 0.2;
        const targetBase = mode === "standard" ? 31.0 : mode === "cover" ? 34.5 : mode === "flex" ? 35.0 : 33.0;
        return parseFloat(Math.max(28.0, Math.min(41.0, prev + drift + (targetBase - prev) * 0.05)).toFixed(1));
      });
    }, 15000);
    return () => clearInterval(timer);
  }, [mode]);

  // Sync session storage and detect native fold screen specs on resize
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const ratio = w / h;

      if (w >= 600 && w < 1024 && ratio >= 0.8 && ratio <= 1.4) {
        setMode("unfolded");
      } else if (w <= 420 && h <= 450 && ratio >= 0.8 && ratio <= 1.2) {
        setMode("cover");
      } else {
        const saved = sessionStorage.getItem("treytv_fold_mode");
        if (saved) {
          setMode(saved as FoldMode);
        } else {
          setMode("standard");
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const changeMode = (newMode: FoldMode) => {
    setMode(newMode);
    sessionStorage.setItem("treytv_fold_mode", newMode);
    if (newMode === "standard") {
      sessionStorage.removeItem("treytv_fold_mode");
    }
    playWebAudioTone("beep");
  };

  // Vibe Scanner Trigger
  const runVibeCheck = () => {
    playWebAudioTone("synth");
    setVibeScanning(true);
    setVibeResult(null);
    let counter = 0;
    const interval = setInterval(() => {
      setVibeAlignment(Math.floor(Math.random() * 30) + 70);
      counter++;
      if (counter >= 10) clearInterval(interval);
    }, 150);

    setTimeout(() => {
      const vibes = [
        "Late Night Studio Heat 🔥",
        "Golden Hour Hype 🌅",
        "Underground Ambient Chill 🌌",
        "Sleek High-Rise Rhythm 🏙️",
        "Flipped Script Acoustics 🎸",
        "Cyberpunk Sub-Bass Pulse ⚡",
      ];
      const result = vibes[Math.floor(Math.random() * vibes.length)];
      setVibeResult(result);
      setVibeScanning(false);
      setVibeAlignment(Math.floor(Math.random() * 8) + 92);
      playWebAudioTone("beep");
    }, 1800);
  };

  // Mini assistant messaging
  const sendCoverChat = () => {
    if (!coverChatMsg.trim()) return;
    const userMsg = coverChatMsg;
    setCoverChatHistory((prev) => [...prev, { sender: "user", text: userMsg }]);
    setCoverChatMsg("");
    playWebAudioTone("beep");

    setTimeout(() => {
      const replies = [
        "Locked in! Check the main screen when unfolded.",
        "That's a bold vibe. I'm tagging it now.",
        "Synthesizing draft. Shared with Malik.",
        "Vibration matched. Tuned to your wavelength!",
        "Draft A&R notes pushed. Let's make history.",
      ];
      setCoverChatHistory((prev) => [
        ...prev,
        { sender: "trey-i", text: replies[Math.floor(Math.random() * replies.length)] },
      ]);
      playWebAudioTone("synth");
    }, 800);
  };

  // Quick prompt chips inside A&R Desk
  const selectPromptTemplate = (templateType: string) => {
    playWebAudioTone("beep");
    let text = "";
    if (templateType === "hype") {
      text = "🚨 SQUAD GOALS! Trey Trizzy just dropped an absolute studio masterclass. This bassline is registered for serious club tremors only. Vibe is immaculate.";
    } else if (templateType === "review") {
      text = "A&R Review: Dynamic rhythm matches early 2000s club anthems. Exceptional vocal presence. Acoustic trust is calibrated perfectly. Risk level holds strong appeal.";
    } else if (templateType === "bts") {
      text = "Behind the Scenes 🤫: Late night session with Malik tracking premium sub-bass waveforms. Folded down standard mixers, we are running strictly on custom AI setups.";
    } else if (templateType === "promo") {
      text = "Trey TV Exclusive: Sign up, tune in. Prescribing high-frequency electronic flows for creative focus and pure workspace dominance. Click for full broadcast.";
    }
    setDraftText(text);
  };

  // Interactive triggers for Soundboard Pads
  const triggerSoundPad = (padLabel: string, type: "beep" | "bass" | "synth" | "applause") => {
    playWebAudioTone(type);
    setSoundboardNotification(`🔊 Triggered Pad: ${padLabel}`);
    setTimeout(() => setSoundboardNotification(null), 1800);
  };

  // Verbal description maps for Slider indicators
  const trustLevelText = useMemo(() => {
    if (meterTrust < 30) return "🛡️ Safe Zone";
    if (meterTrust < 70) return "🤝 Perfect Vibe";
    return "🔥 Elite Synergy";
  }, [meterTrust]);

  const riskLevelText = useMemo(() => {
    if (meterRisk < 30) return "🔒 Secure Flow";
    if (meterRisk < 70) return "🚀 Calculated Risk";
    return "⚠️ Wildcard Hype";
  }, [meterRisk]);

  if (mode === "standard") {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[100dvh] w-full text-white bg-slate-950 overflow-x-hidden selection:bg-fuchsia-500/30">
      {/* Drifting Luxury Glassmorphic Ambient Orbs (Background decoration for premium depth) */}
      <div className="absolute top-10 left-10 size-[400px] rounded-full bg-fuchsia-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 size-[500px] rounded-full bg-cyan-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 size-[300px] rounded-full bg-amber-900/5 blur-[100px] pointer-events-none" />


      {/* ─── COVER SCREEN MODE (Motorola Razr Luxury Widget Deck) ─── */}
      {mode === "cover" && (
        <div className="min-h-[100dvh] w-full bg-[#0a0514] flex flex-col items-center justify-center p-4 relative">
          
          {/* Physical Phone Chassis Frame simulation */}
          <div className="relative w-[386px] h-[386px] rounded-[44px] bg-[#14121f] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_2px_rgba(255,255,255,0.1)] border border-white/5 flex items-center justify-center transition-all duration-500">
            
            {/* Glossy Metallic Bezel Highlights */}
            <div className="absolute inset-0 rounded-[44px] border-t border-l border-white/20 pointer-events-none" />
            <div className="absolute inset-0.5 rounded-[42px] border border-black/40 pointer-events-none" />
            
            {/* Top Phone Hinge Micro-Bezel Details */}
            <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-28 h-[12px] bg-[#0c0914] rounded-t-lg border-t border-x border-white/10 flex justify-between px-4 items-center">
              <span className="size-1 rounded-full bg-slate-800" />
              <span className="size-1 rounded-full bg-slate-800" />
            </div>

            {/* Inner Premium Cover Display Screen Container */}
            <div className="relative w-full h-full rounded-[34px] bg-[#07050e] overflow-hidden flex flex-col justify-between p-4 border border-white/10 shadow-[inset_0_4px_24px_rgba(0,0,0,0.8)] cover-screen-glass">
              
              {/* Outer Screen Gloss Layer */}
              <div className="absolute top-0 right-0 w-[150%] h-[40%] bg-gradient-to-b from-white/[0.03] to-transparent -rotate-12 translate-x-10 pointer-events-none" />

              {/* Status Header Bar */}
              <div className="flex justify-between items-center text-[9px] text-white/60 tracking-wider font-mono border-b border-white/5 pb-1.5 flex-shrink-0 z-10">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="size-3 text-fuchsia-400" />
                  <span className="font-extrabold uppercase bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-amber-300">RAZR PRO</span>
                </div>
                
                {/* Simulated Lens Flash dot & Sensor Indicator */}
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20 border border-blue-400/50 animate-pulse" />
                  <span className="text-[8px] bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 px-1.5 py-0.2 rounded-full font-bold">
                    TREY-I ON
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Wifi className="size-3 text-cyan-400" />
                  <span className="font-bold">10:42</span>
                </div>
              </div>

              {/* Widget Deck Area (Scrollable with premium glassmorphism) */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden py-3.5 space-y-3.5 no-scrollbar z-10">
                
                {/* 1. Interactive Vibe Prescription Widget */}
                <div className="rounded-2xl p-3 flex items-center justify-between gap-3 bg-white/[0.02] border border-white/10 hover:border-amber-400/30 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/[0.02] to-amber-400/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-[8px] uppercase font-black tracking-widest text-amber-400 flex items-center gap-1">
                      <Sparkles className="size-2.5" /> Rx VIBE RADAR
                    </div>
                    <div className="text-xs font-bold text-white mt-1 truncate">
                      {vibeScanning ? "Frequencing vibes..." : vibeResult || "Launch Calibration"}
                    </div>
                    {vibeScanning && (
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1.5">
                        <div className="bg-gradient-to-r from-amber-400 to-fuchsia-500 h-full w-[70%] rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* High tech rotary scan button */}
                  <button
                    onClick={runVibeCheck}
                    disabled={vibeScanning}
                    className={`size-10 rounded-xl flex items-center justify-center text-white active:scale-90 transition-all duration-300 shrink-0 shadow-lg ${
                      vibeScanning 
                        ? "bg-amber-500/20 border border-amber-400/40 animate-spin" 
                        : "bg-gradient-to-tr from-amber-400 via-pink-500 to-fuchsia-600 hover:brightness-110 active:brightness-90 border border-amber-300/30"
                    }`}
                  >
                    <Sparkles className="size-4 animate-pulse" />
                  </button>
                </div>

                {/* 2. Mini Assistant Conversation Widget */}
                <div className="rounded-2xl p-3 flex flex-col gap-2.5 bg-white/[0.02] border border-white/10 relative overflow-hidden">
                  <div className="text-[8px] uppercase font-black tracking-widest text-fuchsia-400 flex items-center gap-1">
                    <Bot className="size-3" /> Trey-I Smart Desk
                  </div>

                  {/* Chat Bubbles */}
                  <div className="bg-black/50 border border-white/5 rounded-xl p-2.5 max-h-24 overflow-y-auto text-[10px] space-y-2 no-scrollbar font-sans">
                    {coverChatHistory.map((h, i) => (
                      <div
                        key={i}
                        className={`flex flex-col max-w-[85%] rounded-xl px-2 py-1.5 ${
                          h.sender === "user"
                            ? "bg-amber-500/10 border border-amber-400/20 text-amber-200 self-end ml-auto rounded-tr-none"
                            : "bg-fuchsia-500/10 border border-fuchsia-400/20 text-fuchsia-200 self-start mr-auto rounded-tl-none"
                        }`}
                      >
                        <span className="text-[7px] uppercase font-black tracking-wider text-white/40 mb-0.5">
                          {h.sender === "user" ? "User" : "Trey-I AI"}
                        </span>
                        <p className="leading-normal">{h.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Input form */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Send instruction..."
                      value={coverChatMsg}
                      onChange={(e) => setCoverChatMsg(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendCoverChat()}
                      className="flex-1 bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/30 font-medium"
                    />
                    <button
                      onClick={sendCoverChat}
                      className="size-7 bg-fuchsia-600 hover:bg-fuchsia-500 active:scale-95 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-fuchsia-600/20"
                    >
                      <Send className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Luxury 360 Spatial Audio Widget */}
                <div className="rounded-2xl p-3 flex items-center gap-3 bg-white/[0.02] border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                  
                  {/* Rotating Vinyl disk with light reflections */}
                  <div className="relative size-12 shrink-0 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group">
                    <div className={`absolute inset-0.5 rounded-full border border-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-900 flex items-center justify-center ${musicPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "5s" }}>
                      {/* Metallic Vinyl Shimmer lines */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent rotate-45" />
                      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/[0.04] to-transparent rotate-45" />
                      
                      {/* Center Label */}
                      <div className="size-4 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 border border-black flex items-center justify-center">
                        <div className="size-1 rounded-full bg-black" />
                      </div>
                    </div>
                  </div>

                  {/* Title and Audio EQ Waves */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[8px] uppercase tracking-widest text-cyan-400 font-extrabold flex items-center gap-1">
                      <Music className="size-2.5" /> 360 SOUND STAGE
                    </div>
                    <div className="text-[11px] font-black text-white truncate mt-0.5">{musicTrack.title}</div>
                    
                    {/* Pulsing visualizer bars */}
                    <div className="flex items-end gap-0.5 h-3 mt-1.5">
                      {eqHeights.map((h, index) => (
                        <span
                          key={index}
                          className="w-1 bg-cyan-400/80 rounded-full transition-all duration-150"
                          style={{ height: `${h}%`, backgroundColor: index % 2 === 0 ? "#06b6d4" : "#d946ef" }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Play/Pause Glass Trigger */}
                  <button
                    onClick={() => {
                      setMusicPlaying(!musicPlaying);
                      playWebAudioTone("beep");
                    }}
                    className={`size-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
                      musicPlaying
                        ? "bg-fuchsia-600/10 border-fuchsia-400/30 text-fuchsia-400"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    {musicPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-white translate-x-0.5" />}
                  </button>
                </div>
              </div>

              {/* Bottom Bezel Touch Gesture Indicator bar */}
              <div className="w-full flex flex-col items-center pt-2 border-t border-white/5 flex-shrink-0">
                <div className="w-14 h-[4px] rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500 animate-pulse opacity-60 mb-1" />
                <span className="text-[7px] text-slate-500 uppercase tracking-widest font-mono">
                  Swipe up or Unfold for main stage
                </span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ─── UNFOLDED WORKSTATION MODE (Galaxy Fold Pro Studio) ─── */}
      {mode === "unfolded" && (
        <div className="min-h-[100dvh] w-full bg-[#05030d] flex flex-col relative transition-all duration-500">
          
          {/* Subtle Workspace Title Notice */}
          <div className="bg-black/40 border-b border-white/5 py-2 px-6 flex justify-between items-center z-10 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-400 animate-pulse" />
              <span className="text-[10px] tracking-widest font-black uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-300 to-fuchsia-400">
                Trey TV Workspace Elite Studio
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[9px] text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle className="size-3 text-emerald-400" /> A&R AI Sync Online</span>
              <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/10">Active View: Unfolded Tablet</span>
            </div>
          </div>

          {/* 3-Column Premium Layout Grid with Flexible Mechanical Hinges */}
          <div className="flex-1 grid grid-cols-[290px_1fr_340px] min-h-0 overflow-hidden relative">
            
            {/* COLUMN 1: Compact Feed / Creators */}
            <aside className="h-full overflow-y-auto p-4 space-y-5 bg-black/30 border-r border-white/5 z-10 scrollbar-thin">
              
              {/* Trending tonight Section with luxurious entries */}
              <div>
                <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="size-3.5 text-fuchsia-400" /> Trending Tonight
                </h3>
                <div className="space-y-2">
                  {creators.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all duration-300 group"
                    >
                      {/* Avatar with Glow Rings */}
                      <div className="relative">
                        <img
                          src={c.avatar}
                          className="size-9 rounded-full object-cover border border-white/10"
                          alt={c.name}
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#05030d] flex items-center justify-center ${
                            c.live ? "bg-red-500" : "bg-emerald-400"
                          }`}
                        >
                          {c.live && <span className="size-1.5 rounded-full bg-white animate-ping" />}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black truncate group-hover:text-fuchsia-300 transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">@{c.handle}</div>
                      </div>

                      {/* Live Counter badge */}
                      {c.live ? (
                        <div className="flex flex-col items-end">
                          <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] px-1.5 py-0.2 rounded font-bold uppercase animate-pulse">
                            Live
                          </span>
                          <span className="text-[7px] text-slate-500 mt-0.5">14.2K</span>
                        </div>
                      ) : (
                        <span className="text-[8px] text-slate-500">Offline</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Refined Feed Preview Section */}
              <div className="border-t border-white/5 pt-4">
                <h3 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-3 flex items-center gap-2">
                  <Tv className="size-3.5 text-cyan-400" /> Active Feed Stream
                </h3>
                <div className="space-y-3.5">
                  {posts.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 p-3 flex flex-col gap-2.5 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-white">{p.creator.name}</span>
                          <span className="text-[8px] text-slate-500">@{p.creator.handle}</span>
                        </div>
                        <span className="text-[8px] text-slate-600">{p.timeAgo} ago</span>
                      </div>
                      <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">{p.text}</p>
                      
                      {/* Micro actions row */}
                      <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[8px] text-slate-500">
                        <span className="flex items-center gap-1 hover:text-red-400 transition cursor-pointer">
                          <Heart className="size-2.5" /> {p.likes}
                        </span>
                        <span className="flex items-center gap-1 hover:text-cyan-400 transition cursor-pointer">
                          <MessageSquare className="size-2.5" /> {p.comments}
                        </span>
                        <span className="flex items-center gap-1 hover:text-amber-400 transition cursor-pointer">
                          <Bookmark className="size-2.5" /> Save
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* MECHANICAL HINGE 1: Left virtual crease */}
            <div className="w-[4px] h-full bg-gradient-to-r from-black/80 via-[#18122d]/40 to-black/80 relative flex items-center justify-center">
              <div className="absolute top-0 bottom-0 w-[1px] bg-white/[0.04] shadow-[0_0_8px_rgba(217,70,239,0.3)]" />
            </div>

            {/* COLUMN 2: Central Application Stage Outlet (Children wrapped in luxury frame) */}
            <main className="h-full overflow-y-auto relative p-3 bg-black/10 flex flex-col justify-between scrollbar-thin">
              <div className="flex-1 rounded-2xl border border-white/5 bg-[#030107]/60 p-2 shadow-inner relative overflow-hidden">
                {/* Simulated bezel frame overlay inside tablet */}
                <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none z-30" />
                {children}
              </div>
            </main>

            {/* MECHANICAL HINGE 2: Right virtual crease */}
            <div className="w-[4px] h-full bg-gradient-to-r from-black/80 via-[#18122d]/40 to-black/80 relative flex items-center justify-center">
              <div className="absolute top-0 bottom-0 w-[1px] bg-white/[0.04] shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
            </div>

            {/* COLUMN 3: Trey-I Creative Desk & Soundboard Console */}
            <aside className="h-full overflow-y-auto p-4 space-y-4 bg-black/30 border-l border-white/5 z-10 flex flex-col justify-between scrollbar-thin">
              <div className="space-y-4">
                
                {/* Hologram AI Agent Core Node */}
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  {/* Holographic glowing brain sphere */}
                  <div className="relative size-10 flex items-center justify-center bg-black/40 rounded-full border border-fuchsia-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <Bot className="size-5 text-fuchsia-400 animate-pulse relative z-10" />
                    {/* Ring Orbits */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: "10s" }} />
                    <div className="absolute -inset-1 rounded-full border border-dotted border-fuchsia-500/20 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />
                  </div>

                  <div>
                    <h3 className="text-xs font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-amber-300">
                      Trey-I Sidepad
                    </h3>
                    <p className="text-[8px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="size-1 rounded-full bg-emerald-400 animate-ping" /> NEURAL ENGINE SYNCD
                    </p>
                  </div>
                </div>

                {/* A&R Writer with Prompt Template Chips */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 space-y-3 relative overflow-hidden">
                  <div className="text-[9px] font-black tracking-wider text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Sparkles className="size-3.5" /> A&R PRODUCTION COMPOSER</span>
                    <span className="bg-amber-400/10 text-amber-300 text-[7px] px-1.5 rounded-full border border-amber-400/20 font-bold uppercase">v2.4</span>
                  </div>

                  {/* Suggestion Tokens */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: "hype", label: "🔥 Hype" },
                      { id: "review", label: "📝 Review" },
                      { id: "bts", label: "🎬 BTS" },
                      { id: "promo", label: "💫 Promo" },
                    ].map((tok) => (
                      <button
                        key={tok.id}
                        onClick={() => selectPromptTemplate(tok.id)}
                        className="text-[8px] font-bold px-2 py-1 rounded-lg bg-white/5 hover:bg-fuchsia-500/15 border border-white/5 hover:border-fuchsia-500/30 transition text-slate-300 active:scale-95"
                      >
                        {tok.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    placeholder="Enter keywords or draft text here..."
                    rows={3}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-[10px] text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/30 font-medium leading-relaxed"
                  />
                  
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setDraftText("");
                        playWebAudioTone("beep");
                      }}
                      className="flex-1 rounded-xl bg-white/5 border border-white/5 py-2 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        playWebAudioTone("synth");
                        setSoundboardNotification("✨ Draft Compiled Successfully!");
                        setTimeout(() => setSoundboardNotification(null), 2000);
                      }}
                      className="flex-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-500 to-amber-500 hover:brightness-110 py-2 px-3 text-[10px] font-extrabold text-white shadow-md shadow-fuchsia-600/10 active:scale-98 transition"
                    >
                      Compile Draft
                    </button>
                  </div>
                </div>

                {/* Vibe dials (Custom Styled neon sliders with adaptive labels) */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 space-y-3.5">
                  <div className="text-[9px] font-black text-cyan-400 tracking-widest flex items-center gap-1.5">
                    <Sliders className="size-3.5" /> DYNAMIC CRITICAL DIALS
                  </div>
                  
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-[9px] mb-1 font-semibold">
                        <span className="text-slate-400">Acoustic Synergetic Trust</span>
                        <span className="text-fuchsia-400 font-bold">{trustLevelText} ({meterTrust}%)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={meterTrust}
                        onChange={(e) => {
                          setMeterTrust(Number(e.target.value));
                        }}
                        className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] mb-1 font-semibold">
                        <span className="text-slate-400">Creative Risk Tolerance</span>
                        <span className="text-cyan-400 font-bold">{riskLevelText} ({meterRisk}%)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={meterRisk}
                        onChange={(e) => {
                          setMeterRisk(Number(e.target.value));
                        }}
                        className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Interactive A&R Soundboard Drum Pads (Plays real synthesised tones) */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 space-y-2.5">
                  <div className="flex justify-between items-center text-[9px] font-black text-fuchsia-400 tracking-widest">
                    <span className="flex items-center gap-1.5"><Activity className="size-3.5" /> A&R STUDIO SOUNDBOARD</span>
                    <span className="text-slate-500 text-[8px]">TAP PADS</span>
                  </div>

                  {soundboardNotification && (
                    <div className="bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 rounded-lg p-1.5 text-[8px] text-center font-bold animate-pulse font-mono">
                      {soundboardNotification}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => triggerSoundPad("BASS BOOM", "bass")}
                      className="p-2.5 bg-gradient-to-br from-amber-400/10 to-transparent hover:from-amber-400/20 rounded-xl border border-amber-500/20 hover:border-amber-400/40 text-[9px] font-black text-left flex flex-col justify-between h-14 group active:scale-95 transition-all duration-150"
                    >
                      <span className="size-1.5 rounded-full bg-amber-400 group-hover:shadow-[0_0_8px_#f59e0b] shrink-0" />
                      <div className="text-amber-300">📣 BASS BOOM</div>
                    </button>

                    <button
                      onClick={() => triggerSoundPad("SYNTH LASER", "synth")}
                      className="p-2.5 bg-gradient-to-br from-cyan-400/10 to-transparent hover:from-cyan-400/20 rounded-xl border border-cyan-500/20 hover:border-cyan-400/40 text-[9px] font-black text-left flex flex-col justify-between h-14 group active:scale-95 transition-all duration-150"
                    >
                      <span className="size-1.5 rounded-full bg-cyan-400 group-hover:shadow-[0_0_8px_#06b6d4] shrink-0" />
                      <div className="text-cyan-300">🎹 SYNTH LEAD</div>
                    </button>

                    <button
                      onClick={() => triggerSoundPad("LASER SWEEP", "applause")}
                      className="p-2.5 bg-gradient-to-br from-fuchsia-400/10 to-transparent hover:from-fuchsia-400/20 rounded-xl border border-fuchsia-500/20 hover:border-fuchsia-400/40 text-[9px] font-black text-left flex flex-col justify-between h-14 group active:scale-95 transition-all duration-150"
                    >
                      <span className="size-1.5 rounded-full bg-fuchsia-400 group-hover:shadow-[0_0_8px_#d946ef] shrink-0" />
                      <div className="text-fuchsia-300">⚡ RETRO SWEEP</div>
                    </button>

                    <button
                      onClick={() => triggerSoundPad("CLICK BIP", "beep")}
                      className="p-2.5 bg-gradient-to-br from-emerald-400/10 to-transparent hover:from-emerald-400/20 rounded-xl border border-emerald-500/20 hover:border-emerald-400/40 text-[9px] font-black text-left flex flex-col justify-between h-14 group active:scale-95 transition-all duration-150"
                    >
                      <span className="size-1.5 rounded-full bg-emerald-400 group-hover:shadow-[0_0_8px_#34d399] shrink-0" />
                      <div className="text-emerald-300">⏱️ BEAT TICK</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Console branding footer */}
              <div className="text-center text-[8px] text-slate-600 border-t border-white/5 pt-3 uppercase tracking-widest font-mono">
                Trey TV Workspace Module • v2.0
              </div>
            </aside>
          </div>
        </div>
      )}


      {/* ─── FLEX MODE SPLIT SCREEN (Premium 3D Physical Folding Console) ─── */}
      {mode === "flex" && (
        <div className="min-h-[100dvh] w-full bg-[#030107] flex flex-col relative transition-all duration-500">
          
          {/* Top Half: active application outlet with subtle perspective */}
          <div className="flex-1 h-[50dvh] overflow-y-auto relative border-b border-black/40 shadow-[inset_0_-24px_30px_rgba(0,0,0,0.9)] bg-black/20" style={{ perspective: "1000px" }}>
            <div className="h-full w-full transition-transform duration-500" style={{ transformOrigin: "bottom center", transform: "rotateX(5deg)" }}>
              {children}
            </div>
          </div>

          {/* 3D MECHANICAL HINGE AND REFLECTION SPLIT (Simulates physical AMOLED screen bend) */}
          <div className="h-[22px] bg-[#141026] relative shrink-0 flex items-center justify-center border-y border-black shadow-[0_10px_25px_rgba(0,0,0,0.9)] z-20 overflow-hidden">
            {/* Gloss reflection line representing 3D folded edge */}
            <div className="absolute inset-x-0 h-[1px] bg-white/20 top-[4px] shadow-sm" />
            <div className="absolute inset-x-0 h-[4px] bg-gradient-to-b from-transparent via-[#d946ef]/20 to-transparent blur-[2px] pointer-events-none" />
            <div className="absolute inset-x-0 h-[1px] bg-white/10 bottom-[4px]" />
            
            {/* Center metal hinge pins */}
            <div className="w-20 h-[6px] bg-slate-800 rounded-full border border-white/5 flex justify-between px-2 items-center">
              <span className="size-1 rounded-full bg-slate-950" />
              <span className="size-1 rounded-full bg-slate-950" />
              <span className="size-1 rounded-full bg-slate-950" />
            </div>

            {/* Ambient hinge light */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[7px] text-slate-500 font-mono tracking-widest uppercase">HINGE AT 90°</span>
            </div>
            
            <div className="absolute right-6 top-1/2 -translate-y-1/2 font-mono text-[7px] text-slate-500 tracking-wider">
              TENSION AUTO-ADJUSTED
            </div>
          </div>

          {/* Bottom Half: Trey-I Flexpad Control Deck */}
          <div className="h-[50dvh] bg-gradient-to-b from-[#0b081c] to-[#04020a] flex flex-col justify-between p-4 relative overflow-hidden shrink-0 z-10 shadow-[inset_0_12px_24px_rgba(0,0,0,0.8)]">
            
            {/* Drifting subtle tech grid lines under glass console */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />

            {/* Header info */}
            <div className="flex justify-between items-center pb-2 border-b border-white/5 flex-shrink-0 z-10">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bot className="size-4 text-fuchsia-400 animate-bounce" />
                  <span className="absolute -top-0.5 -right-0.5 size-1.5 bg-emerald-400 rounded-full animate-ping" />
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-amber-300 font-sans">
                  Trey-I Interactive Flexpad
                </span>
              </div>
              <span className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[8px] font-mono text-slate-400 uppercase tracking-widest">
                Production Desk Mode
              </span>
            </div>

            {/* Dynamic Console Controls Area */}
            <div className="flex-1 overflow-y-auto py-2 space-y-3.5 no-scrollbar z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Draft Composer Column */}
              <div className="space-y-3">
                <div className="rounded-2xl p-3 bg-black/40 border border-white/5 relative overflow-hidden flex flex-col justify-between gap-2 h-full">
                  <div className="text-[8px] uppercase font-black tracking-widest text-fuchsia-300 flex items-center justify-between">
                    <span>Active Composer Assistant</span>
                    <span className="text-[7px] text-slate-500 font-mono">Trey-I Copilot v2</span>
                  </div>
                  
                  <textarea
                    rows={2}
                    value={flexNotes}
                    onChange={(e) => setFlexNotes(e.target.value)}
                    placeholder="Compose review draft or chat reply..."
                    className="w-full flex-1 bg-black/60 border border-white/10 rounded-xl p-2 text-[10px] text-white focus:outline-none focus:border-fuchsia-500 font-medium leading-relaxed"
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFlexNotes("");
                        playWebAudioTone("beep");
                      }}
                      className="px-3 py-1.5 rounded-lg text-[8px] font-bold text-slate-400 bg-white/5 border border-white/5 hover:text-white transition"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        playWebAudioTone("synth");
                        setSoundboardNotification("📝 Composer Input Cached!");
                        setTimeout(() => setSoundboardNotification(null), 2000);
                      }}
                      className="flex-1 py-1.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:brightness-110 rounded-lg flex items-center justify-center font-extrabold text-[9px] shadow-md shadow-fuchsia-600/10 text-white transition-all active:scale-98"
                    >
                      Cache Notes <Send className="size-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Soundboard Launchpad Grid Column */}
              <div className="space-y-3">
                <div className="rounded-2xl p-3 bg-black/40 border border-white/5 flex flex-col justify-between h-full gap-2">
                  <div className="flex justify-between items-center text-[8px] font-black text-cyan-300 tracking-widest uppercase">
                    <span>Interactive Studio Soundboard</span>
                    <span className="text-slate-500 font-mono text-[7px]">8-PAD TRIGGER</span>
                  </div>

                  {soundboardNotification && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-lg py-1 text-[8px] text-center font-bold font-mono animate-pulse">
                      {soundboardNotification}
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "BASS", tone: "bass" as const, color: "border-amber-500/30 bg-amber-500/5 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400/50" },
                      { label: "SYNTH", tone: "synth" as const, color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/50" },
                      { label: "SWEEP", tone: "applause" as const, color: "border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-300 hover:bg-fuchsia-500/10 hover:border-fuchsia-400/50" },
                      { label: "TICK", tone: "beep" as const, color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400/50" },
                      { label: "HYPE 2", tone: "synth" as const, color: "border-blue-500/30 bg-blue-500/5 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400/50" },
                      { label: "DEEP", tone: "bass" as const, color: "border-orange-500/30 bg-orange-500/5 text-orange-300 hover:bg-orange-500/10 hover:border-orange-400/50" },
                      { label: "LASER", tone: "applause" as const, color: "border-pink-500/30 bg-pink-500/5 text-pink-300 hover:bg-pink-500/10 hover:border-pink-400/50" },
                      { label: "BIP", tone: "beep" as const, color: "border-indigo-500/30 bg-indigo-500/5 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400/50" },
                    ].map((pad, index) => (
                      <button
                        key={index}
                        onClick={() => triggerSoundPad(pad.label, pad.tone)}
                        className={`py-2 px-1 rounded-lg border text-[8px] font-black flex flex-col items-center gap-1.5 justify-center transition-all duration-150 active:scale-90 font-mono h-12 ${pad.color}`}
                      >
                        <span className="size-1 rounded-full bg-current shadow-[0_0_6px_currentColor] shrink-0" />
                        <span>{pad.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom tactile quick sliders (sub-bass, reverb, vocal gain control simulation) */}
            <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-3.5 flex-shrink-0 z-10 bg-black/20 p-2.5 rounded-xl border border-white/5">
              <div>
                <div className="flex justify-between text-[7px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                  <span>Sub Bass Boost</span>
                  <span className="text-amber-400 font-bold">12 dB</span>
                </div>
                <div className="w-full bg-black/60 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[65%]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[7px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                  <span>Reverb Space</span>
                  <span className="text-cyan-400 font-bold">45%</span>
                </div>
                <div className="w-full bg-black/60 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[45%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[7px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                  <span>Vocal Presence</span>
                  <span className="text-fuchsia-400 font-bold">92%</span>
                </div>
                <div className="w-full bg-black/60 h-1 rounded-full overflow-hidden">
                  <div className="bg-fuchsia-400 h-full w-[92%]" />
                </div>
              </div>
            </div>

            {/* Flexpad Hint */}
            <div className="text-center text-[8px] text-slate-600 uppercase tracking-widest pt-2 flex-shrink-0 font-mono">
              Laminated Glass Control Deck • Interactive Secondary Console Layout
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
