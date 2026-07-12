"use client";

import { useState } from "react";
import Link from "next/link";

type Level = "beginner" | "intermediate" | "advanced";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: "technique" | "theory" | "worship" | "practice";
}

const curriculum: Record<Level, { title: string; description: string; lessons: Lesson[] }> = {
  beginner: {
    title: "Beginner's Path",
    description: "From holding the guitar to playing your first worship song.",
    lessons: [
      { id: "b1", title: "The Guitar & You", description: "Posture, hand position, and the classical approach", duration: "15 min", type: "technique" },
      { id: "b2", title: "Reading Music", description: "Staff notation basics — notes on the first three strings", duration: "20 min", type: "theory" },
      { id: "b3", title: "Open Chords", description: "Em, Am, C, G, D — the foundation of worship keys", duration: "25 min", type: "technique" },
      { id: "b4", title: "Your First Song", description: "Play 'Amazing Grace' with simple chords", duration: "20 min", type: "worship" },
      { id: "b5", title: "Right Hand Patterns", description: "Alternating bass and simple fingerpicking", duration: "20 min", type: "technique" },
      { id: "b6", title: "Rhythm Foundations", description: "Whole, half, and quarter notes in worship context", duration: "15 min", type: "theory" },
      { id: "b7", title: "Key of G", description: "Playing in the most common worship key", duration: "20 min", type: "worship" },
      { id: "b8", title: "Key of D", description: "Expanding your key vocabulary", duration: "20 min", type: "worship" },
      { id: "b9", title: "Barre Chord Intro", description: "F major and B minor — unlocking the full neck", duration: "25 min", type: "technique" },
      { id: "b10", title: "Simple Hymns", description: "3 classic hymns with chord charts", duration: "30 min", type: "worship" },
      { id: "b11", title: "Practice Routine", description: "Building a daily 15-minute habit", duration: "10 min", type: "practice" },
      { id: "b12", title: "Playing with Others", description: "Following a worship leader, dynamics, and listening", duration: "15 min", type: "worship" },
    ],
  },
  intermediate: {
    title: "Rhythm & Foundation",
    description: "Strengthen your chord vocabulary and rhythmic foundation for leading worship.",
    lessons: [
      { id: "i1", title: "Chord Shapes Everywhere", description: "CAGED system — same chord, five positions", duration: "30 min", type: "technique" },
      { id: "i2", title: "Strumming Dynamics", description: "Soft to loud — building and releasing in worship", duration: "20 min", type: "technique" },
      { id: "i3", title: "Intervals & Harmony", description: "Understanding how notes relate and why chords work", duration: "25 min", type: "theory" },
      { id: "i4", title: "Fingerpicking Patterns", description: "Travis picking and arpeggiated worship patterns", duration: "30 min", type: "technique" },
      { id: "i5", title: "Keys & Transposition", description: "Moving songs to fit vocalists", duration: "20 min", type: "theory" },
      { id: "i6", title: "The Nashville Number System", description: "How worship teams communicate chord changes", duration: "20 min", type: "theory" },
      { id: "i7", title: "Capo Mastery", description: "Strategic capo use for voicing and tone", duration: "15 min", type: "technique" },
      { id: "i8", title: "Worship Medley", description: "Transitioning between songs seamlessly", duration: "25 min", type: "worship" },
      { id: "i9", title: "Syncopation & Groove", description: "Rhythmic feel that moves a congregation", duration: "25 min", type: "technique" },
      { id: "i10", title: "Chord Extensions", description: "7ths, sus2, sus4, add9 — color in worship", duration: "25 min", type: "theory" },
      { id: "i11", title: "Leading from Guitar", description: "Cueing the band, setting tempo, signaling changes", duration: "20 min", type: "worship" },
      { id: "i12", title: "Song Arrangement", description: "Structuring a worship set from guitar", duration: "25 min", type: "worship" },
      { id: "i13", title: "Contemporary Worship Songs", description: "5 modern worship songs with full arrangements", duration: "35 min", type: "worship" },
      { id: "i14", title: "Classical Technique Check", description: "Refining tone, nails, and right-hand mechanics", duration: "20 min", type: "technique" },
      { id: "i15", title: "Playing Over Changes", description: "Connecting chords with passing tones", duration: "25 min", type: "technique" },
      { id: "i16", title: "Intermediate Review", description: "Assessment and next steps toward lead playing", duration: "20 min", type: "practice" },
    ],
  },
  advanced: {
    title: "Lead Guitar for Worship",
    description: "Develop melodic, lead-driven worship guitar — scales, improvisation, and musical leadership.",
    lessons: [
      { id: "a1", title: "The Major Scale (All Positions)", description: "Full neck mastery of the major scale", duration: "30 min", type: "technique" },
      { id: "a2", title: "Minor Scales & Modes", description: "Natural minor, Dorian, Mixolydian for worship", duration: "30 min", type: "theory" },
      { id: "a3", title: "Pentatonic Fluency", description: "Five positions connected — the lead guitarist's bread and butter", duration: "30 min", type: "technique" },
      { id: "a4", title: "Melodic Playing", description: "Playing the melody of a hymn as a lead line", duration: "25 min", type: "technique" },
      { id: "a5", title: "Arpeggios as Lead Tools", description: "Major, minor, and diminished arpeggios across the neck", duration: "30 min", type: "technique" },
      { id: "a6", title: "Improvisation Foundations", description: "Target notes, phrasing, and musical storytelling", duration: "30 min", type: "technique" },
      { id: "a7", title: "Worship Intros & Outros", description: "Crafting beautiful openings and closings from guitar", duration: "25 min", type: "worship" },
      { id: "a8", title: "Harmonics & Texture", description: "Natural and artificial harmonics for atmosphere", duration: "20 min", type: "technique" },
      { id: "a9", title: "Countermelody", description: "Playing complementary lines over rhythm guitar", duration: "25 min", type: "technique" },
      { id: "a10", title: "Dynamics of Leading", description: "When to play, when to rest — serving the moment", duration: "20 min", type: "worship" },
      { id: "a11", title: "Classical Repertoire for Worship", description: "Bach, Sor, and Tárrega pieces adapted for services", duration: "35 min", type: "worship" },
      { id: "a12", title: "Advanced Fingerstyle", description: "Tremolo, rasgueado, and expressive techniques", duration: "30 min", type: "technique" },
      { id: "a13", title: "Modal Interchange", description: "Borrowing from parallel keys for emotional depth", duration: "25 min", type: "theory" },
      { id: "a14", title: "Spontaneous Worship", description: "Improvising over pads and open worship moments", duration: "30 min", type: "worship" },
      { id: "a15", title: "Tone & Equipment", description: "Getting your best sound — nylon string in a worship mix", duration: "20 min", type: "technique" },
      { id: "a16", title: "Arranging for Solo Guitar", description: "Bass, melody, and harmony — one guitar, full sound", duration: "35 min", type: "technique" },
      { id: "a17", title: "Worship Team Integration", description: "Communication, charts, and serving the vision", duration: "20 min", type: "worship" },
      { id: "a18", title: "Performance & Nerves", description: "Playing with confidence and spiritual focus", duration: "15 min", type: "practice" },
      { id: "a19", title: "Building Your Own Curriculum", description: "Continuing growth beyond this course", duration: "20 min", type: "practice" },
      { id: "a20", title: "Capstone: Lead a Worship Set", description: "Plan, arrange, and lead a full set from classical guitar", duration: "45 min", type: "worship" },
    ],
  },
};

const typeColors: Record<string, string> = {
  technique: "bg-blue-500/10 text-blue-400",
  theory: "bg-purple-500/10 text-purple-400",
  worship: "bg-gold/10 text-gold",
  practice: "bg-green-500/10 text-green-400",
};

export default function CurriculumPage() {
  const [activeLevel, setActiveLevel] = useState<Level>("beginner");
  const data = curriculum[activeLevel];

  return (
    <div className="px-4 py-8 lg:px-12 lg:py-12">
      <h1 className="font-[var(--font-playfair)] text-2xl lg:text-4xl font-bold mb-2">
        Curriculum
      </h1>
      <p className="text-warm-gray mb-8">
        A structured path from first notes to leading worship.
      </p>

      {/* Level Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {(Object.keys(curriculum) as Level[]).map((level) => (
          <button
            key={level}
            onClick={() => setActiveLevel(level)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeLevel === level
                ? "bg-gold text-navy"
                : "bg-navy/50 text-gray-300 hover:bg-navy"
            }`}
          >
            {curriculum[level].title}
          </button>
        ))}
      </div>

      {/* Current Level */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{data.title}</h2>
        <p className="text-sm text-warm-gray">{data.description}</p>
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {data.lessons.map((lesson, index) => (
          <Link
            key={lesson.id}
            href={`/curriculum/${lesson.id}`}
            className="group block rounded-lg border border-gold/10 p-4 transition-all hover:border-gold/30 hover:bg-navy/30"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-medium text-gold">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium group-hover:text-gold transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-sm text-warm-gray mt-1">{lesson.description}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[lesson.type]}`}>
                  {lesson.type}
                </span>
                <span className="text-xs text-warm-gray">{lesson.duration}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
