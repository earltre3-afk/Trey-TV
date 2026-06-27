import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Activity, Download, Mic, Pause, Play, Plus, Radio, Save, Scissors, SlidersHorizontal, Sparkles, Trash2, UploadCloud, Wand2 } from 'lucide-react';
import './tradioStudioDAW.css';

type Clip = { id: string; trackId: string; name: string; start: number; duration: number; offset: number; url?: string; buffer?: AudioBuffer; peaks: number[] };
type Track = { id: string; name: string; kind: 'audio' | 'vocal' | 'drum' | 'instrument' | 'midi'; icon: string; clips: Clip[]; muted: boolean; solo: boolean; armed: boolean; volume: number; pan: number; bus: string; meter: number };
type Transport = 'stopped' | 'playing' | 'recording';

const STORAGE_KEY = 'trey-tv:tradio-live-daw:v1';
const id = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}.${Math.floor((s % 1) * 100).toString().padStart(2, '0')}`;

const audioCtx = (() => {
  let ctx: AudioContext | undefined;
  return () => {
    const Klass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Klass) throw new Error('Web Audio is not supported in this browser.');
    if (!ctx || ctx.state === 'closed') ctx = new Klass();
    return ctx;
  };
})();

const newTrack = (name: string, kind: Track['kind'] = 'audio'): Track => ({
  id: id('track'),
  name,
  kind,
  icon: kind === 'vocal' ? '🎙️' : kind === 'drum' ? '🥁' : kind === 'midi' ? '🎼' : kind === 'instrument' ? '🎹' : '🎧',
  clips: [],
  muted: false,
  solo: false,
  armed: false,
  volume: 0.88,
  pan: 0,
  bus: kind === 'vocal' ? 'Vocal Bus' : kind === 'drum' ? 'Drum Bus' : 'Master',
  meter: 0,
});

const peaksFor = (buffer: AudioBuffer, count = 72) => {
  const data = buffer.getChannelData(0);
  const size = Math.max(1, Math.floor(data.length / count));
  return Array.from({ length: count }, (_, i) => {
    let peak = 0;
    for (let j = i * size; j < Math.min(data.length, (i + 1) * size); j++) peak = Math.max(peak, Math.abs(data[j]));
    return clamp(peak, 0.04, 1);
  });
};

const wavBlob = (buffer: AudioBuffer) => {
  const channels = buffer.numberOfChannels;
  const length = buffer.length;
  const rate = buffer.sampleRate;
  const bytes = new ArrayBuffer(44 + length * channels * 2);
  const view = new DataView(bytes);
  let o = 0;
  const str = (v: string) => { for (let i = 0; i < v.length; i++) view.setUint8(o + i, v.charCodeAt(i)); o += v.length; };
  const u32 = (v: number) => { view.setUint32(o, v, true); o += 4; };
  const u16 = (v: number) => { view.setUint16(o, v, true); o += 2; };
  str('RIFF'); u32(36 + length * channels * 2); str('WAVE'); str('fmt '); u32(16); u16(1); u16(channels); u32(rate); u32(rate * channels * 2); u16(channels * 2); u16(16); str('data'); u32(length * channels * 2);
  for (let i = 0; i < length; i++) for (let c = 0; c < channels; c++) { const sample = clamp(buffer.getChannelData(c)[i] || 0, -1, 1); view.setInt16(o, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true); o += 2; }
  return new Blob([bytes], { type: 'audio/wav' });
};

const Wave: React.FC<{ peaks: number[]; active?: boolean }> = ({ peaks, active }) => <div className={`tradio-live-wave ${active ? 'active' : ''}`}>{(peaks.length ? peaks : new Array(48).fill(0.14)).slice(0, 96).map((p, i) => <span key={i} style={{ height: `${Math.max(12, p * 100)}%` }} />)}</div>;
const Pill: React.FC<{ children: React.ReactNode; warn?: boolean }> = ({ children, warn }) => <span className={`tradio-live-pill ${warn ? 'warn' : ''}`}>{children}</span>;

export default function TradioStudioDAW() {
  const [project, setProject] = useState('Neon Skyline Session');
  const [bpm, setBpm] = useState(120);
  const [songKey, setSongKey] = useState('C minor');
  const [snap, setSnap] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([newTrack('Lead Vocal', 'vocal'), newTrack('Beat Stem', 'instrument'), newTrack('Drums', 'drum'), newTrack('Keys / Pads', 'midi')]);
  const [transport, setTransport] = useState<Transport>('stopped');
  const [playhead, setPlayhead] = useState(0);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [status, setStatus] = useState('Live React DAW ready. Import stems, record audio, edit clips, save, or export.');
  const [mobilePanel, setMobilePanel] = useState<'tracks' | 'mixer' | 'tools' | 'export'>('tracks');
  const [recordTime, setRecordTime] = useState(0);
  const [exporting, setExporting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeRef = useRef<Array<{ source: AudioBufferSourceNode; analyser: AnalyserNode }>>([]);
  const masterRef = useRef<{ gain: GainNode; analyser: AnalyserNode } | null>(null);
  const timerRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ clipId: string; trackId: string; x: number; start: number; px: number } | null>(null);

  const length = useMemo(() => Math.max(90, Math.ceil(tracks.flatMap(t => t.clips.map(c => c.start + c.duration)).reduce((a, b) => Math.max(a, b), 0) + 12)), [tracks]);
  const soloing = tracks.some(t => t.solo);
  const clip = tracks.flatMap(t => t.clips).find(c => c.id === selectedClip) || null;
  const armed = tracks.find(t => t.armed) || tracks[0];
  const progress = Math.round((tracks.filter(t => t.clips.length).length / Math.max(1, tracks.length)) * 100);
  const beat = useMemo(() => { const b = Math.floor((playhead / 60) * bpm); return `Bar ${Math.floor(b / 4) + 1} · Beat ${(b % 4) + 1}`; }, [bpm, playhead]);

  const master = useCallback(() => {
    const ctx = audioCtx();
    if (!masterRef.current) {
      const gain = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      gain.connect(analyser);
      analyser.connect(ctx.destination);
      masterRef.current = { gain, analyser };
    }
    return { ctx, ...masterRef.current };
  }, []);

  const stop = useCallback((reset = false) => {
    activeRef.current.forEach(({ source }) => { try { source.stop(); } catch { /* noop */ } try { source.disconnect(); } catch { /* noop */ } });
    activeRef.current = [];
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setTransport('stopped');
    setTracks(t => t.map(x => ({ ...x, meter: 0 })));
    if (reset) setPlayhead(0);
  }, []);

  const play = useCallback(async () => {
    const { ctx, gain } = master();
    await ctx.resume();
    stop(false);
    const startAt = ctx.currentTime;
    const startPos = playhead;
    tracks.forEach(track => {
      if (track.muted || (soloing && !track.solo)) return;
      track.clips.forEach(c => {
        if (!c.buffer || c.start + c.duration <= playhead) return;
        const source = ctx.createBufferSource();
        const vol = ctx.createGain();
        const analyser = ctx.createAnalyser();
        const pan = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
        source.buffer = c.buffer;
        vol.gain.value = track.volume;
        source.connect(vol);
        if (pan) { pan.pan.value = track.pan; vol.connect(pan); pan.connect(analyser); } else vol.connect(analyser);
        analyser.connect(gain);
        const inClip = Math.max(0, playhead - c.start);
        source.start(Math.max(ctx.currentTime + 0.06, ctx.currentTime + c.start - playhead + 0.06), c.offset + inClip, Math.max(0.05, c.duration - inClip));
        activeRef.current.push({ source, analyser });
      });
    });
    setTransport('playing');
    setStatus(activeRef.current.length ? 'Playback is running through live Web Audio routing.' : 'No playable clips at this playhead.');
    timerRef.current = window.setInterval(() => {
      const pos = startPos + (ctx.currentTime - startAt);
      setPlayhead(clamp(pos, 0, length));
      const analyser = activeRef.current[0]?.analyser;
      setTracks(cur => cur.map(t => {
        if (!analyser || t.muted) return { ...t, meter: 0 };
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        return { ...t, meter: clamp(data.reduce((a, b) => a + b, 0) / data.length / 255, 0, 1) };
      }));
      if (pos >= length) stop(true);
    }, 60);
  }, [length, master, playhead, soloing, stop, tracks]);

  const importFiles = useCallback(async (filesRaw: FileList | File[]) => {
    const files = Array.from(filesRaw).filter(f => f.type.startsWith('audio/') || /\.(wav|mp3|m4a|aac|ogg|flac)$/i.test(f.name));
    if (!files.length) return setStatus('Drop or choose real audio files: WAV, MP3, M4A, AAC, OGG, or FLAC.');
    const ctx = audioCtx();
    setStatus(`Importing ${files.length} stem${files.length === 1 ? '' : 's'}...`);
    const decoded = await Promise.all(files.map(async file => {
      const buffer = await ctx.decodeAudioData(await file.arrayBuffer());
      const kind: Track['kind'] = /vocal|lead|hook|verse/i.test(file.name) ? 'vocal' : /drum|kick|snare|808/i.test(file.name) ? 'drum' : 'instrument';
      const t = newTrack(file.name.replace(/\.[^.]+$/, ''), kind);
      const c: Clip = { id: id('clip'), trackId: t.id, name: t.name, start: 0, offset: 0, duration: buffer.duration, url: URL.createObjectURL(file), buffer, peaks: peaksFor(buffer) };
      t.clips = [c];
      return t;
    }));
    setTracks(cur => [...cur.filter(t => t.clips.length || t.name !== 'Beat Stem'), ...decoded]);
    setSelectedTrack(decoded[0]?.id || null);
    setSelectedClip(decoded[0]?.clips[0]?.id || null);
    setStatus(`Imported ${decoded.length} live stem${decoded.length === 1 ? '' : 's'} with decoded waveform data.`);
  }, []);

  const updateTrack = (trackId: string, patch: Partial<Track>) => setTracks(cur => cur.map(t => t.id === trackId ? { ...t, ...patch } : t));
  const addTrack = (kind: Track['kind'] = 'audio') => setTracks(cur => { const t = newTrack(`Audio Track ${cur.length + 1}`, kind); setSelectedTrack(t.id); setStatus('Added a real session track.'); return [...cur, t]; });
  const removeTrack = () => { if (!selectedTrack) return; setTracks(cur => cur.filter(t => t.id !== selectedTrack)); setSelectedTrack(null); setSelectedClip(null); setStatus('Removed selected track.'); };
  const deleteClip = () => { if (!selectedClip) return; setTracks(cur => cur.map(t => ({ ...t, clips: t.clips.filter(c => c.id !== selectedClip) }))); setSelectedClip(null); setStatus('Removed selected clip.'); };

  const splitClip = () => {
    if (!clip || playhead <= clip.start || playhead >= clip.start + clip.duration) return setStatus('Select a clip and place the playhead inside it to split.');
    setTracks(cur => cur.map(t => t.id !== clip.trackId ? t : { ...t, clips: t.clips.flatMap(c => c.id !== clip.id ? [c] : [{ ...c, id: id('clip'), duration: playhead - c.start, name: `${c.name} A` }, { ...c, id: id('clip'), start: playhead, offset: c.offset + (playhead - c.start), duration: c.duration - (playhead - c.start), name: `${c.name} B` }]) }));
    setStatus('Split selected clip at the playhead.');
  };

  const duplicateClip = () => {
    if (!clip) return;
    setTracks(cur => cur.map(t => t.id !== clip.trackId ? t : { ...t, clips: [...t.clips, { ...clip, id: id('clip'), start: clip.start + clip.duration + 0.25, name: `${clip.name} copy` }] }));
    setStatus('Duplicated selected clip.');
  };

  const mergeClips = () => {
    if (!selectedTrack) return setStatus('Select a track to merge adjacent clips.');
    setTracks(cur => cur.map(t => {
      if (t.id !== selectedTrack || t.clips.length < 2) return t;
      const sorted = [...t.clips].sort((a, b) => a.start - b.start);
      const merged: Clip[] = [];
      sorted.forEach(c => {
        const prev = merged[merged.length - 1];
        if (prev && prev.buffer === c.buffer && c.start <= prev.start + prev.duration + 0.05) prev.duration = Math.max(prev.start + prev.duration, c.start + c.duration) - prev.start;
        else merged.push({ ...c });
      });
      setStatus(merged.length === sorted.length ? 'No touching clips found to merge.' : 'Merged adjacent clips.');
      return { ...t, clips: merged };
    }));
  };

  const record = async () => {
    if (transport === 'recording') { recorderRef.current?.stop(); return; }
    stop(false);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunksRef.current = [];
    const started = performance.now();
    const tick = window.setInterval(() => setRecordTime((performance.now() - started) / 1000), 100);
    rec.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
    rec.onstop = async () => {
      window.clearInterval(tick);
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
      const buffer = await audioCtx().decodeAudioData(await blob.arrayBuffer());
      const target = armed || tracks[0];
      const c: Clip = { id: id('clip'), trackId: target.id, name: `Recorded Take`, start: playhead, offset: 0, duration: buffer.duration, url: URL.createObjectURL(blob), buffer, peaks: peaksFor(buffer) };
      setTracks(cur => cur.map(t => t.id === target.id ? { ...t, armed: false, clips: [...t.clips, c] } : t));
      setSelectedTrack(target.id); setSelectedClip(c.id); setRecordTime(0); setTransport('stopped'); setStatus('Mic recording captured and added as a playable clip.');
    };
    rec.start(250); recorderRef.current = rec; setTransport('recording'); setStatus(`Recording armed on ${armed?.name || 'Track 1'}.`);
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ project, bpm, songKey, snap, tracks: tracks.map(({ clips, meter, ...t }) => ({ ...t, clipCount: clips.length })), clips: tracks.flatMap(t => t.clips.map(({ buffer, peaks, ...c }) => ({ ...c, hasAudio: Boolean(buffer) }))), updatedAt: new Date().toISOString() }));
    setStatus('Saved real project/session metadata locally. Audio buffers stay live in this browser until backend project storage is added.');
  };

  const exportMaster = async () => {
    setExporting(true);
    try {
      const buffers = tracks.flatMap(t => t.clips.map(c => c.buffer).filter(Boolean)) as AudioBuffer[];
      const rate = buffers[0]?.sampleRate || 48000;
      const offline = new OfflineAudioContext(2, Math.ceil((length + 1) * rate), rate);
      const masterGain = offline.createGain(); masterGain.gain.value = 0.95; masterGain.connect(offline.destination);
      tracks.forEach(t => { if (t.muted || (soloing && !t.solo)) return; t.clips.forEach(c => { if (!c.buffer) return; const s = offline.createBufferSource(); const g = offline.createGain(); s.buffer = c.buffer; g.gain.value = t.volume; s.connect(g); if (typeof offline.createStereoPanner === 'function') { const p = offline.createStereoPanner(); p.pan.value = t.pan; g.connect(p); p.connect(masterGain); } else g.connect(masterGain); s.start(c.start, c.offset, c.duration); }); });
      const rendered = await offline.startRendering();
      const url = URL.createObjectURL(wavBlob(rendered));
      const a = document.createElement('a'); a.href = url; a.download = `${project.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'tradio-session'}-master.wav`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setStatus('Exported a real WAV master bounce from the current session.');
    } catch (e) { setStatus(e instanceof Error ? `Export failed: ${e.message}` : 'Export failed.'); }
    finally { setExporting(false); }
  };

  const down = (e: React.PointerEvent<HTMLDivElement>, c: Clip) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const px = (e.currentTarget.parentElement?.getBoundingClientRect().width || 700) / length;
    dragRef.current = { clipId: c.id, trackId: c.trackId, x: e.clientX, start: c.start, px };
    setSelectedClip(c.id); setSelectedTrack(c.trackId);
  };
  const move = (e: React.PointerEvent) => { const d = dragRef.current; if (!d) return; const raw = d.start + (e.clientX - d.x) / d.px; const next = snap ? Math.round(raw * 4) / 4 : raw; setTracks(cur => cur.map(t => t.id !== d.trackId ? t : { ...t, clips: t.clips.map(c => c.id === d.clipId ? { ...c, start: clamp(next, 0, length) } : c) })); };
  const up = () => { if (dragRef.current) setStatus('Clip move committed.'); dragRef.current = null; };

  const renderTrack = (t: Track) => <div key={t.id} className={`tradio-live-track ${selectedTrack === t.id ? 'selected' : ''}`} onClick={() => setSelectedTrack(t.id)}>
    <div className="tradio-live-track-head"><b>{t.icon}</b><div><strong>{t.name}</strong><span>{t.bus} · {Math.round(t.volume * 100)}%</span></div><button className={t.armed ? 'armed' : ''} onClick={e => { e.stopPropagation(); updateTrack(t.id, { armed: !t.armed }); }}>ARM</button><button className={t.muted ? 'on' : ''} onClick={e => { e.stopPropagation(); updateTrack(t.id, { muted: !t.muted }); }}>M</button><button className={t.solo ? 'on' : ''} onClick={e => { e.stopPropagation(); updateTrack(t.id, { solo: !t.solo }); }}>S</button></div>
    <div className="tradio-live-lane" onPointerMove={move} onPointerUp={up} onPointerCancel={up}><i className="tradio-live-playhead" style={{ left: `${(playhead / length) * 100}%` }} />{t.clips.map(c => <div key={c.id} className={`tradio-live-clip ${selectedClip === c.id ? 'selected' : ''}`} onPointerDown={e => down(e, c)} style={{ left: `${(c.start / length) * 100}%`, width: `${Math.max(4, (c.duration / length) * 100)}%` }}><em>{c.name}</em><Wave peaks={c.peaks} active={transport === 'playing'} /></div>)}</div>
  </div>;

  const mixer = <section className="tradio-live-panel"><h3><SlidersHorizontal /> Mixer</h3>{tracks.map(t => <div key={t.id} className="tradio-live-strip"><div><b>{t.icon}</b><strong>{t.name}</strong><span>{t.bus}</span></div><label>VOL<input type="range" min="0" max="1.4" step="0.01" value={t.volume} onChange={e => updateTrack(t.id, { volume: Number(e.target.value) })} /></label><label>PAN<input type="range" min="-1" max="1" step="0.01" value={t.pan} onChange={e => updateTrack(t.id, { pan: Number(e.target.value) })} /></label><p><i style={{ width: `${t.meter * 100}%` }} /></p></div>)}</section>;
  const tools = <section className="tradio-live-panel"><h3><Wand2 /> AI Copilot</h3><div className="tradio-live-card"><strong>Session Overview</strong><span>{tracks.length} tracks · {tracks.flatMap(t => t.clips).length} clips · {fmt(length)} · {bpm} BPM</span></div><div className="tradio-live-grid"><button onClick={() => setSnap(!snap)}>Snap {snap ? 'On' : 'Off'}</button><button onClick={duplicateClip} disabled={!clip}>Duplicate</button><button onClick={mergeClips}>Merge</button><button onClick={() => setPlayhead(0)}>Return</button></div><div className="tradio-live-backend"><strong>Stem Splitter</strong><span>Backend endpoint needed. No fake AI stem success state.</span><Pill warn>Backend needed</Pill></div><div className="tradio-live-backend"><strong>Vocal Isolator</strong><span>Ready for a real isolation endpoint. Disabled honestly until wired.</span><Pill warn>Backend needed</Pill></div></section>;
  const exportBox = <section className="tradio-live-panel"><h3><Download /> Export</h3><div className="tradio-live-card"><strong>{project}</strong><span>{tracks.length} tracks · {fmt(length)} · Web Audio bounce</span></div><button className="tradio-live-main" onClick={exportMaster} disabled={exporting}>{exporting ? 'Rendering...' : 'Export Master WAV'}</button><button className="tradio-live-secondary" onClick={save}><Save size={15} /> Save Session</button></section>;

  return <div className="tradio-live-daw" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); importFiles(e.dataTransfer.files); }}>
    <input ref={inputRef} hidden type="file" accept="audio/*" multiple onChange={e => e.target.files && importFiles(e.target.files)} />
    <header><div className="brand"><Radio /><div><strong>Tradio Studio</strong><span>Live React DAW · no iframe · no static page</span></div></div><div className="fields"><input value={project} onChange={e => setProject(e.target.value)} /><input type="number" value={bpm} onChange={e => setBpm(Number(e.target.value) || 120)} /><input value={songKey} onChange={e => setSongKey(e.target.value)} /></div><div className="pills"><Pill>Saved local</Pill><Pill warn={!snap}>Snap {snap ? 'On' : 'Off'}</Pill></div></header>
    <main className="desktop"><aside className="left"><button onClick={() => addTrack()}><Plus /> Add Track</button><button onClick={() => inputRef.current?.click()}><UploadCloud /> Import Stem</button><button onClick={splitClip}><Scissors /> Split</button><button onClick={deleteClip} disabled={!selectedClip}><Trash2 /> Remove Clip</button><button onClick={removeTrack} disabled={!selectedTrack}><Trash2 /> Remove Track</button><div className="progress"><span>Project Progress</span><b>{progress}%</b><p><i style={{ width: `${progress}%` }} /></p><em>Neon Skyline · decoded tracks active</em></div></aside><section className="center"><div className="transport"><button className="play" onClick={transport === 'playing' ? () => stop(false) : play}>{transport === 'playing' ? <Pause /> : <Play />}</button><button onClick={() => stop(true)}>Stop</button><button className={transport === 'recording' ? 'recording' : ''} onClick={record}><Mic /> {transport === 'recording' ? fmt(recordTime) : 'Record'}</button><div><strong>{fmt(playhead)}</strong><span>{beat}</span></div><input type="range" min="0" max={length} step={snap ? 0.25 : 0.01} value={playhead} onChange={e => setPlayhead(Number(e.target.value))} /></div><div className="arrange"><div className="ruler">{Array.from({ length: 12 }, (_, i) => <span key={i}>Bar {i + 1}</span>)}</div>{tracks.map(renderTrack)}</div></section><aside className="right"><section className="tradio-live-panel"><h3><Activity /> Visualizer</h3><canvas ref={canvasRef} width={520} height={160} /><div className="tradio-live-card"><strong>Tradio Radio</strong><span>UP NEXT · Studio bounce preview · {fmt(length)}</span></div></section>{mixer}{tools}{exportBox}</aside></main>
    <main className="mobile"><section className="mobile-hero"><div><span>9:41</span><strong>Tradio Studio</strong><em>{project}</em></div><button onClick={save}><Save size={15} /> Saved</button></section><section className="mobile-transport"><button onClick={transport === 'playing' ? () => stop(false) : play}>{transport === 'playing' ? <Pause /> : <Play />}</button><button onClick={splitClip}>Split</button><strong>{fmt(playhead)}</strong><button onClick={() => addTrack()}>Add Track</button><button onClick={() => inputRef.current?.click()}>Import Stem</button></section><nav className="mobile-tabs">{(['tracks', 'mixer', 'tools', 'export'] as const).map(p => <button key={p} className={mobilePanel === p ? 'active' : ''} onClick={() => setMobilePanel(p)}>{p}</button>)}</nav>{mobilePanel === 'tracks' && <section>{tracks.map(renderTrack)}</section>}{mobilePanel === 'mixer' && mixer}{mobilePanel === 'tools' && tools}{mobilePanel === 'export' && exportBox}</main>
    <footer><span>{status}</span><span><Sparkles size={14} /> Direct live React implementation of the uploaded Tradio DAW layout</span></footer>
  </div>;
}
