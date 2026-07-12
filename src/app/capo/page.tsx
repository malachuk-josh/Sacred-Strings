"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { pitchOf, noteName, preferFlat, guitarTriadFreqs, SHAPE_FAMILIES } from "@/lib/music";
import { armAudio, unlockAudio, strum } from "@/lib/audio";

const KEYS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

function qualityOf(suffix: string): string {
  const s = suffix.toLowerCase();
  if (s.startsWith("dim") || s.startsWith("°")) return "dim";
  if (s.startsWith("m") && !s.startsWith("maj")) return "m";
  return "";
}

export default function CapoPage() {
  const [soundingKey, setSoundingKey] = useState("Bb");
  const [fromKey, setFromKey] = useState("G");
  const [toKey, setToKey] = useState("A");
  const [chordInput, setChordInput] = useState("G  Em  C  D");

  useEffect(() => {
    armAudio();
  }, []);

  const capoOptions = useMemo(() => {
    const sounding = pitchOf(soundingKey) ?? 0;
    return SHAPE_FAMILIES.map((shape) => {
      const fret = (((sounding - (pitchOf(shape) ?? 0)) % 12) + 12) % 12;
      return { shape, fret };
    }).sort((a, b) => a.fret - b.fret);
  }, [soundingKey]);

  const bestFret = capoOptions[0]?.fret;

  const shift = useMemo(() => {
    const f = pitchOf(fromKey) ?? 0;
    const t = pitchOf(toKey) ?? 0;
    return (((t - f) % 12) + 12) % 12;
  }, [fromKey, toKey]);

  const transposedChords = useMemo(() => {
    const flat = preferFlat(toKey);
    return chordInput
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((chord) => {
        const m = chord.match(/^([A-Ga-g][#b]?)(.*)$/);
        if (!m) return { name: chord, root: null as number | null, quality: "" };
        const root = pitchOf(m[1]);
        if (root === null) return { name: chord, root: null, quality: "" };
        const newRoot = (root + shift) % 12;
        return { name: noteName(newRoot, flat) + m[2], root: newRoot, quality: qualityOf(m[2]) };
      });
  }, [chordInput, shift, toKey]);

  const transposedText = transposedChords.map((c) => c.name).join("   ");

  const playChords = async () => {
    await unlockAudio();
    let when = 0;
    for (const c of transposedChords) {
      if (c.root === null) continue;
      strum(guitarTriadFreqs(c.root, c.quality), { when });
      when += 1.3;
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <Link href="/" className="text-sm text-bronze">← Today</Link>
      <h1 className="mt-3 mb-1 font-display text-[33px] font-semibold text-espresso">Capo &amp; Keys</h1>
      <p className="mb-8 text-sm text-muted">Find the capo position to play easy open shapes in any key — and transpose a song to fit your vocalist.</p>

      {/* ===== Capo finder ===== */}
      <section className="mb-10 rounded-[18px] border border-border-warm bg-white p-6">
        <h2 className="mb-1 font-display text-xl font-semibold text-espresso">Capo finder</h2>
        <p className="mb-4 text-sm text-muted">The song needs to sound in this key:</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {KEYS.map((k) => (
            <button
              key={k}
              onClick={() => setSoundingKey(k)}
              className="rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors"
              style={k === soundingKey ? { background: "#5C3A1E", color: "#F5E6D0", borderColor: "#5C3A1E" } : { background: "#FAF4EA", borderColor: "#EADFC9", color: "#5C3A1E" }}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {capoOptions.map(({ shape, fret }) => {
            const recommended = fret === bestFret;
            return (
              <div
                key={shape}
                className="flex items-center justify-between rounded-[12px] px-4 py-3"
                style={recommended ? { background: "linear-gradient(135deg,#4A2E18,#2C1810)", color: "#F5E6D0" } : { background: "#F3E7D4" }}
              >
                <span className="text-sm font-semibold" style={{ color: recommended ? "#F5E6D0" : "#5C3A1E" }}>
                  Play <b>{shape}</b> shapes
                </span>
                <span className="flex items-center gap-2">
                  {recommended && <span className="kicker text-[10px] text-amber">Easiest</span>}
                  <span className="font-display text-lg font-bold" style={{ color: recommended ? "#D4A96A" : "#5C3A1E" }}>
                    {fret === 0 ? "No capo" : `Capo ${fret}`}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">
          With a capo at the fret shown, your open <b>shape</b> chords will sound in <b>{soundingKey}</b>.
        </p>
      </section>

      {/* ===== Transposer ===== */}
      <section className="rounded-[18px] border border-border-warm bg-white p-6">
        <h2 className="mb-4 font-display text-xl font-semibold text-espresso">Transpose a song</h2>
        <div className="mb-5 flex items-center gap-3">
          <label className="flex-1">
            <span className="text-xs text-muted">From key</span>
            <select value={fromKey} onChange={(e) => setFromKey(e.target.value)} className="mt-1 w-full rounded-[10px] border border-border-warm bg-parchment px-3 py-2 text-sm text-espresso outline-none focus:border-bronze">
              {KEYS.map((k) => <option key={k}>{k}</option>)}
            </select>
          </label>
          <span className="mt-5 text-bronze">→</span>
          <label className="flex-1">
            <span className="text-xs text-muted">To key</span>
            <select value={toKey} onChange={(e) => setToKey(e.target.value)} className="mt-1 w-full rounded-[10px] border border-border-warm bg-parchment px-3 py-2 text-sm text-espresso outline-none focus:border-bronze">
              {KEYS.map((k) => <option key={k}>{k}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-muted">Chords (space-separated)</span>
          <input
            value={chordInput}
            onChange={(e) => setChordInput(e.target.value)}
            placeholder="G Em C D"
            className="mt-1 w-full rounded-[10px] border border-border-warm bg-parchment px-3 py-2.5 font-mono text-sm text-espresso outline-none focus:border-bronze"
          />
        </label>

        <div className="mt-5 rounded-[12px] p-4" style={{ background: "linear-gradient(155deg,#F3E7D4,#EFE0C9)", border: "1px solid #E5D8C0" }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="kicker text-[11px] text-bronze">In {toKey} {shift > 0 ? `(+${shift} semitones)` : "(same key)"}</span>
            <button onClick={playChords} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-cream" style={{ background: "#5C3A1E" }}>
              <svg width="9" height="11" viewBox="0 0 16 18"><path d="M2 2l12 7-12 7V2z" fill="#F5E6D0" /></svg>
              Hear it
            </button>
          </div>
          <div className="font-mono text-lg font-semibold text-espresso">{transposedText || "—"}</div>
        </div>
      </section>
    </div>
  );
}
