// Shared Web Audio helper with iOS unlocking + silent-switch handling.
// iOS Safari: (1) an AudioContext must be created/resumed inside a user
// gesture, and (2) audio is muted by the ring/silent switch unless we opt
// into the "playback" audio session.

let ctx: AudioContext | null = null;
let armed = false;

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

// Strum a chord: pluck each string in turn (low to high) with a gentle decay,
// through a lowpass for a warmer, more guitar-like tone.
export function strum(freqs: number[], stagger = 0.035, dur = 1.8): void {
  const c = ensureCtx();
  freqs.forEach((f, i) => {
    const t0 = c.currentTime + i * stagger;
    const osc = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2600;
    osc.type = "triangle";
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.16, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.1);
  });
}

// Play a chord (array of frequencies) as a soft pad, optionally offset by `when` seconds.
export function playChord(freqs: number[], dur = 1.2, when = 0): void {
  const c = ensureCtx();
  const t0 = c.currentTime + when;
  freqs.forEach((f, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "triangle";
    osc.frequency.value = f;
    osc.detune.value = i === 0 ? 0 : i % 2 ? 3 : -3;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.11, t0 + 0.04);
    gain.gain.setTargetAtTime(0.0001, t0 + dur * 0.7, 0.25);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.4);
  });
}
