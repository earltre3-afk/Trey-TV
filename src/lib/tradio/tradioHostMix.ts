import { SFX_ASSETS, BED_ASSETS } from './sfxAssets';

/**
 * One Web Audio graph on the host's machine that mixes mic + SFX + music beds +
 * AI voice into a single MediaStream, which is published as ONE LiveKit track.
 * Generalizes the AI-voice mixing pattern that previously lived inline in
 * useTradioLiveRoom.
 */
export interface HostMix {
  readonly stream: MediaStream;
  readonly analyser: AnalyserNode;
  setMicStream(stream: MediaStream | null): void;
  setMasterVolume(v: number): void; // 0..1 (mic + AI)
  setBedVolume(v: number): void; // 0..1
  playSfx(id: string): Promise<void>;
  playBed(id: string): Promise<void>;
  stopBed(): void;
  playAiBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBufferSourceNode | null>;
  close(): Promise<void>;
}

export async function createHostMix(): Promise<HostMix> {
  const Ctx: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new Ctx();
  if (ctx.state === 'suspended') await ctx.resume();

  const dest = ctx.createMediaStreamDestination();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;

  // master = mic + AI; bed = music beds; SFX route straight to dest + analyser.
  const master = ctx.createGain();
  master.gain.value = 0.85;
  const bed = ctx.createGain();
  bed.gain.value = 0.3;
  master.connect(dest);
  master.connect(analyser);
  bed.connect(dest);
  bed.connect(analyser);

  let micNode: MediaStreamAudioSourceNode | null = null;
  let bedSource: AudioBufferSourceNode | null = null;
  const bufferCache = new Map<string, AudioBuffer>();

  async function load(src: string): Promise<AudioBuffer | null> {
    const cached = bufferCache.get(src);
    if (cached) return cached;
    try {
      const res = await fetch(src);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr);
      bufferCache.set(src, buf);
      return buf;
    } catch {
      // Asset missing or undecodable — fail quietly so the show isn't interrupted.
      return null;
    }
  }

  return {
    stream: dest.stream,
    analyser,
    setMicStream(stream) {
      if (micNode) {
        try { micNode.disconnect(); } catch { /* ignore */ }
        micNode = null;
      }
      if (stream && stream.getAudioTracks().length) {
        micNode = ctx.createMediaStreamSource(stream);
        micNode.connect(master);
      }
    },
    setMasterVolume(v) { master.gain.value = Math.max(0, Math.min(1, v)); },
    setBedVolume(v) { bed.gain.value = Math.max(0, Math.min(1, v)); },
    async playSfx(id) {
      const asset = SFX_ASSETS.find((a) => a.id === id);
      if (!asset) return;
      const buf = await load(asset.src);
      if (!buf) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(dest);
      src.connect(analyser);
      src.start();
    },
    async playBed(id) {
      const asset = BED_ASSETS.find((a) => a.id === id);
      if (!asset) return;
      const buf = await load(asset.src);
      if (!buf) return;
      try { bedSource?.stop(); } catch { /* ignore */ }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = asset.id === 'under';
      src.connect(bed);
      src.start();
      bedSource = src;
    },
    stopBed() {
      try { bedSource?.stop(); } catch { /* ignore */ }
      bedSource = null;
    },
    async playAiBuffer(arrayBuffer) {
      try {
        const buf = await ctx.decodeAudioData(arrayBuffer.slice(0));
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(master);
        src.start();
        return src;
      } catch {
        return null;
      }
    },
    async close() {
      try { bedSource?.stop(); } catch { /* ignore */ }
      try { micNode?.disconnect(); } catch { /* ignore */ }
      try { await ctx.close(); } catch { /* ignore */ }
    },
  };
}
