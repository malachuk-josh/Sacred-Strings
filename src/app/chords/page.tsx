"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CHORDS, type ChordShape } from "@/lib/curriculum";
import { chordVoicing, midiToFreq } from "@/lib/music";
import { armAudio, unlockAudio, strum } from "@/lib/audio";
import ChordDiagram from "@/components/ChordDiagram";

export default function ChordsPage() {
  const entries = Object.entries(CHORDS);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    armAudio();
  }, []);

  const play = async (key: string, chord: ChordShape) => {
    await unlockAudio();
    strum(chordVoicing(chord).map(midiToFreq));
    setActive(key);
    setTimeout(() => setActive((a) => (a === key ? null : a)), 600);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <Link href="/" className="text-sm text-bronze">← Today</Link>
      <h1 className="mt-3 mb-1 font-display text-[33px] font-semibold text-espresso">Chord Library</h1>
      <p className="mb-8 text-sm text-muted">The essential open chords for leading worship — tap any chord to hear it strummed.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {entries.map(([key, chord]) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => play(key, chord)}
              className="flex flex-col items-center rounded-[16px] border bg-white p-4 transition-all active:scale-95"
              style={{
                borderColor: isActive ? "#D4A96A" : "#EADFC9",
                boxShadow: isActive ? "0 8px 20px rgba(212,169,106,.3)" : "none",
              }}
            >
              <ChordDiagram chord={chord} width={120} />
              <div className="mt-2 flex items-center gap-1.5">
                <span className="font-display text-lg font-semibold text-espresso">{chord.name}</span>
                <svg width="11" height="13" viewBox="0 0 16 18" aria-hidden>
                  <path d="M2 2l12 7-12 7V2z" fill={isActive ? "#D4A96A" : "#B8834A"} />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-faint">Tip: turn your volume up. On iPhone, the ring switch should be on.</p>
    </div>
  );
}
