"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { armAudio, unlockAudio, playClick } from "@/lib/audio";

const SIGNATURES = [
  { label: "2/4", beats: 2 },
  { label: "3/4", beats: 3 },
  { label: "4/4", beats: 4 },
  { label: "6/8", beats: 6 },
];

export default function MetronomePage() {
  const [bpm, setBpm] = useState(60);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatRef = useRef(0);

  useEffect(() => {
    armAudio();
  }, []);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const interval = 60000 / bpm;
    const tick = () => {
      const within = beatRef.current % beatsPerBar;
      // 6/8 is compound time: two groups of three, so beat 4 gets a lighter accent too.
      const accent = within === 0 || (beatsPerBar === 6 && within === 3);
      playClick(accent);
      setBeat(within);
      beatRef.current += 1;
    };
    beatRef.current = 0;
    tick();
    timerRef.current = setInterval(tick, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, bpm, beatsPerBar]);

  const toggle = async () => {
    if (!playing) {
      await unlockAudio();
      beatRef.current = 0;
    }
    setPlaying((p) => !p);
  };

  return (
    <div className="mx-auto max-w-xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <Link href="/" className="text-sm text-bronze">← Today</Link>
      <h1 className="mt-3 mb-1 font-display text-[33px] font-semibold text-espresso">Metronome</h1>
      <p className="mb-8 text-sm text-muted">Start slow, then build up. Steady time is the heart of worship rhythm.</p>

      <div className="rounded-[22px] p-8 text-center text-cream" style={{ background: "radial-gradient(circle at 50% 38%,#4A2E18 0%,#2C1810 60%,#1A0E08 100%)", boxShadow: "0 16px 36px rgba(44,24,16,.28)" }}>
        <div className="mb-6 flex justify-center gap-3">
          {Array.from({ length: beatsPerBar }, (_, i) => (
            <span key={i} className="h-3.5 w-3.5 rounded-full transition-all" style={{ background: playing && beat === i ? "#D4A96A" : "rgba(255,255,255,.18)", transform: playing && beat === i ? "scale(1.3)" : "scale(1)" }} />
          ))}
        </div>

        {/* time signature */}
        <div className="mb-6 flex justify-center gap-2">
          {SIGNATURES.map((s) => (
            <button
              key={s.label}
              onClick={() => setBeatsPerBar(s.beats)}
              className="rounded-full px-4 py-1.5 text-xs font-bold transition-colors"
              style={beatsPerBar === s.beats ? { background: "#D4A96A", color: "#2C1810" } : { background: "rgba(255,255,255,.1)", color: "#C9B49A" }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="font-display text-[64px] font-bold leading-none text-cream">{bpm}</div>
        <div className="kicker mt-1 text-[11px] text-amber">BPM</div>

        <input type="range" min={40} max={200} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="mt-6 w-full accent-[#D4A96A]" />
        <div className="mt-2 flex justify-between text-[11px] text-[#c9b49a]"><span>40</span><span>200</span></div>

        <button onClick={toggle} className="mt-6 rounded-full px-10 py-3 text-sm font-bold text-espresso" style={{ background: "#D4A96A", boxShadow: "0 8px 22px rgba(212,169,106,.4)" }}>
          {playing ? "Stop" : "Start"}
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {[60, 72, 80, 100, 120].map((preset) => (
          <button key={preset} onClick={() => setBpm(preset)} className="rounded-full border border-border-warm bg-white px-4 py-1.5 text-sm font-semibold text-chestnut">
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
