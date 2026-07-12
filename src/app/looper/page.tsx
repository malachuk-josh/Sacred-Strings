"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  MAJOR_KEYS,
  PROGRESSIONS,
  majorKeyChords,
  pitchOf,
  preferFlat,
  triadTones,
  pitchToFreq,
} from "@/lib/music";

export default function LooperPage() {
  const [keyName, setKeyName] = useState("G");
  const [progIndex, setProgIndex] = useState(0);
  const [bpm, setBpm] = useState(72);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatRef = useRef(0);
  const padRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);

  const chords = useMemo(() => {
    const root = pitchOf(keyName) ?? 7;
    const flat = preferFlat(keyName);
    const diatonic = majorKeyChords(root, flat);
    return PROGRESSIONS[progIndex].degrees.map((deg) => diatonic[deg - 1]);
  }, [keyName, progIndex]);

  const playPad = (chordIdx: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    // stop previous
    padRef.current.forEach(({ osc, gain }) => {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      osc.stop(ctx.currentTime + 0.3);
    });
    padRef.current = [];
    const chord = chords[chordIdx];
    const tones = triadTones(chord.root, chord.quality);
    const dur = (beatsPerChord * 60) / bpm;
    // triad + root an octave up
    const freqs = tones.map((t) => pitchToFreq(t, 3));
    freqs.push(pitchToFreq(chord.root, 4));
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      osc.detune.value = i === 0 ? 0 : (i % 2 ? 3 : -3);
      const peak = 0.11;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + 0.04);
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime + dur * 0.7, 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur + 0.4);
      padRef.current.push({ osc, gain });
    });
  };

  const click = (accent: boolean) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = accent ? 1500 : 1000;
    gain.gain.setValueAtTime(accent ? 0.18 : 0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  };

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const beatMs = 60000 / bpm;
    const onBeat = () => {
      const beat = beatRef.current;
      const withinChord = beat % beatsPerChord;
      if (withinChord === 0) {
        const chordIdx = Math.floor(beat / beatsPerChord) % chords.length;
        setStep(chordIdx);
        playPad(chordIdx);
      }
      click(withinChord === 0);
      beatRef.current = beat + 1;
    };
    onBeat();
    timerRef.current = setInterval(onBeat, beatMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, bpm, beatsPerChord, chords]);

  const toggle = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    ctxRef.current.resume();
    beatRef.current = 0;
    setStep(0);
    setPlaying((p) => !p);
  };

  useEffect(() => {
    // stop audio when settings change mid-play
    if (playing) {
      beatRef.current = 0;
      setStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyName, progIndex]);

  return (
    <div className="mx-auto max-w-2xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <Link href="/" className="text-sm text-bronze">← Today</Link>
      <h1 className="mt-3 mb-1 font-display text-[33px] font-semibold text-espresso">Progression Looper</h1>
      <p className="mb-6 text-sm text-muted">Loop a worship progression in any key, then practice your rhythm and lead lines over it.</p>

      {/* stage */}
      <div className="rounded-[22px] p-6 text-center text-cream lg:p-8" style={{ background: "radial-gradient(circle at 50% 38%,#4A2E18 0%,#2C1810 60%,#1A0E08 100%)", boxShadow: "0 16px 36px rgba(44,24,16,.28)" }}>
        <div className="kicker mb-4 text-[11px] text-amber">{keyName} major · {PROGRESSIONS[progIndex].label}</div>
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
          {chords.map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <span
                className="flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-semibold transition-all"
                style={playing && step === i
                  ? { background: "#D4A96A", color: "#2C1810", transform: "scale(1.08)", boxShadow: "0 6px 18px rgba(212,169,106,.45)" }
                  : { background: "rgba(255,255,255,.08)", color: "#F5E6D0" }}
              >
                {c.name}
              </span>
              <span className="mt-1.5 text-[11px] text-[#c9b49a]">{c.degree}</span>
            </div>
          ))}
        </div>
        <button onClick={toggle} className="rounded-full px-10 py-3 text-sm font-bold text-espresso" style={{ background: "#D4A96A", boxShadow: "0 8px 22px rgba(212,169,106,.4)" }}>
          {playing ? "Stop" : "Play"}
        </button>
      </div>

      {/* controls */}
      <div className="mt-6 space-y-5">
        <Field label="Key">
          <div className="flex flex-wrap gap-2">
            {MAJOR_KEYS.map((k) => (
              <Chip key={k} active={k === keyName} onClick={() => setKeyName(k)}>{k}</Chip>
            ))}
          </div>
        </Field>

        <Field label="Progression">
          <div className="flex flex-col gap-2">
            {PROGRESSIONS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setProgIndex(i)}
                className="rounded-[12px] border px-4 py-2.5 text-left text-sm font-semibold transition-colors"
                style={i === progIndex ? { background: "#5C3A1E", color: "#F5E6D0", borderColor: "#5C3A1E" } : { background: "#fff", borderColor: "#EADFC9", color: "#5C3A1E" }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Tempo · ${bpm} BPM`}>
          <input type="range" min={50} max={160} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-full accent-[#B8834A]" />
        </Field>

        <Field label="Beats per chord">
          <div className="flex gap-2">
            {[2, 4, 8].map((b) => (
              <Chip key={b} active={b === beatsPerChord} onClick={() => setBeatsPerChord(b)}>{b}</Chip>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="kicker mb-2 text-[12px] text-muted">{label}</div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors"
      style={active ? { background: "#5C3A1E", color: "#F5E6D0", borderColor: "#5C3A1E" } : { background: "#fff", borderColor: "#EADFC9", color: "#5C3A1E" }}
    >
      {children}
    </button>
  );
}
