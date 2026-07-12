// Small music-theory helper shared by the Capo/Transposer and Progression Looper.

export const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const ALIAS: Record<string, number> = {
  C: 0, "C#": 1, DB: 1, D: 2, "D#": 3, EB: 3, E: 4, F: 5, "F#": 6, GB: 6,
  G: 7, "G#": 8, AB: 8, A: 9, "A#": 10, BB: 10, B: 11,
};

export function pitchOf(name: string): number | null {
  const p = ALIAS[name.trim().toUpperCase()];
  return p === undefined ? null : p;
}

// Keys that read more naturally with flats.
const FLAT_KEYS = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb", "Dm", "Gm", "Cm", "Fm", "Bbm", "Ebm"]);
export function preferFlat(key: string): boolean {
  return FLAT_KEYS.has(key);
}

export function noteName(pitch: number, flat = false): string {
  const idx = ((pitch % 12) + 12) % 12;
  return (flat ? FLAT : SHARP)[idx];
}

// Major-key diatonic chords (1–7).
const DEGREE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
const DEGREE_QUALITY = ["", "m", "m", "", "", "m", "dim"];

export interface DiatonicChord {
  degree: number; // 1-7
  root: number; // pitch class
  quality: string; // "", "m", "dim"
  name: string; // e.g. "Em"
}

export function majorKeyChords(keyRoot: number, flat: boolean): DiatonicChord[] {
  return DEGREE_SEMITONES.map((semi, i) => {
    const root = (keyRoot + semi) % 12;
    return { degree: i + 1, root, quality: DEGREE_QUALITY[i], name: noteName(root, flat) + DEGREE_QUALITY[i] };
  });
}

// Chord tone pitch classes for a triad, given a root and quality.
export function triadTones(root: number, quality: string): number[] {
  const third = quality === "m" || quality === "dim" ? 3 : 4;
  const fifth = quality === "dim" ? 6 : 7;
  return [root, (root + third) % 12, (root + fifth) % 12];
}

// Convert a pitch class to a frequency in a given octave (4 = middle).
export function pitchToFreq(pitch: number, octave = 3): number {
  const midi = pitch + 12 * (octave + 1); // C-1 = 0
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export const MAJOR_KEYS = ["C", "G", "D", "A", "E", "F", "Bb", "Eb"];

// Common worship progressions expressed as scale degrees.
export const PROGRESSIONS: { label: string; degrees: number[] }[] = [
  { label: "1 · 5 · 6 · 4", degrees: [1, 5, 6, 4] },
  { label: "1 · 4 · 6 · 5", degrees: [1, 4, 6, 5] },
  { label: "6 · 4 · 1 · 5", degrees: [6, 4, 1, 5] },
  { label: "1 · 6 · 4 · 5", degrees: [1, 6, 4, 5] },
  { label: "1 · 4 (vamp)", degrees: [1, 4] },
  { label: "1 · 5 · 6 · 3 · 4 · 1 · 4 · 5", degrees: [1, 5, 6, 3, 4, 1, 4, 5] },
];

// Open-chord "shape families" for the capo finder (sounding pitch of each open key).
export const SHAPE_FAMILIES = ["C", "A", "G", "E", "D"];
