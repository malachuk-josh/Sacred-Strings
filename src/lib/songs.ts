// Song charts for the library. Chord charts + structure only — we do not
// reproduce lyrics of copyrighted songs. Public-domain hymns include a first line.
// Charts are simplified, standard guitar arrangements: ONE CELL = ONE BAR.

export interface SongSection {
  name: string;
  chords: string[]; // one entry per bar; names are keys into CHORDS
}

export interface Song {
  id: string;
  title: string;
  author: string;
  key: string;
  capo?: number;
  tempo: number;
  timeSignature: number; // beats per bar (3 or 4)
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
    author: "John Newton, 1779 · tune: New Britain",
    key: "G",
    tempo: 72,
    timeSignature: 3,
    feel: "3/4 · flowing",
    difficulty: "Beginner",
    chords: ["G", "C", "D", "D7"],
    sections: [
      { name: "Verse", chords: ["G", "G", "C", "G", "G", "G", "D", "D", "G", "G", "C", "G", "G", "D7", "G", "G"] },
    ],
    strum: "Gentle 3/4: bass note on beat 1 with the thumb, two soft strums after. Lean into beat 1.",
    publicDomain: true,
    firstLine: "Amazing grace, how sweet the sound…",
    note: "A perfect first song — three chords and a forgiving waltz feel. One chord cell per bar.",
  },
  {
    id: "be-thou-my-vision",
    title: "Be Thou My Vision",
    author: "Ancient Irish · tr. Mary Byrne, versified Eleanor Hull · tune: Slane",
    key: "D",
    tempo: 84,
    timeSignature: 3,
    feel: "3/4 · flowing",
    difficulty: "Beginner",
    chords: ["D", "G", "A", "Bm"],
    sections: [
      { name: "Verse", chords: ["D", "D", "G", "A", "D", "Bm", "G", "A", "D", "G", "D", "Bm", "G", "D", "A", "D"] },
    ],
    strum: "3/4 waltz — bass-strum-strum. Let each chord ring the full bar.",
    publicDomain: true,
    firstLine: "Be Thou my vision, O Lord of my heart…",
    note: "Four 4-bar phrases, like the tune itself. The Bm barre gets a gentle workout here.",
  },
  {
    id: "come-thou-fount",
    title: "Come Thou Fount of Every Blessing",
    author: "Robert Robinson, 1758 · tune: Nettleton",
    key: "G",
    tempo: 84,
    timeSignature: 3,
    feel: "3/4 · warm",
    difficulty: "Beginner",
    chords: ["G", "C", "D", "Em"],
    sections: [
      { name: "Verse (lines 1–2)", chords: ["G", "C", "G", "D", "G", "C", "D", "G"] },
      { name: "Verse (lines 3–4)", chords: ["C", "G", "Em", "D", "G", "C", "D", "G"] },
    ],
    strum: "A lilting 3/4 — thumb bass on beat 1, light strums on 2 and 3.",
    publicDomain: true,
    firstLine: "Come Thou Fount of every blessing…",
  },
  {
    id: "holy-holy-holy",
    title: "Holy, Holy, Holy",
    author: "Reginald Heber, 1826 · tune: Nicaea, John B. Dykes, 1861",
    key: "D",
    tempo: 88,
    timeSignature: 4,
    feel: "4/4 · stately",
    difficulty: "Beginner",
    chords: ["D", "G", "A", "Bm"],
    sections: [
      { name: "Verse", chords: ["D", "D", "Bm", "A", "D", "G", "A", "D", "D", "D", "Bm", "A", "G", "D", "A", "D"] },
    ],
    strum: "Strong, even down-strums — this hymn stands tall.",
    publicDomain: true,
    firstLine: "Holy, holy, holy, Lord God Almighty…",
  },
  {
    id: "doxology",
    title: "Doxology (Praise God From Whom All Blessings Flow)",
    author: "Thomas Ken, 1674 · tune: Old 100th, Louis Bourgeois, 1551",
    key: "G",
    tempo: 76,
    timeSignature: 4,
    feel: "4/4 · stately",
    difficulty: "Beginner",
    chords: ["G", "C", "D", "Em"],
    sections: [
      { name: "Verse", chords: ["G", "C", "G", "D", "G", "C", "D", "G", "G", "Em", "C", "D", "G", "C", "D", "G"] },
    ],
    strum: "One clear chord per beat. A beautiful way to open or close a set.",
    publicDomain: true,
    firstLine: "Praise God from whom all blessings flow…",
  },
  {
    id: "it-is-well",
    title: "It Is Well With My Soul",
    author: "Horatio Spafford, 1873 · tune: Ville du Havre, Philip Bliss, 1876",
    key: "C",
    tempo: 76,
    timeSignature: 4,
    feel: "4/4 · flowing",
    difficulty: "Intermediate",
    chords: ["C", "F", "G7", "Am"],
    sections: [
      { name: "Verse", chords: ["C", "F", "C", "G7", "C", "F", "G7", "C"] },
      { name: "Chorus", chords: ["C", "G7", "Am", "F", "C", "G7", "C", "C"] },
    ],
    strum: "Gentle worship strum in the verse, fuller in the chorus echo.",
    publicDomain: true,
    firstLine: "When peace like a river attendeth my way…",
    note: "The G7 makes the cadences land the way the hymnal harmonization does.",
  },
  {
    id: "blessed-assurance",
    title: "Blessed Assurance",
    author: "Fanny Crosby, 1873 · tune: Phoebe Knapp",
    key: "D",
    tempo: 84,
    timeSignature: 3,
    feel: "3/4 · rolling",
    difficulty: "Beginner",
    chords: ["D", "G", "A7"],
    sections: [
      { name: "Verse", chords: ["D", "G", "D", "A7", "D", "G", "A7", "D"] },
      { name: "Chorus", chords: ["D", "D", "G", "D", "D", "G", "A7", "D"] },
    ],
    strum: "It truly flows in threes (the hymnal writes it in 9/8) — count a gentle 1-2-3 and let it rock.",
    publicDomain: true,
    firstLine: "Blessed assurance, Jesus is mine…",
  },
  {
    id: "nothing-but-the-blood",
    title: "Nothing but the Blood",
    author: "Robert Lowry, 1876",
    key: "G",
    tempo: 96,
    timeSignature: 4,
    feel: "4/4 · upbeat",
    difficulty: "Beginner",
    chords: ["G", "C", "D7"],
    sections: [
      { name: "Verse", chords: ["G", "C", "G", "D7", "G", "C", "D7", "G"] },
      { name: "Refrain", chords: ["G", "D7", "C", "G", "G", "C", "D7", "G"] },
    ],
    strum: "Bright and rhythmic — a great up-tempo three-chord song.",
    publicDomain: true,
    firstLine: "What can wash away my sin?",
  },
  {
    id: "crown-him",
    title: "Crown Him with Many Crowns",
    author: "Matthew Bridges, 1851 · tune: Diademata, George Elvey, 1868",
    key: "D",
    tempo: 92,
    timeSignature: 4,
    feel: "4/4 · triumphant",
    difficulty: "Intermediate",
    chords: ["D", "A", "G", "Bm", "Em"],
    sections: [
      { name: "Verse", chords: ["D", "A", "D", "G", "D", "Bm", "Em", "A", "D", "G", "D", "A", "D", "G", "A", "D"] },
    ],
    strum: "Bold and celebratory — full six-string strums.",
    publicDomain: true,
    firstLine: "Crown Him with many crowns…",
  },
  {
    id: "great-is-thy-faithfulness",
    title: "Great Is Thy Faithfulness",
    author: "Thomas Chisholm, 1923 · tune: William Runyan",
    key: "C",
    tempo: 80,
    timeSignature: 3,
    feel: "3/4 · flowing",
    difficulty: "Intermediate",
    chords: ["C", "F", "G7", "D7", "Am"],
    sections: [
      { name: "Verse", chords: ["C", "F", "C", "G7", "C", "Am", "G7", "C"] },
      { name: "Chorus", chords: ["F", "C", "D7", "G7", "C", "F", "G7", "C"] },
    ],
    strum: "3/4. The F is a barre and the D7 colors the chorus — take it slowly at first.",
    publicDomain: true,
    firstLine: "Great is Thy faithfulness, O God my Father…",
    note: "A good step up: a barre chord plus the D7 'secondary dominant' that gives the chorus its lift.",
  },
  // --- Modern worship: chord charts only (no lyrics) ---
  {
    id: "10000-reasons",
    title: "10,000 Reasons (Bless the Lord)",
    author: "Matt Redman & Jonas Myrin",
    key: "G",
    tempo: 73,
    timeSignature: 4,
    feel: "4/4 · flowing",
    difficulty: "Beginner",
    chords: ["G", "D", "Em", "C"],
    sections: [
      { name: "Chorus", chords: ["C", "G", "D", "Em", "C", "G", "D", "D"] },
      { name: "Verse", chords: ["C", "G", "D", "Em", "C", "G", "D", "D"] },
    ],
    strum: "Classic worship strum. The whole song lives in these four chords.",
    publicDomain: false,
    note: "Chord chart only (representative loop). It's essentially a 4-1-5-6 pattern — try it in the Progression Looper first.",
  },
  {
    id: "what-a-beautiful-name",
    title: "What a Beautiful Name",
    author: "Ben Fielding & Brooke Ligertwood",
    key: "D",
    tempo: 68,
    timeSignature: 4,
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
    tempo: 64,
    timeSignature: 3,
    feel: "3/4 · building",
    difficulty: "Intermediate",
    chords: ["D", "A", "Bm", "G"],
    sections: [
      { name: "Verse", chords: ["D", "G", "D", "A", "Bm", "G", "A", "D"] },
    ],
    strum: "A modern hymn in 3/4 — start with bass-strum-strum and let it build verse by verse.",
    publicDomain: false,
    note: "Chord chart only (representative verse loop). Note the waltz time — count in threes.",
  },
  {
    id: "cornerstone",
    title: "Cornerstone",
    author: "Hillsong Worship (after 'The Solid Rock', Mote/Bradbury)",
    key: "C",
    tempo: 72,
    timeSignature: 4,
    feel: "4/4 · building",
    difficulty: "Intermediate",
    chords: ["C", "F", "Am", "G"],
    sections: [
      { name: "Verse", chords: ["C", "F", "C", "G", "C", "F", "G", "C"] },
      { name: "Chorus", chords: ["C", "Am", "F", "G", "C", "F", "G", "C"] },
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
    timeSignature: 4,
    feel: "4/4 · flowing",
    difficulty: "Intermediate",
    chords: ["G", "C", "D7", "D", "Em"],
    sections: [
      { name: "Verse", chords: ["G", "C", "G", "D7", "G", "C", "D7", "G"] },
      { name: "Chorus", chords: ["C", "G", "D", "Em", "C", "G", "D7", "G"] },
    ],
    strum: "Gentle verses; let the chorus swell and soar.",
    publicDomain: false,
    note: "Chord chart only (the melody is a public-domain folk tune; the English text is under copyright).",
  },
];

export function songById(id: string): Song | undefined {
  return SONGS.find((s) => s.id === id);
}
