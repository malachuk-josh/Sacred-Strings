"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { songById, type SongSection } from "@/lib/songs";
import { CHORDS } from "@/lib/curriculum";
import { chordVoicing, midiToFreq } from "@/lib/music";
import { armAudio, unlockAudio, strum } from "@/lib/audio";
import ChordDiagram from "@/components/ChordDiagram";

export default function SongDetailPage() {
  const params = useParams();
  const song = songById(String(params.id));
  const [active, setActive] = useState<{ section: number; index: number } | null>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    armAudio();
    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  if (!song) {
    return (
      <div className="mx-auto max-w-2xl px-5 pt-24 text-center">
        <p className="font-display text-2xl text-espresso">Song not found</p>
        <Link href="/songs" className="mt-4 inline-block text-bronze">← Back to the library</Link>
      </div>
    );
  }

  const playSection = async (sectionIdx: number, section: SongSection) => {
    await unlockAudio();
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    const secPerChord = Math.max(0.7, (60 / song.tempo) * 2);
    section.chords.forEach((name, i) => {
      const t = setTimeout(() => {
        const shape = CHORDS[name];
        if (shape) strum(chordVoicing(shape).map(midiToFreq));
        setActive({ section: sectionIdx, index: i });
      }, i * secPerChord * 1000);
      timeouts.current.push(t);
    });
    const end = setTimeout(() => setActive(null), section.chords.length * secPerChord * 1000);
    timeouts.current.push(end);
  };

  const uniqueChords = song.chords;

  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 pb-16 lg:px-10 lg:pt-10">
      <Link href="/songs" className="text-sm text-bronze">← Song Library</Link>

      {/* header */}
      <h1 className="mt-3 font-display text-[32px] font-semibold leading-tight text-espresso lg:text-[40px]">{song.title}</h1>
      <p className="text-sm text-muted">{song.author}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Meta label="Key" value={song.key} />
        {song.capo ? <Meta label="Capo" value={String(song.capo)} /> : null}
        <Meta label="Tempo" value={`${song.tempo} BPM`} />
        <Meta label="Feel" value={song.feel} />
        <Meta label="Level" value={song.difficulty} />
      </div>

      {song.firstLine && (
        <p className="mt-5 border-l-2 pl-3.5 font-display text-lg italic text-chestnut" style={{ borderColor: "#D4A96A" }}>
          &ldquo;{song.firstLine}&rdquo;
        </p>
      )}

      {/* chords used */}
      <h2 className="mt-8 mb-3 font-display text-xl font-semibold text-espresso">Chords in this song</h2>
      <div className="flex flex-wrap gap-3">
        {uniqueChords.map((name) => {
          const shape = CHORDS[name];
          return (
            <div key={name} className="flex flex-col items-center rounded-[14px] border border-border-warm bg-white p-3">
              {shape ? <ChordDiagram chord={shape} width={92} /> : <div className="flex h-[112px] w-[80px] items-center justify-center font-display text-2xl text-espresso">{name}</div>}
              <span className="mt-1 text-sm font-semibold text-espresso">{name}</span>
            </div>
          );
        })}
      </div>

      {/* chart */}
      <h2 className="mt-8 mb-3 font-display text-xl font-semibold text-espresso">Chart</h2>
      <div className="space-y-4">
        {song.sections.map((section, si) => (
          <div key={si} className="rounded-[16px] border border-border-warm bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="kicker text-[12px] text-bronze">{section.name}</span>
              <button
                onClick={() => playSection(si, section)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-cream"
                style={{ background: "#5C3A1E" }}
              >
                <svg width="9" height="11" viewBox="0 0 16 18"><path d="M2 2l12 7-12 7V2z" fill="#F5E6D0" /></svg>
                Play
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {section.chords.map((name, i) => {
                const isActive = active?.section === si && active.index === i;
                return (
                  <span
                    key={i}
                    className="flex h-10 min-w-[44px] items-center justify-center rounded-[10px] px-2 font-display text-lg font-semibold transition-all"
                    style={isActive
                      ? { background: "#D4A96A", color: "#2C1810", transform: "scale(1.08)" }
                      : { background: "#F3E7D4", color: "#5C3A1E" }}
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* strum + note */}
      <div className="mt-6 rounded-[16px] p-5" style={{ background: "linear-gradient(155deg,#F3E7D4,#EFE0C9)", border: "1px solid #E5D8C0" }}>
        <div className="kicker mb-1 text-[11px] text-bronze">Strumming</div>
        <p className="text-sm text-cocoa">{song.strum}</p>
        {song.note && <p className="mt-3 text-xs text-muted">{song.note}</p>}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/looper" className="rounded-full px-5 py-2.5 text-sm font-semibold text-cream" style={{ background: "linear-gradient(135deg,#5C3A1E,#2C1810)" }}>
          Practice with the Looper
        </Link>
        {song.capo ? null : (
          <Link href="/capo" className="rounded-full border border-border-warm bg-white px-5 py-2.5 text-sm font-semibold text-chestnut">
            Change the key
          </Link>
        )}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-border-warm bg-white px-3 py-1.5">
      <span className="text-[11px] text-muted">{label} </span>
      <span className="text-sm font-semibold text-espresso">{value}</span>
    </div>
  );
}
