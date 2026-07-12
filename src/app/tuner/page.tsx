"use client";

import { useRef } from "react";
import Link from "next/link";

// Standard tuning reference tones (Hz), low to high.
const STRINGS = [
  { note: "E", label: "6th · Low E", freq: 82.41 },
  { note: "A", label: "5th · A", freq: 110.0 },
  { note: "D", label: "4th · D", freq: 146.83 },
  { note: "G", label: "3rd · G", freq: 196.0 },
  { note: "B", label: "2nd · B", freq: 246.94 },
  { note: "E", label: "1st · High E", freq: 329.63 },
];

export default function TunerPage() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = (freq: number) => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = ctxRef.current;
    ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.7);
  };

  return (
    <div className="mx-auto max-w-xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <Link href="/" className="text-sm text-bronze">← Today</Link>
      <h1 className="mt-3 mb-1 font-display text-[33px] font-semibold text-espresso">Tuner</h1>
      <p className="mb-8 text-sm text-muted">Tap a string to hear its reference pitch, then match your guitar by ear — standard tuning.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {STRINGS.map((s, i) => (
          <button
            key={i}
            onClick={() => play(s.freq)}
            className="rounded-[16px] border border-border-warm bg-white p-5 text-center transition-transform active:scale-95"
          >
            <div className="font-display text-[40px] font-bold leading-none text-chestnut">{s.note}</div>
            <div className="mt-2 text-xs text-muted">{s.label}</div>
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-faint">A full microphone tuner is coming soon.</p>
    </div>
  );
}
