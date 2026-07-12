export interface ChordShape {
  name: string;
  // 0-indexed string (0 = leftmost / low E), fret 1-3, finger 1-4
  dots: { s: number; fret: number; finger: number }[];
  open: number[]; // open string indices
  muted?: number[]; // muted string indices
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  kicker: string; // e.g. "Module 3 · Lesson 7"
  chord?: string; // key into CHORDS
  steps?: { title: string; body: string }[];
}

export interface Module {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

export const CHORDS: Record<string, ChordShape> = {
  G: {
    name: "G Major",
    dots: [
      { s: 0, fret: 3, finger: 2 },
      { s: 1, fret: 2, finger: 1 },
      { s: 4, fret: 2, finger: 3 },
      { s: 5, fret: 3, finger: 4 },
    ],
    open: [2, 3],
  },
  D: {
    name: "D Major",
    dots: [
      { s: 3, fret: 2, finger: 1 },
      { s: 5, fret: 2, finger: 2 },
      { s: 4, fret: 3, finger: 3 },
    ],
    open: [2],
    muted: [0, 1],
  },
  Em: {
    name: "E Minor",
    dots: [
      { s: 1, fret: 2, finger: 2 },
      { s: 2, fret: 2, finger: 3 },
    ],
    open: [0, 3, 4, 5],
  },
  C: {
    name: "C Major",
    dots: [
      { s: 1, fret: 3, finger: 3 },
      { s: 2, fret: 2, finger: 2 },
      { s: 4, fret: 1, finger: 1 },
    ],
    open: [3, 5],
    muted: [0],
  },
  Am: {
    name: "A Minor",
    dots: [
      { s: 2, fret: 2, finger: 2 },
      { s: 3, fret: 2, finger: 3 },
      { s: 1, fret: 1, finger: 1 },
    ],
    open: [4, 5],
    muted: [0],
  },
};

const gSteps = [
  { title: "Place your fingers", body: "Middle finger on the low E, 3rd fret. Index on the A string, 2nd fret." },
  { title: "Round your hand", body: "Keep the thumb behind the neck and let each finger press just behind the fret." },
  { title: "Strum all six", body: "Let every string ring. Check each note is clear and buzz-free." },
];

export const MODULES: Module[] = [
  {
    id: "m1",
    num: 1,
    title: "Foundations",
    subtitle: "Posture, hand position & first notes",
    lessons: [
      { id: "m1l1", title: "Holding the Guitar", subtitle: "Classical posture and the footstool", minutes: 8, kicker: "Module 1 · Lesson 1" },
      { id: "m1l2", title: "Naming the Strings", subtitle: "E A D G B E, low to high", minutes: 6, kicker: "Module 1 · Lesson 2" },
      { id: "m1l3", title: "Right-Hand Position", subtitle: "Thumb and fingers over the strings", minutes: 10, kicker: "Module 1 · Lesson 3" },
      { id: "m1l4", title: "Your First Notes", subtitle: "Playing on the top three strings", minutes: 12, kicker: "Module 1 · Lesson 4" },
    ],
  },
  {
    id: "m2",
    num: 2,
    title: "Rhythm & Strumming",
    subtitle: "Keeping time & worship strum patterns",
    lessons: [
      { id: "m2l1", title: "Feeling the Beat", subtitle: "Counting in 4/4 time", minutes: 8, kicker: "Module 2 · Lesson 1" },
      { id: "m2l2", title: "The Down Strum", subtitle: "Even quarter-note strums", minutes: 10, kicker: "Module 2 · Lesson 2" },
      { id: "m2l3", title: "Down-Up Patterns", subtitle: "Adding upstrokes for movement", minutes: 12, kicker: "Module 2 · Lesson 3" },
      { id: "m2l4", title: "The Worship Strum", subtitle: "A gentle pattern for ballads", minutes: 12, kicker: "Module 2 · Lesson 4" },
    ],
  },
  {
    id: "m3",
    num: 3,
    title: "Chord Shapes",
    subtitle: "Open chords, transitions & the capo",
    lessons: [
      { id: "m3l1", title: "Reading Chord Charts", subtitle: "Dots, fingers, and open strings", minutes: 7, kicker: "Module 3 · Lesson 1" },
      { id: "m3l2", title: "The E Minor Chord", subtitle: "Your first two-finger chord", minutes: 8, kicker: "Module 3 · Lesson 2", chord: "Em" },
      { id: "m3l3", title: "The G Major Chord", subtitle: "The most-used chord in worship music", minutes: 10, kicker: "Module 3 · Lesson 3", chord: "G", steps: gSteps },
      { id: "m3l4", title: "The D Major Chord", subtitle: "A bright, ringing shape", minutes: 8, kicker: "Module 3 · Lesson 4", chord: "D" },
      { id: "m3l5", title: "The C Major Chord", subtitle: "Reaching across the strings", minutes: 9, kicker: "Module 3 · Lesson 5", chord: "C" },
      { id: "m3l6", title: "Switching G to D", subtitle: "Smooth changes without stopping", minutes: 8, kicker: "Module 3 · Lesson 6" },
      { id: "m3l7", title: "Your First Worship Song", subtitle: "Putting the chords together", minutes: 12, kicker: "Module 3 · Lesson 7" },
    ],
  },
  {
    id: "m4",
    num: 4,
    title: "Lead & Melody",
    subtitle: "Scales, licks & playing the tune",
    lessons: [
      { id: "m4l1", title: "The Major Scale", subtitle: "The roadmap of melody", minutes: 12, kicker: "Module 4 · Lesson 1" },
      { id: "m4l2", title: "Playing a Hymn Melody", subtitle: "Be Thou My Vision, one note at a time", minutes: 14, kicker: "Module 4 · Lesson 2" },
      { id: "m4l3", title: "The Pentatonic Scale", subtitle: "Five notes for lead lines", minutes: 12, kicker: "Module 4 · Lesson 3" },
      { id: "m4l4", title: "Simple Improvisation", subtitle: "Phrasing over a worship progression", minutes: 15, kicker: "Module 4 · Lesson 4" },
    ],
  },
  {
    id: "m5",
    num: 5,
    title: "Leading Worship",
    subtitle: "Improvise, dynamics & leading a set",
    lessons: [
      { id: "m5l1", title: "Dynamics & Feel", subtitle: "When to build and when to rest", minutes: 12, kicker: "Module 5 · Lesson 1" },
      { id: "m5l2", title: "Leading from the Guitar", subtitle: "Cueing the band and the congregation", minutes: 14, kicker: "Module 5 · Lesson 2" },
      { id: "m5l3", title: "Spontaneous Worship", subtitle: "Playing in open, unscripted moments", minutes: 15, kicker: "Module 5 · Lesson 3" },
      { id: "m5l4", title: "Leading a Full Set", subtitle: "Planning and carrying a worship set", minutes: 18, kicker: "Module 5 · Lesson 4" },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons);

export function lessonById(id: string): { lesson: Lesson; module: Module } | null {
  for (const m of MODULES) {
    const l = m.lessons.find((x) => x.id === id);
    if (l) return { lesson: l, module: m };
  }
  return null;
}

export interface Song {
  title: string;
  key: string;
  difficulty: "Beginner" | "Intermediate";
  chords: number;
}

export const SONGS: Song[] = [
  { title: "Amazing Grace", key: "G", difficulty: "Beginner", chords: 4 },
  { title: "Be Thou My Vision", key: "D", difficulty: "Beginner", chords: 5 },
  { title: "Great Is Thy Faithfulness", key: "C", difficulty: "Intermediate", chords: 7 },
  { title: "Come Thou Fount", key: "G", difficulty: "Beginner", chords: 4 },
  { title: "In Christ Alone", key: "D", difficulty: "Intermediate", chords: 6 },
  { title: "How Great Thou Art", key: "G", difficulty: "Beginner", chords: 5 },
  { title: "10,000 Reasons", key: "G", difficulty: "Beginner", chords: 4 },
  { title: "Cornerstone", key: "C", difficulty: "Intermediate", chords: 6 },
];
