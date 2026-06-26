import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Bot,
  Cable,
  Download,
  Drum,
  FileArchive,
  Gauge,
  Headphones,
  Mic2,
  Music2,
  Pause,
  Piano,
  Play,
  Plus,
  Radio,
  Scissors,
  Sliders,
  Square,
  Trash2,
  UploadCloud,
  Wand2,
  Waves,
  Zap,
} from 'lucide-react';
import { GlassCard, PrimaryButton, SecondaryButton, Waveform } from '../ui';

type DawTrack = {
  id: string;
  name: string;
  kind: string;
  color: string;
  objectUrl?: string;
  file?: File;
  duration: number;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  armed: boolean;
  waveform: number[];
  source: string;
};

type TrackNodes = {
  audio: HTMLAudioElement;
  source?: MediaElementAudioSourceNode;
  gain?: GainNode;
  panner?: StereoPannerNode;
};

type ZipEntry = {
  name: string;
  data: Uint8Array;
};

const COLORS = [
  'from-emerald-300 to-cyan-300',
  'from-fuchsia-300 to-purple-400',
  'from-orange-300 to-pink-400',
  'from-lime-300 to-emerald-400',
  'from-sky-300 to-indigo-400',
  'from-violet-300 to-cyan-300',
];

const DEFAULT_TRACKS: DawTrack[] = [
  { id: 'demo-lead', name: 'Lead Vocal', kind: 'Lead', color: COLORS[0], duration: 0, volume: 82, pan: 0, muted: false, solo: false, armed: false, waveform: makeWaveform('lead'), source: 'Demo lane' },
  { id: 'demo-bv', name: 'Backing Vocals', kind: 'BVs', color: COLORS[1], duration: 0, volume: 68, pan: -0.16, muted: false, solo: false, armed: false, waveform: makeWaveform('backing'), source: 'Demo lane' },
  { id: 'demo-drums', name: 'Drums', kind: 'Drums', color: COLORS[2], duration: 0, volume: 86, pan: 0, muted: false, solo: false, armed: false, waveform: makeWaveform('drums'), source: 'Demo lane' },
  { id: 'demo-bass', name: 'Bass', kind: 'Bass', color: COLORS[3], duration: 0, volume: 76, pan: 0, muted: false, solo: false, armed: false, waveform: makeWaveform('bass'), source: 'Demo lane' },
  { id: 'demo-music', name: 'Instrumental', kind: 'Music', color: COLORS[4], duration: 0, volume: 74, pan: 0.1, muted: false, solo: false, armed: false, waveform: makeWaveform('music'), source: 'Demo lane' },
];

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
};

function makeWaveform(seed: string, bars = 36) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return Array.from({ length: bars }).map((_, index) => {
    const raw = Math.sin((hash % 997) * (index + 3) * 0.011) + Math.cos((hash % 541) * (index + 1) * 0.017);
    return Math.max(18, Math.min(98, 48 + raw * 24 + Math.sin(index * 0.7) * 12));
  });
}

function classifyStem(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.includes('lead') || lower.includes('vocal')) return 'Lead';
  if (lower.includes('back') || lower.includes('bgv') || lower.includes('harmony') || lower.includes('adlib')) return 'BVs';
  if (lower.includes('drum') || lower.includes('kick') || lower.includes('snare')) return 'Drums';
  if (lower.includes('bass') || lower.includes('808')) return 'Bass';
  if (lower.includes('inst') || lower.includes('music') || lower.includes('beat')) return 'Music';
  return 'Audio';
}

function safeFileName(name: string) {
  return name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_').replace(/\s+/g, '_').slice(0, 120);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function encodeWav(audioBuffer: AudioBuffer) {
  const channels = Math.min(2, audioBuffer.numberOfChannels);
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + length * blockAlign);
  const view = new DataView(buffer);
  let offset = 0;

  const writeString = (value: string) => {
    for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
    offset += value.length;
  };

  writeString('RIFF');
  view.setUint32(offset, 36 + length * blockAlign, true); offset += 4;
  writeString('WAVE');
  writeString('fmt ');
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, channels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * blockAlign, true); offset += 4;
  view.setUint16(offset, blockAlign, true); offset += 2;
  view.setUint16(offset, bytesPerSample * 8, true); offset += 2;
  writeString('data');
  view.setUint32(offset, length * blockAlign, true); offset += 4;

  const channelData = Array.from({ length: channels }, (_, channel) => audioBuffer.getChannelData(channel));
  for (let i = 0; i < length; i += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i] || 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

async function decodeFile(file: File, sampleRate = 44100) {
  const ctx = new AudioContext({ sampleRate });
  const buffer = await ctx.decodeAudioData(await file.arrayBuffer());
  await ctx.close();
  return buffer;
}

async function renderMixdown(tracks: DawTrack[]) {
  const active = tracks.filter((track) => track.file && shouldAudiblyPlay(track, tracks));
  if (!active.length) throw new Error('No playable imported tracks are available for export.');

  const decoded = await Promise.all(active.map(async (track) => ({ track, buffer: await decodeFile(track.file as File) })));
  const sampleRate = 44100;
  const duration = Math.max(...decoded.map(({ buffer }) => buffer.duration));
  const offline = new OfflineAudioContext(2, Math.max(1, Math.ceil(duration * sampleRate)), sampleRate);

  decoded.forEach(({ track, buffer }) => {
    const source = offline.createBufferSource();
    source.buffer = buffer;
    const gain = offline.createGain();
    const panner = offline.createStereoPanner();
    gain.gain.value = Math.max(0, Math.min(1, track.volume / 100));
    panner.pan.value = Math.max(-1, Math.min(1, track.pan));
    source.connect(gain).connect(panner).connect(offline.destination);
    source.start(0);
  });

  const rendered = await offline.startRendering();
  return encodeWav(rendered);
}

async function isolateCenter(track: DawTrack) {
  if (!track.file) throw new Error('Select an imported stereo vocal track first.');
  const decoded = await decodeFile(track.file);
  const sampleRate = decoded.sampleRate;
  const length = decoded.length;
  const offline = new OfflineAudioContext(1, length, sampleRate);
  const mono = offline.createBuffer(1, length, sampleRate);
  const out = mono.getChannelData(0);
  const left = decoded.getChannelData(0);
  const right = decoded.numberOfChannels > 1 ? decoded.getChannelData(1) : left;
  for (let i = 0; i < length; i += 1) out[i] = (left[i] + right[i]) * 0.5;
  const source = offline.createBufferSource();
  source.buffer = mono;
  source.connect(offline.destination);
  source.start(0);
  const rendered = await offline.startRendering();
  return encodeWav(rendered);
}

function shouldAudiblyPlay(track: DawTrack, tracks: DawTrack[]) {
  const hasSolo = tracks.some((item) => item.solo);
  if (track.muted) return false;
  if (hasSolo && !track.solo) return false;
  return true;
}

function crc32(data: Uint8Array) {
  let crc = -1;
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i];
    for (let j = 0; j < 8; j += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function concatArrays(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function u16(view: DataView, offset: number, value: number) { view.setUint16(offset, value, true); }
function u32(view: DataView, offset: number, value: number) { view.setUint32(offset, value, true); }

async function createZip(entries: ZipEntry[]) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  entries.forEach((entry) => {
    const name = encoder.encode(entry.name);
    const data = entry.data;
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const localView = new DataView(local.buffer);
    u32(localView, 0, 0x04034b50);
    u16(localView, 4, 20);
    u16(localView, 6, 0);
    u16(localView, 8, 0);
    u16(localView, 10, 0);
    u16(localView, 12, 0);
    u32(localView, 14, crc);
    u32(localView, 18, data.length);
    u32(localView, 22, data.length);
    u16(localView, 26, name.length);
    u16(localView, 28, 0);
    local.set(name, 30);
    localParts.push(local, data);

    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    u32(centralView, 0, 0x02014b50);
    u16(centralView, 4, 20);
    u16(centralView, 6, 20);
    u16(centralView, 8, 0);
    u16(centralView, 10, 0);
    u16(centralView, 12, 0);
    u16(centralView, 14, 0);
    u32(centralView, 16, crc);
    u32(centralView, 20, data.length);
    u32(centralView, 24, data.length);
    u16(centralView, 28, name.length);
    u16(centralView, 30, 0);
    u16(centralView, 32, 0);
    u16(centralView, 34, 0);
    u16(centralView, 36, 0);
    u32(centralView, 38, 0);
    u32(centralView, 42, offset);
    central.set(name, 46);
    centralParts.push(central);
    offset += local.length + data.length;
  });

  const centralOffset = offset;
  const central = concatArrays(centralParts);
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  u32(eocdView, 0, 0x06054b50);
  u16(eocdView, 4, 0);
  u16(eocdView, 6, 0);
  u16(eocdView, 8, entries.length);
  u16(eocdView, 10, entries.length);
  u32(eocdView, 12, central.length);
  u32(eocdView, 16, centralOffset);
  u16(eocdView, 20, 0);

  return new Blob([concatArrays([...localParts, central, eocd])], { type: 'application/zip' });
}

const ToolBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
    {children}
  </span>
);

const NeonPanel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_18px_50px_rgba(0,0,0,.35)] backdrop-blur-2xl ${className}`}>
    {children}
  </div>
);

const PanelTitle = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) => (
  <div className="mb-3 flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,.18)]">
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-sm font-black uppercase tracking-[0.16em] text-white">{title}</div>
      {sub && <div className="mt-1 text-xs leading-relaxed text-white/50">{sub}</div>}
    </div>
  </div>
);

export const TradioDawStudio: React.FC = () => {
  const [tracks, setTracks] = useState<DawTrack[]>(DEFAULT_TRACKS);
  const [selectedTrackId, setSelectedTrackId] = useState(DEFAULT_TRACKS[0].id);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('Ready. Import stems or record a take to make the DAW live.');
  const [busy, setBusy] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Record<string, TrackNodes>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const importedTracks = tracks.filter((track) => track.file);
  const selectedTrack = tracks.find((track) => track.id === selectedTrackId) ?? tracks[0];
  const maxDuration = Math.max(1, ...tracks.map((track) => track.duration || 0));
  const hasSolo = tracks.some((track) => track.solo);

  const sessionStats = useMemo(() => {
    const playable = tracks.filter((track) => track.objectUrl).length;
    const active = tracks.filter((track) => shouldAudiblyPlay(track, tracks)).length;
    return [
      ['TRACKS', String(tracks.length)],
      ['ACTIVE', String(active)],
      ['FILES', String(playable)],
      ['TIME', formatTime(maxDuration)],
    ];
  }, [tracks, maxDuration]);

  useEffect(() => {
    return () => {
      Object.values(nodesRef.current).forEach(({ audio }) => audio.pause());
      tracks.forEach((track) => track.objectUrl && URL.revokeObjectURL(track.objectUrl));
      if (audioContextRef.current) void audioContextRef.current.close();
    };
  }, []);

  useEffect(() => {
    const sync = window.setInterval(() => {
      if (!playing) return;
      const activeNode = Object.values(nodesRef.current).find(({ audio }) => !audio.paused && !audio.ended);
      if (activeNode) setCurrentTime(activeNode.audio.currentTime);
      else setPlaying(false);
    }, 250);
    return () => window.clearInterval(sync);
  }, [playing]);

  useEffect(() => {
    applyMixing();
  }, [tracks]);

  const ensureAudioContext = async () => {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext();
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const ensureNodes = async () => {
    const ctx = await ensureAudioContext();
    tracks.forEach((track) => {
      if (!track.objectUrl || nodesRef.current[track.id]) return;
      const audio = new Audio(track.objectUrl);
      audio.preload = 'auto';
      audio.onloadedmetadata = () => {
        setTracks((current) => current.map((item) => item.id === track.id ? { ...item, duration: audio.duration || item.duration } : item));
      };
      const source = ctx.createMediaElementSource(audio);
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      source.connect(gain).connect(panner).connect(ctx.destination);
      nodesRef.current[track.id] = { audio, source, gain, panner };
    });
    applyMixing();
  };

  const applyMixing = () => {
    tracks.forEach((track) => {
      const node = nodesRef.current[track.id];
      if (!node?.gain || !node.panner) return;
      const audible = shouldAudiblyPlay(track, tracks);
      node.gain.gain.value = audible ? Math.max(0, Math.min(1, track.volume / 100)) : 0;
      node.panner.pan.value = Math.max(-1, Math.min(1, track.pan));
    });
  };

  const addTracksFromFiles = async (files: File[]) => {
    const audioFiles = files.filter((file) => file.type.startsWith('audio/') || /\.(wav|mp3|m4a|aac|flac|ogg|webm)$/i.test(file.name));
    if (!audioFiles.length) {
      setStatus('No supported audio files found. Use WAV, MP3, M4A, AAC, FLAC, OGG, or WEBM.');
      return;
    }
    const newTracks = audioFiles.map((file, index): DawTrack => {
      const id = `track-${Date.now()}-${index}`;
      const kind = classifyStem(file.name);
      return {
        id,
        name: file.name.replace(/\.[^.]+$/, '').slice(0, 42),
        kind,
        color: COLORS[(tracks.length + index) % COLORS.length],
        objectUrl: URL.createObjectURL(file),
        file,
        duration: 0,
        volume: kind === 'Drums' ? 86 : kind === 'Lead' ? 84 : 72,
        pan: kind === 'BVs' ? -0.14 : kind === 'Music' ? 0.08 : 0,
        muted: false,
        solo: false,
        armed: false,
        waveform: makeWaveform(`${file.name}-${file.size}`),
        source: 'Imported stem',
      };
    });
    setTracks((current) => [...current, ...newTracks]);
    setSelectedTrackId(newTracks[0].id);
    setStatus(`Imported ${newTracks.length} audio stem${newTracks.length === 1 ? '' : 's'} and routed them into the mixer.`);
    window.setTimeout(() => void ensureNodes(), 0);
  };

  const addBlankTrack = () => {
    const id = `blank-${Date.now()}`;
    const track: DawTrack = {
      id,
      name: `Audio Track ${tracks.length + 1}`,
      kind: 'Audio',
      color: COLORS[tracks.length % COLORS.length],
      duration: 0,
      volume: 75,
      pan: 0,
      muted: false,
      solo: false,
      armed: false,
      waveform: makeWaveform(id),
      source: 'Blank lane',
    };
    setTracks((current) => [...current, track]);
    setSelectedTrackId(id);
    setStatus('Added a blank audio lane. Import or record audio into it next.');
  };

  const updateTrack = (id: string, patch: Partial<DawTrack>) => {
    setTracks((current) => current.map((track) => track.id === id ? { ...track, ...patch } : track));
  };

  const deleteTrack = (id: string) => {
    const node = nodesRef.current[id];
    if (node) {
      node.audio.pause();
      node.audio.src = '';
      delete nodesRef.current[id];
    }
    const track = tracks.find((item) => item.id === id);
    if (track?.objectUrl) URL.revokeObjectURL(track.objectUrl);
    const remaining = tracks.filter((item) => item.id !== id);
    setTracks(remaining.length ? remaining : DEFAULT_TRACKS);
    setSelectedTrackId((remaining[0] ?? DEFAULT_TRACKS[0]).id);
    setStatus('Track removed from the session.');
  };

  const play = async () => {
    await ensureNodes();
    const playable = tracks.filter((track) => track.objectUrl && shouldAudiblyPlay(track, tracks));
    if (!playable.length) {
      setStatus('Import audio first. Demo lanes are visual only until files are added.');
      return;
    }
    await Promise.all(playable.map(async (track) => {
      const node = nodesRef.current[track.id];
      if (!node) return;
      if (currentTime > 0 && currentTime < (node.audio.duration || Infinity)) node.audio.currentTime = currentTime;
      await node.audio.play();
    }));
    setPlaying(true);
    setStatus('Playback running through Tradio DAW mixer.');
  };

  const pause = () => {
    Object.values(nodesRef.current).forEach(({ audio }) => audio.pause());
    setPlaying(false);
    setStatus('Playback paused.');
  };

  const stop = () => {
    Object.values(nodesRef.current).forEach(({ audio }) => {
      audio.pause();
      audio.currentTime = 0;
    });
    setCurrentTime(0);
    setPlaying(false);
    setStatus('Transport stopped and returned to 0:00.');
  };

  const seek = (value: number) => {
    const next = Math.max(0, Math.min(maxDuration, value));
    setCurrentTime(next);
    Object.values(nodesRef.current).forEach(({ audio }) => {
      if (Number.isFinite(audio.duration) && next < audio.duration) audio.currentTime = next;
    });
  };

  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const file = new File([blob], `tradio-recording-${Date.now()}.webm`, { type: blob.type });
        await addTracksFromFiles([file]);
        setRecording(false);
        setStatus('Recorded take added to the DAW timeline.');
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setStatus('Recording. Tap Stop Record when your take is done.');
    } catch {
      setStatus('Microphone permission was denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  };

  const exportMaster = async () => {
    try {
      setBusy(true);
      setStatus('Rendering master mix locally.');
      const wav = await renderMixdown(tracks);
      downloadBlob(wav, 'tradio-master-mix.wav');
      setStatus('Master WAV exported.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Master export failed.');
    } finally {
      setBusy(false);
    }
  };

  const exportStemsZip = async () => {
    try {
      setBusy(true);
      const encoder = new TextEncoder();
      const entries: ZipEntry[] = [];
      for (const track of importedTracks) {
        if (!track.file) continue;
        entries.push({ name: `stems/${safeFileName(track.file.name)}`, data: new Uint8Array(await track.file.arrayBuffer()) });
      }
      const manifest = {
        name: 'Tradio DAW Session',
        createdAt: new Date().toISOString(),
        tracks: tracks.map(({ id, name, kind, volume, pan, muted, solo, duration, source }) => ({ id, name, kind, volume, pan, muted, solo, duration, source })),
      };
      entries.push({ name: 'tradio-session.json', data: encoder.encode(JSON.stringify(manifest, null, 2)) });
      if (!entries.length) throw new Error('No stems are available to zip.');
      const zip = await createZip(entries);
      downloadBlob(zip, 'tradio-session-stems.zip');
      setStatus('Stem ZIP exported with session manifest.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Stem ZIP export failed.');
    } finally {
      setBusy(false);
    }
  };

  const runCenterIsolation = async () => {
    if (!selectedTrack?.file) {
      setStatus('Select an imported vocal stem before using Vocal Isolator.');
      return;
    }
    try {
      setBusy(true);
      setStatus(`Isolating center vocal from ${selectedTrack.name}.`);
      const wav = await isolateCenter(selectedTrack);
      const file = new File([wav], `${selectedTrack.name}-center-vocal.wav`, { type: 'audio/wav' });
      await addTracksFromFiles([file]);
      setStatus('Center vocal isolation complete and added as a new track.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Vocal isolation failed.');
    } finally {
      setBusy(false);
    }
  };

  const duplicateSelected = async () => {
    if (!selectedTrack?.file) {
      addBlankTrack();
      return;
    }
    const clone = new File([await selectedTrack.file.arrayBuffer()], `${selectedTrack.name}-copy${selectedTrack.file.name.match(/\.[^.]+$/)?.[0] ?? '.wav'}`, { type: selectedTrack.file.type });
    await addTracksFromFiles([clone]);
  };

  const classifyImportedStems = () => {
    setTracks((current) => current.map((track) => track.file ? { ...track, kind: classifyStem(track.file.name) } : track));
    setStatus('Stem organizer updated track labels from filenames. Real AI separation still needs backend stem service wiring.');
  };

  const sendToRadio = () => {
    setStatus('Tradio Radio handoff prepared. Connect this button to the broadcast queue endpoint in the next backend pass.');
  };

  const timelinePercent = Math.max(0, Math.min(100, (currentTime / maxDuration) * 100));
  const activeTools = [
    { title: 'AI Copilot', sub: importedTracks.length ? 'Local session analysis is reading imported stems.' : 'Import stems for session analysis.', Icon: Bot, state: importedTracks.length ? 'Analyzing' : 'Waiting', action: () => setStatus(importedTracks.length ? `Copilot sees ${importedTracks.length} imported stem(s), ${tracks.filter((t) => t.muted).length} muted track(s), and ${hasSolo ? 'solo mode active' : 'full mix mode'}.` : 'Import stems to unlock useful AI Copilot checks.') },
    { title: 'Stem Splitter', sub: 'Organize imported Suno or DAW stems into session lanes.', Icon: Wand2, state: 'Organizer live', action: classifyImportedStems },
    { title: 'Vocal Isolator', sub: 'Create a center-vocal working copy from the selected stem.', Icon: Mic2, state: 'Local center mode', action: runCenterIsolation },
    { title: 'FX Rack', sub: 'Volume, mute, solo, pan, and selected track controls are live.', Icon: Sliders, state: 'Mixer live', action: () => setStatus('Use the Track Inspector to change volume, pan, mute, solo, and arm state.') },
    { title: 'Bus Routing', sub: 'Tracks route to Main Out through Web Audio gain/pan nodes.', Icon: Cable, state: 'Live', action: () => setStatus('All imported stems are routed through Web Audio mixer nodes into Main Out.') },
    { title: 'Export & Master', sub: 'Render a local WAV mixdown or package stems as ZIP.', Icon: FileArchive, state: 'Live', action: exportMaster },
    { title: 'Record', sub: 'Capture microphone takes directly into the session.', Icon: Headphones, state: recording ? 'Recording' : 'Live', action: recording ? stopRecording : startRecording },
    { title: 'Piano Roll', sub: 'Placeholder lane ready for MIDI editor wiring.', Icon: Piano, state: 'UI ready', action: () => setStatus('Piano Roll UI is ready. MIDI note editing needs the sequencer data model next.') },
    { title: 'Drum Machine', sub: 'Placeholder lane ready for 16-step sequencer wiring.', Icon: Drum, state: 'UI ready', action: () => setStatus('Drum Machine UI is ready. Step sequencer state is the next pass.') },
    { title: 'Tradio Radio', sub: 'Prepare a rendered mix for station or live queue handoff.', Icon: Radio, state: 'Handoff ready', action: sendToRadio },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-10">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.wav,.mp3,.m4a,.aac,.flac,.ogg,.webm"
        className="hidden"
        onChange={(event) => {
          void addTracksFromFiles(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = '';
        }}
      />
      <GlassCard glow className="overflow-hidden p-0">
        <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(70%_55%_at_20%_0%,rgba(47,227,154,.16),transparent_65%),radial-gradient(70%_55%_at_100%_15%,rgba(147,97,253,.22),transparent_70%),linear-gradient(180deg,#0b1020_0%,#070912_52%,#05060b_100%)]">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:linear-gradient(110deg,transparent,rgba(255,255,255,.07),transparent)]" />
          <div className="relative p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <ToolBadge>Tradio DAW</ToolBadge>
                  <ToolBadge>Web Audio Mixer</ToolBadge>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,.9)]" /> Operational
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Tradio Studio DAW</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">
                  Import stems, play them together, mute, solo, pan, adjust levels, record vocals, isolate center vocals, export a master WAV, and package stems as a ZIP.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 rounded-3xl border border-white/10 bg-black/25 p-2">
                {sessionStats.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.045] px-3 py-2 text-center">
                    <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{label}</div>
                    <div className="mt-1 text-sm font-black text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-3xl border border-white/10 bg-black/25 p-3">
              <button onClick={playing ? pause : play} disabled={busy} className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 text-black shadow-[0_0_28px_rgba(45,212,191,.25)] disabled:opacity-40">
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
              <button onClick={stop} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white"><Square className="h-4 w-4 fill-current" /></button>
              <SecondaryButton className="px-4 py-2 text-[10px]" onClick={() => fileInputRef.current?.click()}><UploadCloud className="h-4 w-4" /> Import Stem</SecondaryButton>
              <SecondaryButton className="px-4 py-2 text-[10px]" onClick={addBlankTrack}><Plus className="h-4 w-4" /> Add Track</SecondaryButton>
              <SecondaryButton className="px-4 py-2 text-[10px]" onClick={recording ? stopRecording : startRecording}><Mic2 className="h-4 w-4" /> {recording ? 'Stop Record' : 'Record'}</SecondaryButton>
              <PrimaryButton className="px-4 py-2 text-[10px]" onClick={exportMaster} disabled={busy}><Download className="h-4 w-4" /> Export Master</PrimaryButton>
              <SecondaryButton className="px-4 py-2 text-[10px]" onClick={exportStemsZip} disabled={busy}><FileArchive className="h-4 w-4" /> Stems ZIP</SecondaryButton>
              <div className="min-w-[180px] flex-1 px-2">
                <input className="w-full accent-emerald-300" type="range" min={0} max={maxDuration} step={0.01} value={Math.min(currentTime, maxDuration)} onChange={(event) => seek(Number(event.currentTarget.value))} />
                <div className="mt-1 flex justify-between text-[10px] font-bold text-white/40"><span>{formatTime(currentTime)}</span><span>{formatTime(maxDuration)}</span></div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] px-4 py-3 text-xs leading-relaxed text-emerald-100/80">
              {busy ? 'Working...' : status}
            </div>

            <div className="mt-5 grid gap-4 2xl:grid-cols-[220px_minmax(0,1fr)_320px]">
              <NeonPanel className="hidden 2xl:block">
                <PanelTitle icon={<Music2 className="h-4 w-4" />} title="Library" sub="Session sources" />
                <div className="space-y-2">
                  {['Cloud Stems', 'My Projects', 'Samples', 'Loops', 'Presets', 'Tradio Radio'].map((item) => (
                    <button key={item} onClick={() => setStatus(`${item} browser is ready for backend catalog wiring.`)} className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-2 text-left text-xs font-bold text-white/70 transition hover:border-emerald-300/30 hover:text-white">
                      {item}<Zap className="h-3.5 w-3.5 text-emerald-300/70" />
                    </button>
                  ))}
                </div>
              </NeonPanel>

              <NeonPanel className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200/80">Timeline</div>
                    <div className="text-sm text-white/45">Imported audio routes through the local Web Audio mixer.</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SecondaryButton className="px-4 py-2 text-[10px]" onClick={() => fileInputRef.current?.click()}>Import Stem</SecondaryButton>
                    <PrimaryButton className="px-4 py-2 text-[10px]" onClick={addBlankTrack}>Add Track</PrimaryButton>
                  </div>
                </div>
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
                  <div className="grid grid-cols-[122px_1fr] border-b border-white/10 bg-white/[0.035] text-[10px] font-black uppercase tracking-[0.14em] text-white/35 sm:grid-cols-[165px_1fr]">
                    <div className="px-3 py-2">Tracks</div>
                    <div className="relative grid grid-cols-8 gap-px px-2 py-2">
                      <div className="absolute inset-y-0 w-px bg-emerald-300/70 shadow-[0_0_16px_rgba(52,211,153,.9)]" style={{ left: `${timelinePercent}%` }} />
                      {Array.from({ length: 8 }).map((_, index) => <span key={index}>B{index + 1}</span>)}
                    </div>
                  </div>
                  {tracks.map((track) => {
                    const audible = shouldAudiblyPlay(track, tracks);
                    return (
                      <button key={track.id} onClick={() => setSelectedTrackId(track.id)} className={`grid min-h-[68px] w-full grid-cols-[122px_1fr] border-b border-white/[0.045] text-left last:border-b-0 sm:grid-cols-[165px_1fr] ${selectedTrackId === track.id ? 'bg-emerald-300/[0.04]' : ''}`}>
                        <div className="flex flex-col justify-center border-r border-white/[0.06] px-3">
                          <div className="truncate text-xs font-black text-white">{track.name}</div>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/45">
                            <span onClick={(event) => { event.stopPropagation(); updateTrack(track.id, { muted: !track.muted }); }} className={`rounded border px-1.5 py-0.5 ${track.muted ? 'border-red-300/40 text-red-200' : 'border-white/10'}`}>M</span>
                            <span onClick={(event) => { event.stopPropagation(); updateTrack(track.id, { solo: !track.solo }); }} className={`rounded border px-1.5 py-0.5 ${track.solo ? 'border-emerald-300/40 text-emerald-200' : 'border-white/10'}`}>S</span>
                            <span>{track.kind}</span>
                          </div>
                        </div>
                        <div className="relative px-2 py-3">
                          {[12, 25, 38, 51, 64, 77, 90].map((left) => <div key={left} className="absolute inset-y-0 w-px bg-white/[0.05]" style={{ left: `${left}%` }} />)}
                          <div className={`relative h-11 rounded-xl border border-white/10 bg-gradient-to-r ${track.color} p-1 opacity-${audible ? '100' : '40'} shadow-[0_0_28px_rgba(56,189,248,.12)]`} style={{ width: track.duration ? `${Math.max(18, Math.min(100, (track.duration / maxDuration) * 100))}%` : '74%' }}>
                            <div className="flex h-full items-center justify-between gap-2 rounded-lg bg-black/25 px-2">
                              <div className="flex h-6 flex-1 items-end gap-[2px] overflow-hidden">
                                {track.waveform.map((bar, index) => <span key={index} className="w-[3px] rounded-full bg-white/70" style={{ height: `${bar}%` }} />)}
                              </div>
                              <span className="hidden whitespace-nowrap text-[10px] font-black text-black/70 sm:inline">{track.file ? formatTime(track.duration) : track.source}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </NeonPanel>

              <NeonPanel>
                <PanelTitle icon={<Bot className="h-4 w-4" />} title="AI Copilot" sub="Live session assistant" />
                <div className="space-y-3">
                  {[
                    ['Imported stems', `${importedTracks.length}`, importedTracks.length ? 'Ready' : 'Waiting'],
                    ['Mix mode', hasSolo ? 'Solo active' : 'Full mix', 'Live'],
                    ['Selected track', selectedTrack?.name ?? 'None', selectedTrack?.file ? 'Audio' : 'Visual'],
                  ].map(([label, value, badge]) => (
                    <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                      <div className="flex items-center justify-between text-xs"><span className="text-white/45">{label}</span><span className="font-black text-emerald-200">{badge}</span></div>
                      <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
                    </div>
                  ))}
                  <div className="rounded-2xl border border-purple-300/20 bg-purple-500/10 p-3 text-xs leading-relaxed text-white/60">
                    Local mixer is wired. Cloud AI analysis and real Demucs-style separation need backend endpoints to go beyond browser-side tools.
                  </div>
                </div>
              </NeonPanel>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
              <NeonPanel>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <PanelTitle icon={<Sliders className="h-4 w-4" />} title="Mixer + Bus Routing" sub="Touch-friendly channel strips" />
                  <ToolBadge>Main Out</ToolBadge>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {tracks.map((track) => (
                    <button key={track.id} onClick={() => setSelectedTrackId(track.id)} className={`min-w-[100px] rounded-3xl border p-3 text-center ${selectedTrackId === track.id ? 'border-emerald-300/35 bg-emerald-300/10' : 'border-white/10 bg-black/25'}`}>
                      <div className="truncate text-xs font-black text-white">{track.name}</div>
                      <div className="mt-1 text-[10px] text-white/40">Pan {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.round(Math.abs(track.pan) * 100)}` : `R${Math.round(track.pan * 100)}`}</div>
                      <div className="mx-auto mt-3 flex h-36 w-9 items-end justify-center rounded-xl border border-white/10 bg-white/[0.035] p-1">
                        <div className="w-full rounded-lg bg-gradient-to-t from-emerald-300 to-purple-300 shadow-[0_0_20px_rgba(255,255,255,.16)]" style={{ height: `${track.volume}%`, opacity: shouldAudiblyPlay(track, tracks) ? 1 : 0.25 }} />
                      </div>
                      <div className="mt-3 flex justify-center gap-1.5">
                        <span className={`rounded-md border px-2 py-1 text-[10px] font-black ${track.muted ? 'border-red-300/40 text-red-200' : 'border-white/10 text-white/50'}`}>M</span>
                        <span className={`rounded-md border px-2 py-1 text-[10px] font-black ${track.solo ? 'border-emerald-300/40 text-emerald-200' : 'border-white/10 text-white/50'}`}>S</span>
                      </div>
                    </button>
                  ))}
                </div>
              </NeonPanel>

              <NeonPanel>
                <PanelTitle icon={<Gauge className="h-4 w-4" />} title="Track Inspector" sub={selectedTrack?.name ?? 'Select a track'} />
                {selectedTrack && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-white/60">Volume {selectedTrack.volume}%
                      <input className="mt-2 w-full accent-emerald-300" type="range" min={0} max={100} value={selectedTrack.volume} onChange={(event) => updateTrack(selectedTrack.id, { volume: Number(event.currentTarget.value) })} />
                    </label>
                    <label className="block text-xs font-bold text-white/60">Pan {selectedTrack.pan.toFixed(2)}
                      <input className="mt-2 w-full accent-purple-300" type="range" min={-1} max={1} step={0.01} value={selectedTrack.pan} onChange={(event) => updateTrack(selectedTrack.id, { pan: Number(event.currentTarget.value) })} />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <SecondaryButton className="py-2 text-[10px]" onClick={() => updateTrack(selectedTrack.id, { muted: !selectedTrack.muted })}>{selectedTrack.muted ? 'Unmute' : 'Mute'}</SecondaryButton>
                      <SecondaryButton className="py-2 text-[10px]" onClick={() => updateTrack(selectedTrack.id, { solo: !selectedTrack.solo })}>{selectedTrack.solo ? 'Unsolo' : 'Solo'}</SecondaryButton>
                      <SecondaryButton className="py-2 text-[10px]" onClick={() => void duplicateSelected()}><Plus className="h-3.5 w-3.5" /> Duplicate</SecondaryButton>
                      <SecondaryButton className="py-2 text-[10px]" onClick={runCenterIsolation}><Scissors className="h-3.5 w-3.5" /> Isolate</SecondaryButton>
                    </div>
                    <button onClick={() => deleteTrack(selectedTrack.id)} className="flex w-full items-center justify-center gap-2 rounded-full border border-red-300/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-red-200">
                      <Trash2 className="h-4 w-4" /> Delete Track
                    </button>
                  </div>
                )}
              </NeonPanel>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {activeTools.map(({ title, sub, Icon, state, action }) => (
                <button key={title} onClick={() => void action()} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-emerald-300/25 hover:bg-emerald-300/[0.04]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 text-purple-100"><Icon className="h-4 w-4" /></div>
                    <span className="rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/40">{state}</span>
                  </div>
                  <div className="mt-3 text-sm font-black text-white">{title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">{sub}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <NeonPanel>
                <PanelTitle icon={<Activity className="h-4 w-4" />} title="Project Progress" sub="Production checklist" />
                <div className="space-y-2">
                  {[
                    ['Import stems', importedTracks.length > 0],
                    ['Route mixer', true],
                    ['Record or edit vocal', tracks.some((track) => track.source === 'Imported stem')],
                    ['Render mix', false],
                    ['Send to Tradio Radio', false],
                  ].map(([item, done]) => (
                    <div key={String(item)} className="flex items-center gap-2 text-xs text-white/65"><span className={`h-2.5 w-2.5 rounded-full ${done ? 'bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,.8)]' : 'bg-white/20'}`} />{item}</div>
                  ))}
                </div>
              </NeonPanel>
              <NeonPanel>
                <PanelTitle icon={<Waves className="h-4 w-4" />} title="Visualizer" sub="Live waveform energy" />
                <div className="flex h-24 items-center justify-center rounded-3xl border border-white/8 bg-black/25 px-4">
                  <Waveform className="h-16 w-full" bars={42} color={playing ? 'from-emerald-300 to-purple-300' : 'from-white/30 to-white/50'} />
                </div>
              </NeonPanel>
              <NeonPanel>
                <PanelTitle icon={<UploadCloud className="h-4 w-4" />} title="Export + Master" sub="Operational local exports" />
                <div className="space-y-2">
                  <PrimaryButton className="w-full py-3 text-[10px]" onClick={exportMaster} disabled={busy}>Export Master WAV</PrimaryButton>
                  <SecondaryButton className="w-full py-3 text-[10px]" onClick={exportStemsZip} disabled={busy}>Export Stems ZIP</SecondaryButton>
                  <SecondaryButton className="w-full py-3 text-[10px]" onClick={sendToRadio}>Send To Tradio Radio</SecondaryButton>
                </div>
              </NeonPanel>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default TradioDawStudio;
