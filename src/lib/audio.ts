// Shared Web Audio engine with iOS unlocking + nylon-string synthesis.
//
// Plucked notes are generated with Karplus-Strong physical modelling — a
// simulated vibrating string (noise burst through a damped delay line) —
// so chords sound like a real classical (nylon-string) guitar rather than
// a raw oscillator. Buffers are cached per pitch.

let ctx: AudioContext | null = null;
let armed = false;
let stringsBus: GainNode | null = null;

function ensureCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  // Opt into the playback category so the iPhone silent switch doesn't mute us (iOS 16.5+).
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) session.type = "playback";
  } catch {
    /* not supported — ignore */
  }
  return ctx;
}

function ensureBus(c: AudioContext): GainNode {
  if (!stringsBus) {
    stringsBus = c.createGain();
    stringsBus.gain.value = 1;
    // A gentle "body" roll-off shared by every string.
    const body = c.createBiquadFilter();
    body.type = "lowpass";
    body.frequency.value = 3400;
    body.Q.value = 0.4;
    stringsBus.connect(body);
    body.connect(c.destination);
  }
  return stringsBus;
}

export function getCtx(): AudioContext {
  return ensureCtx();
}

// Resume + play a silent buffer to fully unlock audio on iOS. Call inside a gesture.
export async function unlockAudio(): Promise<AudioContext> {
  const c = ensureCtx();
  if (c.state !== "running") {
    try {
      await c.resume();
    } catch {
      /* ignore */
    }
  }
  try {
    const buffer = c.createBuffer(1, 1, 22050);
    const src = c.createBufferSource();
    src.buffer = buffer;
    src.connect(c.destination);
    src.start(0);
  } catch {
    /* ignore */
  }
  return c;
}

// Attach a one-time listener so the very first touch/click on the page unlocks
// audio — by the time the user taps a control, sound is ready. Call on mount.
export function armAudio(): void {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const unlock = () => {
    void unlockAudio();
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("touchstart", unlock);
  };
  document.addEventListener("pointerdown", unlock);
  document.addEventListener("touchstart", unlock);
}

// ---------- Karplus-Strong nylon pluck ----------

const pluckCache = new Map<number, AudioBuffer>();

function pluckBuffer(c: BaseAudioContext, freq: number): AudioBuffer {
  const cacheKey = Math.round(freq * 10);
  const cached = pluckCache.get(cacheKey);
  if (cached) return cached;

  const sr = c.sampleRate;
  // Bass strings ring longer than treble, like a real guitar.
  const dur = Math.min(3.5, 1.4 + 160 / freq);
  const len = Math.floor(sr * dur);
  const buf = c.createBuffer(1, len, sr);
  const out = buf.getChannelData(0);

  const N = Math.max(2, Math.round(sr / freq));
  const ring = new Float32Array(N);

  // Soft (lowpass-filtered) noise burst — the warm fingertip attack of a
  // nylon string, not the bright snap of a pick on steel.
  let lp = 0;
  for (let i = 0; i < N; i++) {
    lp = 0.5 * lp + 0.5 * (Math.random() * 2 - 1);
    ring[i] = lp;
  }
  // Pluck-position comb filter (~28% along the string) shapes the harmonics
  // like plucking over the soundhole.
  const pick = Math.max(1, Math.round(N * 0.28));
  for (let i = 0; i < N; i++) ring[i] -= 0.6 * ring[(i + pick) % N];
  // Normalize the burst.
  let peak = 0;
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(ring[i]));
  if (peak > 0) for (let i = 0; i < N; i++) ring[i] /= peak;

  // The string loop: averaging lowpass (natural treble decay) + damping.
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const cur = ring[idx];
    const nxt = ring[(idx + 1) % N];
    out[i] = cur;
    ring[idx] = (cur + nxt) * 0.5 * 0.9965;
    idx = (idx + 1) % N;
  }
  // Fade the tail to silence to avoid clicks.
  const fade = Math.min(len, Math.floor(sr * 0.08));
  for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;

  pluckCache.set(cacheKey, buf);
  return buf;
}

// Pluck a single nylon string.
export function pluck(freq: number, when = 0, gain = 0.5): void {
  const c = ensureCtx();
  const src = c.createBufferSource();
  src.buffer = pluckBuffer(c, freq);
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(ensureBus(c));
  src.start(c.currentTime + when);
}

// Strum a chord: pluck each string low-to-high with a natural stagger and a
// slight crescendo toward the treble strings.
export function strum(
  freqs: number[],
  opts: { when?: number; stagger?: number; gain?: number } = {}
): void {
  const { when = 0, stagger = 0.045, gain = 0.5 } = opts;
  const n = Math.max(1, freqs.length - 1);
  freqs.forEach((f, i) => {
    pluck(f, when + i * stagger, gain * (0.8 + 0.2 * (i / n)));
  });
}

// Duck every ringing string quickly (used when a tool stops playback).
export function dampStrings(): void {
  const c = ensureCtx();
  const bus = ensureBus(c);
  const t = c.currentTime;
  bus.gain.cancelScheduledValues(t);
  bus.gain.setValueAtTime(bus.gain.value, t);
  bus.gain.linearRampToValueAtTime(0.0001, t + 0.12);
  bus.gain.setValueAtTime(1, t + 0.35);
}

// ---------- Rhythm section (practice tracks) ----------
// All *At functions take an ABSOLUTE AudioContext time so a scheduler can
// place events precisely. Everything routes through trackBus so a track can
// be silenced instantly on stop.

let trackBus: GainNode | null = null;

function ensureTrackBus(c: AudioContext): GainNode {
  if (!trackBus) {
    trackBus = c.createGain();
    trackBus.gain.value = 1;
    trackBus.connect(c.destination);
  }
  return trackBus;
}

export function trackNow(): number {
  return ensureCtx().currentTime;
}

// Restore the bus (call when starting playback).
export function openTrackBus(): void {
  const c = ensureCtx();
  const bus = ensureTrackBus(c);
  bus.gain.cancelScheduledValues(c.currentTime);
  bus.gain.setValueAtTime(1, c.currentTime);
}

// Fade the whole rhythm section out fast (call on stop).
export function closeTrackBus(): void {
  const c = ensureCtx();
  const bus = ensureTrackBus(c);
  bus.gain.cancelScheduledValues(c.currentTime);
  bus.gain.setValueAtTime(bus.gain.value, c.currentTime);
  bus.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.15);
}

let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.4), c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

export function kickAt(t: number, gain = 0.9): void {
  const c = ensureCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  osc.connect(g);
  g.connect(ensureTrackBus(c));
  osc.start(t);
  osc.stop(t + 0.3);
}

export function snareAt(t: number, gain = 0.4): void {
  const c = ensureCtx();
  const bus = ensureTrackBus(c);
  // noise body
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  src.connect(bp); bp.connect(g); g.connect(bus);
  src.start(t); src.stop(t + 0.2);
  // tonal thump
  const osc = c.createOscillator();
  const og = c.createGain();
  osc.type = "triangle";
  osc.frequency.value = 185;
  og.gain.setValueAtTime(gain * 0.5, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(og); og.connect(bus);
  osc.start(t); osc.stop(t + 0.12);
}

export function hatAt(t: number, gain = 0.12): void {
  const c = ensureCtx();
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7500;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
  src.connect(hp); hp.connect(g); g.connect(ensureTrackBus(c));
  src.start(t); src.stop(t + 0.06);
}

export function bassAt(t: number, freq: number, dur: number, gain = 0.4): void {
  const c = ensureCtx();
  const osc = c.createOscillator();
  const lp = c.createBiquadFilter();
  const g = c.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  lp.type = "lowpass";
  lp.frequency.value = 420;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.setValueAtTime(gain, t + Math.max(0.05, dur - 0.12));
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(lp); lp.connect(g); g.connect(ensureTrackBus(c));
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

// Ambient worship pad: detuned saws through a soft lowpass, slow swell.
export function padAt(t: number, freqs: number[], dur: number, gain = 0.045): void {
  const c = ensureCtx();
  const bus = ensureTrackBus(c);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 950;
  lp.Q.value = 0.3;
  const master = c.createGain();
  master.gain.setValueAtTime(0.0001, t);
  master.gain.linearRampToValueAtTime(1, t + 0.5);
  master.gain.setValueAtTime(1, t + Math.max(0.5, dur - 0.3));
  master.gain.linearRampToValueAtTime(0.0001, t + dur + 0.6);
  lp.connect(master);
  master.connect(bus);
  freqs.forEach((f) => {
    [-6, 5].forEach((cents) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = f;
      osc.detune.value = cents;
      g.gain.value = gain;
      osc.connect(g); g.connect(lp);
      osc.start(t);
      osc.stop(t + dur + 0.7);
    });
  });
}

// Strum at an absolute time (wraps pluck; strings route through the strings bus).
export function strumAt(t: number, freqs: number[], gain = 0.4): void {
  const c = ensureCtx();
  const rel = Math.max(0, t - c.currentTime);
  strum(freqs, { when: rel, stagger: 0.035, gain });
}

// ---------- Utility tones ----------

export function playClick(accent = false): void {
  const c = ensureCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.frequency.value = accent ? 1500 : 1000;
  gain.gain.setValueAtTime(accent ? 0.18 : 0.09, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.05);
}

// A pure sustained reference tone (kept for anything that needs a sine).
export function playTone(freq: number, dur = 1.5): void {
  const c = ensureCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur + 0.1);
}
