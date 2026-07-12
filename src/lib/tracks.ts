// Practice-track definitions: synthesized modern-worship backing tracks.
// Drum & bass patterns are per-bar beat offsets (0 = beat 1).

export type TrackStyle = "ballad" | "driving" | "anthem" | "waltz" | "sixEight" | "pad";

export interface PracticeTrack {
  id: string;
  title: string;
  vibe: string;
  practiceGoal: string;
  style: TrackStyle;
  beatsPerBar: 3 | 4 | 6;
  bpm: number;
  minBpm: number;
  maxBpm: number;
  key: string;
  degrees: number[]; // one chord per bar
}

export const TRACKS: PracticeTrack[] = [
  {
    id: "still-waters",
    title: "Still Waters",
    vibe: "Gentle ballad · pad, soft drums & bass",
    practiceGoal: "Driving eighths and the worship strum at a slow tempo — swell without speeding.",
    style: "ballad",
    beatsPerBar: 4,
    bpm: 68, minBpm: 56, maxBpm: 80,
    key: "G",
    degrees: [1, 5, 6, 4],
  },
  {
    id: "deep-calls",
    title: "Deep Calls",
    vibe: "Flowing 6/8 · rolling and intimate",
    practiceGoal: "Let your strum roll in two groups of three — the compound feel behind many modern ballads.",
    style: "sixEight",
    beatsPerBar: 6,
    bpm: 66, minBpm: 54, maxBpm: 78,
    key: "D",
    degrees: [6, 4, 1, 5],
  },
  {
    id: "ever-faithful",
    title: "Ever Faithful",
    vibe: "Mid-tempo build · steady backbeat",
    practiceGoal: "Practice pushes on the chord changes and muted chucks on beats 2 and 4.",
    style: "driving",
    beatsPerBar: 4,
    bpm: 84, minBpm: 72, maxBpm: 96,
    key: "A",
    degrees: [1, 4, 6, 5],
  },
  {
    id: "risen-king",
    title: "Risen King",
    vibe: "Fast anthem · four on the floor",
    practiceGoal: "Simplify at speed: solid down-strums on the beat, pushes only at section changes.",
    style: "anthem",
    beatsPerBar: 4,
    bpm: 126, minBpm: 108, maxBpm: 140,
    key: "E",
    degrees: [1, 5, 6, 4],
  },
  {
    id: "holy-ground",
    title: "Holy Ground",
    vibe: "Spontaneous pad · no drums",
    practiceGoal: "Open worship over a 1-4 vamp: fingerpick, rest, respond. Rotate your textures.",
    style: "pad",
    beatsPerBar: 4,
    bpm: 63, minBpm: 50, maxBpm: 72,
    key: "D",
    degrees: [1, 4],
  },
  {
    id: "morning-mercy",
    title: "Morning Mercy",
    vibe: "Waltz hymn · brushed 3/4",
    practiceGoal: "Bass-strum-strum over a live rhythm section — take the hymns beyond the metronome.",
    style: "waltz",
    beatsPerBar: 3,
    bpm: 72, minBpm: 60, maxBpm: 88,
    key: "G",
    degrees: [1, 4, 1, 5],
  },
];

export interface DrumPattern {
  kick: number[];
  snare: number[];
  snareGain?: number;
  hats: number[]; // beat offsets
  hatGain?: number;
}

// Per-bar patterns in beat offsets. Hats arrays are generated for readability.
const eighths = (beats: number) => Array.from({ length: beats * 2 }, (_, i) => i / 2);
const quarters = (beats: number) => Array.from({ length: beats }, (_, i) => i);

export const DRUM_PATTERNS: Record<TrackStyle, DrumPattern | null> = {
  ballad: { kick: [0, 2.5], snare: [2], snareGain: 0.28, hats: eighths(4), hatGain: 0.09 },
  driving: { kick: [0, 1.5, 2.5], snare: [1, 3], snareGain: 0.38, hats: eighths(4), hatGain: 0.12 },
  anthem: { kick: [0, 1, 2, 3], snare: [1, 3], snareGain: 0.42, hats: eighths(4), hatGain: 0.13 },
  waltz: { kick: [0], snare: [1, 2], snareGain: 0.14, hats: quarters(3), hatGain: 0.08 },
  sixEight: { kick: [0], snare: [3], snareGain: 0.3, hats: quarters(6), hatGain: 0.1 },
  pad: null,
};

export const BASS_PATTERNS: Record<TrackStyle, number[]> = {
  ballad: [0],
  driving: [0, 2.5],
  anthem: [0, 1, 2, 3],
  waltz: [0],
  sixEight: [0, 3],
  pad: [0],
};

export function trackById(id: string): PracticeTrack | undefined {
  return TRACKS.find((t) => t.id === id);
}
