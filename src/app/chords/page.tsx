"use client";

import Link from "next/link";
import { CHORDS } from "@/lib/curriculum";
import ChordDiagram from "@/components/ChordDiagram";

export default function ChordsPage() {
  const entries = Object.entries(CHORDS);
  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <Link href="/" className="text-sm text-bronze">← Today</Link>
      <h1 className="mt-3 mb-1 font-display text-[33px] font-semibold text-espresso">Chord Library</h1>
      <p className="mb-8 text-sm text-muted">The essential open chords for leading worship — the shapes behind most every song.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {entries.map(([key, chord]) => (
          <div key={key} className="flex flex-col items-center rounded-[16px] border border-border-warm bg-white p-4">
            <ChordDiagram chord={chord} width={120} />
            <div className="mt-2 font-display text-lg font-semibold text-espresso">{chord.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
