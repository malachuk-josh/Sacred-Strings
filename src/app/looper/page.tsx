"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  MAJOR_KEYS,
  PROGRESSIONS,
  majorKeyChords,
  pitchOf,
  preferFlat,
  guitarTriadFreqs,
} from "@/lib/music";
import { armAudio, unlockAudio, strum, playClick, dampStrings } from "@/lib/audio";

export default function LooperPage() {
  const [keyName, setKeyName] = useState("G");
  const [progIndex, setProgIndex] = useState(0);
  const [bpm, setBpm] = useState(72);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatRef = useRef(0);

  useEffect(() => {
    armAudio();
  }, []);

  const chords = useMemo(() => {
    const root = pitchOf(keyName) ?? 7;
    const flat = preferFlat(keyName);
    const diatonic = majorKeyChords(root, flat);
    return PROGRESSIONS[progIndex].degrees.map((deg) => diatonic[deg - 1]);
  }, [keyName, progIndex]);

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
        const c = chords[chordIdx];
        strum(guitarTriadFreqs(c.root, c.quality), { stagger: 0.04 });
      }
      // 6 beats per chord reads as compound (6/8) time: lighter accent on beat 4.
      playClick(withinChord === 0 || (beatsPerChord === 6 && withinChord === 3));
      beatRef.current = beat + 1;
    };
    onBeat();
    timerRef.current = setInterval(onBeat, beatMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, bpm, beatsPerChord, chords]);

  const toggle = async () => {
    if (!playing) {
      await unlockAudio(); // iOS: resume + unlock within the tap
      beatRef.current = 0;
      setStep(0);
    } else {
      dampStrings(); // silence ringing strings on stop
    }
    setPlaying((p) => !p);
  };

  useEffect(() => {
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
            {[2, 3, 4, 6, 8].map((b) => (
              <Chip key={b} active={b === beatsPerChord} onClick={() => setBeatsPerChord(b)}>{b}</Chip>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-faint">3 = waltz-time hymns · 6 = flowing 6/8 ballads</p>
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
