// ===== Chord shapes =====
// String index 0..5 = low E, A, D, G, B, high E.
// Frets are ABSOLUTE. baseFret is the top fret shown in the diagram window
// (1 = shows the nut). Barre chords use `barre`.

export interface ChordShape {
  name: string;
  baseFret?: number; // top of the 3-fret window; default 1
  dots: { s: number; fret: number; finger: number }[];
  barre?: { fret: number; from: number; to: number; finger: number };
  open: number[];
  muted?: number[];
}

export const CHORDS: Record<string, ChordShape> = {
  // --- Open majors ---
  G: { name: "G Major", dots: [{ s: 0, fret: 3, finger: 2 }, { s: 1, fret: 2, finger: 1 }, { s: 5, fret: 3, finger: 3 }], open: [2, 3, 4] },
  C: { name: "C Major", dots: [{ s: 1, fret: 3, finger: 3 }, { s: 2, fret: 2, finger: 2 }, { s: 4, fret: 1, finger: 1 }], open: [3, 5], muted: [0] },
  D: { name: "D Major", dots: [{ s: 3, fret: 2, finger: 1 }, { s: 5, fret: 2, finger: 2 }, { s: 4, fret: 3, finger: 3 }], open: [2], muted: [0, 1] },
  E: { name: "E Major", dots: [{ s: 1, fret: 2, finger: 2 }, { s: 2, fret: 2, finger: 3 }, { s: 3, fret: 1, finger: 1 }], open: [0, 4, 5] },
  A: { name: "A Major", dots: [{ s: 2, fret: 2, finger: 1 }, { s: 3, fret: 2, finger: 2 }, { s: 4, fret: 2, finger: 3 }], open: [1, 5], muted: [0] },
  // --- Open minors ---
  Em: { name: "E Minor", dots: [{ s: 1, fret: 2, finger: 2 }, { s: 2, fret: 2, finger: 3 }], open: [0, 3, 4, 5] },
  Am: { name: "A Minor", dots: [{ s: 2, fret: 2, finger: 2 }, { s: 3, fret: 2, finger: 3 }, { s: 4, fret: 1, finger: 1 }], open: [1, 5], muted: [0] },
  Dm: { name: "D Minor", dots: [{ s: 3, fret: 2, finger: 2 }, { s: 4, fret: 3, finger: 3 }, { s: 5, fret: 1, finger: 1 }], open: [2], muted: [0, 1] },
  // --- Sevenths ---
  G7: { name: "G7", dots: [{ s: 0, fret: 3, finger: 3 }, { s: 1, fret: 2, finger: 2 }, { s: 5, fret: 1, finger: 1 }], open: [2, 3, 4] },
  C7: { name: "C7", dots: [{ s: 1, fret: 3, finger: 3 }, { s: 2, fret: 2, finger: 2 }, { s: 3, fret: 3, finger: 4 }, { s: 4, fret: 1, finger: 1 }], open: [5], muted: [0] },
  D7: { name: "D7", dots: [{ s: 3, fret: 2, finger: 2 }, { s: 4, fret: 1, finger: 1 }, { s: 5, fret: 2, finger: 3 }], open: [2], muted: [0, 1] },
  A7: { name: "A7", dots: [{ s: 2, fret: 2, finger: 2 }, { s: 4, fret: 2, finger: 3 }], open: [1, 3, 5], muted: [0] },
  E7: { name: "E7", dots: [{ s: 1, fret: 2, finger: 2 }, { s: 3, fret: 1, finger: 1 }], open: [0, 2, 4, 5] },
  B7: { name: "B7", dots: [{ s: 1, fret: 2, finger: 2 }, { s: 2, fret: 1, finger: 1 }, { s: 3, fret: 2, finger: 3 }, { s: 5, fret: 2, finger: 4 }], open: [4], muted: [0] },
  Em7: { name: "E Minor 7", dots: [{ s: 1, fret: 2, finger: 2 }, { s: 2, fret: 2, finger: 3 }, { s: 4, fret: 3, finger: 4 }], open: [0, 3, 5] },
  // --- Color & sus ---
  Cadd9: { name: "C add9", dots: [{ s: 1, fret: 3, finger: 2 }, { s: 2, fret: 2, finger: 1 }, { s: 4, fret: 3, finger: 3 }], open: [3, 5], muted: [0] },
  "G/B": { name: "G / B", dots: [{ s: 1, fret: 2, finger: 2 }, { s: 5, fret: 3, finger: 3 }], open: [2, 3, 4], muted: [0] },
  // Fingered 1-3-4 so index & ring stay anchored from D major and the pinky
  // adds/removes the sus note — the classic D → Dsus4 → D worship move.
  Dsus4: { name: "D sus4", dots: [{ s: 3, fret: 2, finger: 1 }, { s: 4, fret: 3, finger: 3 }, { s: 5, fret: 3, finger: 4 }], open: [2], muted: [0, 1] },
  Asus4: { name: "A sus4", dots: [{ s: 2, fret: 2, finger: 1 }, { s: 3, fret: 2, finger: 2 }, { s: 4, fret: 3, finger: 3 }], open: [1, 5], muted: [0] },
  // --- Barre chords ---
  F: { name: "F Major", barre: { fret: 1, from: 0, to: 5, finger: 1 }, dots: [{ s: 1, fret: 3, finger: 3 }, { s: 2, fret: 3, finger: 4 }, { s: 3, fret: 2, finger: 2 }], open: [] },
  Bm: { name: "B Minor", baseFret: 2, barre: { fret: 2, from: 1, to: 5, finger: 1 }, dots: [{ s: 2, fret: 4, finger: 3 }, { s: 3, fret: 4, finger: 4 }, { s: 4, fret: 3, finger: 2 }], open: [], muted: [0] },
  B: { name: "B Major", baseFret: 2, barre: { fret: 2, from: 1, to: 5, finger: 1 }, dots: [{ s: 2, fret: 4, finger: 2 }, { s: 3, fret: 4, finger: 3 }, { s: 4, fret: 4, finger: 4 }], open: [], muted: [0] },
  "F#m": { name: "F# Minor", baseFret: 2, barre: { fret: 2, from: 0, to: 5, finger: 1 }, dots: [{ s: 1, fret: 4, finger: 3 }, { s: 2, fret: 4, finger: 4 }], open: [] },
};

// Display groups for the Chord Library page.
export const CHORD_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Open Majors", keys: ["G", "C", "D", "E", "A"] },
  { label: "Open Minors", keys: ["Em", "Am", "Dm"] },
  { label: "Sevenths", keys: ["G7", "C7", "D7", "A7", "E7", "B7", "Em7"] },
  { label: "Color & Sus", keys: ["Cadd9", "G/B", "Dsus4", "Asus4"] },
  { label: "Barre Chords", keys: ["F", "Bm", "B", "F#m"] },
];
