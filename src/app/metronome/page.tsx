"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function MetronomePage() {
  const [bpm, setBpm] = useState(60);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatRef = useRef(0);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const interval = 60000 / bpm;
    const tick = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const accent = beatRef.current % 4 === 0;
      osc.frequency.value = accent ? 1200 : 800;
      gain.gain.setValueAtTime(accent ? 0.5 : 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
      setBeat(beatRef.current % 4);
      beatRef.current += 1;
    };
    tick();
    timerRef.current = setInterval(tick, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, bpm]);

  const toggle = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    ctxRef.current.resume();
    beatRef.current = 0;
    setPlaying((p) => !p);
  };

  return (
    <div className="mx-auto max-w-xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <Link href="/" className="text-sm text-bronze">← Today</Link>
      <h1 className="mt-3 mb-1 font-display text-[33px] font-semibold text-espresso">Metronome</h1>
      <p className="mb-8 text-sm text-muted">Start slow, then build up. Steady time is the heart of worship rhythm.</p>

      <div className="rounded-[22px] p-8 text-center text-cream" style={{ background: "radial-gradient(circle at 50% 38%,#4A2E18 0%,#2C1810 60%,#1A0E08 100%)", boxShadow: "0 16px 36px rgba(44,24,16,.28)" }}>
        {/* beat dots */}
        <div className="mb-8 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-3.5 w-3.5 rounded-full transition-all" style={{ background: playing && beat === i ? "#D4A96A" : "rgba(255,255,255,.18)", transform: playing && beat === i ? "scale(1.3)" : "scale(1)" }} />
          ))}
        </div>

        <div className="font-display text-[64px] font-bold leading-none text-cream">{bpm}</div>
        <div className="kicker mt-1 text-[11px] text-amber">BPM</div>

        <input
          type="range"
          min={40}
          max={200}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="mt-6 w-full accent-[#D4A96A]"
        />
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
