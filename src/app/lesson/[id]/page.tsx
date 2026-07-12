"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { lessonById, ALL_LESSONS, CHORDS } from "@/lib/curriculum";
import { majorKeyChords, pitchOf, preferFlat, triadTones, pitchToFreq, chordVoicing, midiToFreq } from "@/lib/music";
import { armAudio, unlockAudio, strum } from "@/lib/audio";
import ChordDiagram from "@/components/ChordDiagram";

const MODES = ["Learn", "Practice", "Play Along"] as const;

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [mode, setMode] = useState<(typeof MODES)[number]>("Learn");
  const [saving, setSaving] = useState(false);
  const [activeChord, setActiveChord] = useState<number | null>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    armAudio();
    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  const id = String(params.id);
  const found = lessonById(id);

  if (!found) {
    return (
      <div className="mx-auto max-w-2xl px-5 pt-24 text-center">
        <p className="font-display text-2xl text-espresso">Lesson not found</p>
        <Link href="/journey" className="mt-4 inline-block text-bronze">← Back to your journey</Link>
      </div>
    );
  }

  const { lesson } = found;
  const chord = lesson.chord ? CHORDS[lesson.chord] : null;
  const idx = ALL_LESSONS.findIndex((l) => l.id === id);
  const nextLesson = ALL_LESSONS[idx + 1];

  // Resolve a progression (key + scale degrees) into chord objects for playback.
  const progChords = lesson.progression
    ? lesson.progression.degrees.map((deg) => {
        const root = pitchOf(lesson.progression!.key) ?? 7;
        return majorKeyChords(root, preferFlat(lesson.progression!.key))[deg - 1];
      })
    : [];

  const playProgression = async () => {
    await unlockAudio();
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    progChords.forEach((c, i) => {
      const t = setTimeout(() => {
        const tones = triadTones(c.root, c.quality);
        const freqs = tones.map((tt) => pitchToFreq(tt, 3));
        freqs.push(pitchToFreq(c.root, 4));
        strum(freqs);
        setActiveChord(i);
      }, i * 1400);
      timeouts.current.push(t);
    });
    timeouts.current.push(setTimeout(() => setActiveChord(null), progChords.length * 1400));
  };

  const markComplete = async () => {
    setSaving(true);
    try {
      if (isSignedIn) {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "completeLesson", id: lesson.id, minutes: lesson.minutes }),
        });
      }
    } finally {
      setSaving(false);
      router.push(nextLesson ? `/lesson/${nextLesson.id}` : "/journey");
    }
  };

  return (
    <div className="min-h-screen">
      {/* practice hero */}
      <div className="px-5 pb-7 pt-16 lg:px-10 lg:pt-14" style={{ background: "radial-gradient(circle at 50% 40%,#4A2E18 0%,#2C1810 60%,#1A0E08 100%)" }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/journey" className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,.1)" }}>
            <svg width="9" height="15" viewBox="0 0 9 15"><path d="M7 1L1.5 7.5 7 14" stroke="#F5E6D0" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <span className="kicker text-[11px] text-amber">{lesson.kicker}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,.1)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2C8 2 4 5 4 9a4 4 0 008 0c0-2-1.5-3-1.5-5-.8.8-1.5 1.2-1.5 3-1 0-1-1.5 0-3z" fill="#C89B5C" /></svg>
          </span>
        </div>
        <div className="mx-auto mt-2 flex max-w-3xl flex-col items-center">
          {chord ? (
            <button onClick={async () => { await unlockAudio(); strum(chordVoicing(chord).map(midiToFreq)); }} aria-label="Hear the chord">
              <ChordDiagram chord={chord} width={140} />
            </button>
          ) : (
            <div className="flex h-[150px] items-center justify-center">
              <span className="font-display text-[64px] text-[#6b4a2e]">♪</span>
            </div>
          )}
          <h1 className="mt-1 text-center font-display text-[30px] font-semibold leading-none text-cream lg:text-[40px]">{lesson.title}</h1>
          <p className="mt-1.5 text-center text-[13px] text-[#c9b49a] lg:text-[15px]">{lesson.subtitle}</p>
          {chord && <p className="mt-2 text-[11px] text-amber">tap the chord to hear it</p>}
        </div>
      </div>

      {/* segmented control */}
      <div className="mx-auto max-w-3xl px-5 lg:px-10">
        <div className="mt-4 flex gap-1.5 rounded-[12px] p-1" style={{ background: "#EDE0CB" }}>
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 rounded-[9px] py-2 text-center text-[13px] transition-colors"
              style={mode === m ? { background: "#fff", color: "#5C3A1E", fontWeight: 700, boxShadow: "0 1px 3px rgba(92,58,30,.1)" } : { color: "#8B7355", fontWeight: 600 }}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="pb-32 pt-6">
          {/* objective */}
          <p className="mb-6 rounded-[12px] border border-border-warm bg-white p-4 text-sm text-cocoa">
            <span className="kicker mr-2 text-[10px] text-bronze">Goal</span>
            {lesson.objective}
          </p>

          {mode === "Learn" && (
            <>
              <h2 className="mb-5 font-display text-[22px] font-semibold text-espresso">How to play it</h2>
              {lesson.learn.map((s, i) => (
                <div key={i} className="mb-5 flex gap-3.5">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold" style={{ background: "#5C3A1E", color: "#F5E6D0" }}>{i + 1}</span>
                  <div>
                    <div className="text-[15px] font-semibold text-espresso">{s.title}</div>
                    <div className="mt-0.5 text-[13px] leading-relaxed text-muted">{s.body}</div>
                  </div>
                </div>
              ))}
              {lesson.tip && (
                <div className="mt-2 rounded-[14px] p-4" style={{ background: "linear-gradient(155deg,#F3E7D4,#EFE0C9)", border: "1px solid #E5D8C0" }}>
                  <span className="kicker mr-2 text-[10px] text-bronze">Tip</span>
                  <span className="text-sm text-cocoa">{lesson.tip}</span>
                </div>
              )}
            </>
          )}

          {mode === "Practice" && (
            <>
              <h2 className="mb-5 font-display text-[22px] font-semibold text-espresso">Practice it</h2>
              {lesson.practice.map((p, i) => (
                <div key={i} className="mb-4 flex gap-3.5">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold" style={{ background: "#B8834A", color: "#F5E6D0" }}>{i + 1}</span>
                  <p className="text-[14px] leading-relaxed text-espresso">{p}</p>
                </div>
              ))}
              <Link href="/metronome" className="mt-2 flex items-center gap-3 rounded-[14px] border border-border-warm-2 p-4" style={{ background: "#F3E7D4" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#B8834A" strokeWidth="1.6" /><path d="M12 12V6M12 12l4 3" stroke="#5C3A1E" strokeWidth="1.6" strokeLinecap="round" /></svg>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#3D2B1F]">Practice with the metronome</div>
                  <div className="text-xs text-muted">Start slow and stay steady</div>
                </div>
                <span className="text-[13px] font-bold text-bronze">Open</span>
              </Link>
            </>
          )}

          {mode === "Play Along" && (
            <>
              <h2 className="mb-4 font-display text-[22px] font-semibold text-espresso">Play along</h2>
              <p className="mb-5 text-sm leading-relaxed text-muted">{lesson.playAlong}</p>
              {progChords.length > 0 && (
                <div className="rounded-[16px] p-5 text-center text-cream" style={{ background: "radial-gradient(circle at 50% 38%,#4A2E18 0%,#2C1810 60%,#1A0E08 100%)" }}>
                  <div className="mb-4 flex flex-wrap justify-center gap-2">
                    {progChords.map((c, i) => (
                      <span key={i} className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-lg font-semibold transition-all"
                        style={activeChord === i ? { background: "#D4A96A", color: "#2C1810", transform: "scale(1.1)" } : { background: "rgba(255,255,255,.08)", color: "#F5E6D0" }}>
                        {c.name}
                      </span>
                    ))}
                  </div>
                  <button onClick={playProgression} className="rounded-full px-8 py-2.5 text-sm font-bold text-espresso" style={{ background: "#D4A96A" }}>
                    Play the progression
                  </button>
                  <p className="mt-3 text-[11px] text-[#c9b49a]">Then open the Looper to play it on a loop</p>
                </div>
              )}
              <Link href="/looper" className="mt-4 inline-block text-sm font-semibold text-bronze">Open the Progression Looper →</Link>
            </>
          )}
        </div>
      </div>

      {/* sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 px-5 pb-24 pt-4 lg:pb-6 lg:pl-72 lg:pr-10" style={{ background: "linear-gradient(180deg,rgba(250,244,234,0),#FAF4EA 40%)" }}>
        <div className="mx-auto max-w-3xl">
          <button
            onClick={markComplete}
            disabled={saving}
            className="w-full rounded-[16px] py-4 text-center text-base font-bold text-cream disabled:opacity-70"
            style={{ background: "linear-gradient(135deg,#5C3A1E,#2C1810)", boxShadow: "0 10px 24px rgba(44,24,16,.3)" }}
          >
            {saving ? "Saving…" : nextLesson ? "Mark Complete & Continue" : "Mark Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
