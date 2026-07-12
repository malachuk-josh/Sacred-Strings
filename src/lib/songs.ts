// Song charts for the library. Chord charts + structure only — we do not
// reproduce lyrics of copyrighted songs. Public-domain hymns include a first line.

export interface SongSection {
  name: string;
  chords: string[]; // chord names in order (keys into CHORDS where a diagram exists)
}

export interface Song {
  id: string;
  title: string;
  author: string;
  key: string;
  capo?: number;
  tempo: number;
  feel: string;
  difficulty: "Beginner" | "Intermediate";
  chords: string[]; // unique chords used
  sections: SongSection[];
  strum: string;
  publicDomain: boolean;
  firstLine?: string; // only for public-domain hymns
  note?: string;
}

export const SONGS: Song[] = [
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    author: "John Newton, 1779",
    key: "G",
    tempo: 72,
    feel: "3/4 · flowing",
    difficulty: "Beginner",
    chords: ["G", "C", "D"],
    sections: [
      { name: "Verse", chords: ["G", "G", "C", "G", "G", "D", "G", "D", "G", "C", "G", "D", "G"] },
    ],
    strum: "Gentle 3/4: one down-strum per beat, a little fuller on beat 1.",
    publicDomain: true,
    firstLine: "Amazing grace, how sweet the sound…",
    note: "A perfect first song — only three chords, and the 3/4 waltz feel is forgiving.",
  },
  {
    id: "be-thou-my-vision",
    title: "Be Thou My Vision",
    author: "Ancient Irish, tr. Eleanor Hull",
    key: "D",
    tempo: 84,
    feel: "3/4 · flowing",
    difficulty: "Beginner",
    chords: ["D", "G", "A", "Em", "Bm"],
    sections: [
      { name: "Verse", chords: ["D", "G", "D", "Em", "A", "D", "G", "D", "Bm", "A", "D", "G", "A", "D"] },
    ],
    strum: "3/4 waltz. Let each chord ring for a full bar.",
    publicDomain: true,
    firstLine: "Be Thou my vision, O Lord of my heart…",
  },
  {
    id: "come-thou-fount",
    title: "Come Thou Fount of Every Blessing",
    author: "Robert Robinson, 1758",
    key: "G",
    tempo: 76,
    feel: "4/4 · flowing",
    difficulty: "Beginner",
    chords: ["G", "C", "D", "Em", "Am"],
    sections: [
      { name: "Verse", chords: ["G", "D", "G", "C", "G", "D", "G"] },
      { name: "Refrain", chords: ["Em", "Am", "D", "G", "C", "G", "D", "G"] },
    ],
    strum: "Steady 4/4 with the worship strum. Build slightly through each verse.",
    publicDomain: true,
    firstLine: "Come Thou Fount of every blessing…",
  },
  {
    id: "great-is-thy-faithfulness",
    title: "Great Is Thy Faithfulness",
    author: "Thomas Chisholm, 1923",
    key: "C",
    tempo: 80,
    feel: "3/4 · flowing",
    difficulty: "Intermediate",
    chords: ["C", "F", "G", "Am", "Dm"],
    sections: [
      { name: "Verse", chords: ["C", "F", "C", "G", "C", "F", "Am", "Dm", "G", "C"] },
      { name: "Chorus", chords: ["C", "F", "C", "G", "C", "F", "G", "C"] },
    ],
    strum: "3/4. The F chord is a barre — keep the others smooth so it has time to land.",
    publicDomain: true,
    firstLine: "Great is Thy faithfulness, O God my Father…",
    note: "A good step up: it uses the F barre chord and a couple of minor chords.",
  },
  {
    id: "holy-holy-holy",
    title: "Holy, Holy, Holy",
    author: "Reginald Heber, 1826",
    key: "D",
    tempo: 88,
    feel: "4/4 · stately",
    difficulty: "Beginner",
    chords: ["D", "G", "A", "Bm"],
    sections: [
      { name: "Verse", chords: ["D", "G", "D", "A", "D", "G", "D", "A", "D", "Bm", "G", "D", "A", "D"] },
    ],
    strum: "Strong, even down-strums — this hymn stands tall.",
    publicDomain: true,
    firstLine: "Holy, holy, holy, Lord God Almighty…",
  },
  {
    id: "it-is-well",
    title: "It Is Well With My Soul",
    author: "Horatio Spafford, 1873",
    key: "C",
    tempo: 76,
    feel: "4/4 · flowing",
    difficulty: "Intermediate",
    chords: ["C", "F", "G", "Am"],
    sections: [
      { name: "Verse", chords: ["C", "F", "C", "G", "C", "F", "C", "G", "C"] },
      { name: "Chorus", chords: ["C", "G", "C", "F", "C", "G", "C"] },
    ],
    strum: "Gentle worship strum in the verse, fuller in the chorus.",
    publicDomain: true,
    firstLine: "When peace like a river attendeth my way…",
  },
  {
    id: "crown-him",
    title: "Crown Him with Many Crowns",
    author: "Matthew Bridges, 1851",
    key: "D",
    tempo: 92,
    feel: "4/4 · triumphant",
    difficulty: "Intermediate",
    chords: ["D", "A", "G", "Bm", "Em"],
    sections: [
      { name: "Verse", chords: ["D", "A", "D", "G", "D", "Bm", "Em", "A", "D"] },
    ],
    strum: "Bold and celebratory — full six-string strums.",
    publicDomain: true,
    firstLine: "Crown Him with many crowns…",
  },
  {
    id: "doxology",
    title: "Doxology (Praise God From Whom All Blessings Flow)",
    author: "Thomas Ken, 1674",
    key: "G",
    tempo: 80,
    feel: "4/4 · stately",
    difficulty: "Beginner",
    chords: ["G", "C", "D", "Em"],
    sections: [
      { name: "Verse", chords: ["G", "C", "G", "D", "G", "C", "Em", "D", "G"] },
    ],
    strum: "One clear chord per beat. A beautiful way to open or close a set.",
    publicDomain: true,
    firstLine: "Praise God from whom all blessings flow…",
  },
  // --- Modern worship: chord charts only (no lyrics) ---
  {
    id: "10000-reasons",
    title: "10,000 Reasons (Bless the Lord)",
    author: "Matt Redman & Jonas Myrin",
    key: "G",
    tempo: 73,
    feel: "4/4 · flowing",
    difficulty: "Beginner",
    chords: ["G", "D", "Em", "C"],
    sections: [
      { name: "Chorus", chords: ["C", "G", "D", "Em", "C", "G", "D"] },
      { name: "Verse", chords: ["C", "G", "D", "C", "G", "D"] },
    ],
    strum: "Classic worship strum. The whole song lives in these four chords.",
    publicDomain: false,
    note: "Chord chart only. The chorus is essentially a 1-5-6-4 loop — try it with the Progression Looper first.",
  },
  {
    id: "what-a-beautiful-name",
    title: "What a Beautiful Name",
    author: "Ben Fielding & Brooke Ligertwood",
    key: "D",
    tempo: 68,
    feel: "4/4 · flowing",
    difficulty: "Beginner",
    chords: ["D", "A", "Bm", "G"],
    sections: [
      { name: "Verse / Chorus", chords: ["D", "A", "Bm", "G"] },
    ],
    strum: "A gentle 1-5-6-4 loop (D-A-Bm-G). Fingerpick the verses, strum the chorus.",
    publicDomain: false,
    note: "Chord chart only. Uses the Bm barre chord — practice it in the Chord Library.",
  },
  {
    id: "in-christ-alone",
    title: "In Christ Alone",
    author: "Keith Getty & Stuart Townend",
    key: "D",
    tempo: 72,
    feel: "4/4 · building",
    difficulty: "Intermediate",
    chords: ["D", "A", "Bm", "G", "Em"],
    sections: [
      { name: "Verse", chords: ["D", "A", "Bm", "G", "D", "A", "D"] },
      { name: "Build", chords: ["G", "D", "A", "Bm", "G", "A", "D"] },
    ],
    strum: "Start simple and let it build verse by verse to a full, driving strum.",
    publicDomain: false,
    note: "Chord chart only. A modern hymn — great for practising steady chord changes.",
  },
  {
    id: "cornerstone",
    title: "Cornerstone",
    author: "Hillsong (based on 'The Solid Rock')",
    key: "C",
    tempo: 72,
    feel: "4/4 · building",
    difficulty: "Intermediate",
    chords: ["C", "F", "Am", "G"],
    sections: [
      { name: "Verse", chords: ["C", "F", "C", "G"] },
      { name: "Chorus", chords: ["C", "Am", "F", "G", "C"] },
    ],
    strum: "Soft verses, then open up big in the chorus.",
    publicDomain: false,
    note: "Chord chart only. Built on the old hymn 'The Solid Rock'.",
  },
  {
    id: "how-great-thou-art",
    title: "How Great Thou Art",
    author: "Stuart K. Hine (Swedish folk melody)",
    key: "G",
    tempo: 76,
    feel: "4/4 · flowing",
    difficulty: "Intermediate",
    chords: ["G", "C", "D", "Em", "D"],
    sections: [
      { name: "Verse", chords: ["G", "C", "G", "D", "G", "C", "G", "D", "G"] },
      { name: "Chorus", chords: ["G", "C", "G", "Em", "D", "G", "C", "G", "D", "G"] },
    ],
    strum: "Gentle verses; let the chorus swell and soar.",
    publicDomain: false,
    note: "Chord chart only (the melody is a public-domain folk tune; the English text is under copyright).",
  },
  {
    id: "nothing-but-the-blood",
    title: "Nothing but the Blood",
    author: "Robert Lowry, 1876",
    key: "G",
    tempo: 96,
    feel: "4/4 · upbeat",
    difficulty: "Beginner",
    chords: ["G", "C", "D"],
    sections: [
      { name: "Verse", chords: ["G", "C", "G", "D", "G", "C", "G", "D", "G"] },
    ],
    strum: "Bright and rhythmic — a great up-tempo three-chord song.",
    publicDomain: true,
    firstLine: "What can wash away my sin?",
  },
  {
    id: "blessed-assurance",
    title: "Blessed Assurance",
    author: "Fanny Crosby, 1873",
    key: "D",
    tempo: 84,
    feel: "3/4 · flowing",
    difficulty: "Beginner",
    chords: ["D", "A", "G"],
    sections: [
      { name: "Verse", chords: ["D", "A", "D", "G", "D", "A", "D"] },
      { name: "Chorus", chords: ["D", "A", "D", "G", "D", "A", "D"] },
    ],
    strum: "3/4 waltz with a warm, rolling feel.",
    publicDomain: true,
    firstLine: "Blessed assurance, Jesus is mine…",
  },
];

export function songById(id: string): Song | undefined {
  return SONGS.find((s) => s.id === id);
}
