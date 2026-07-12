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
  // --- Open chords ---
  G: { name: "G Major", dots: [{ s: 0, fret: 3, finger: 2 }, { s: 1, fret: 2, finger: 1 }, { s: 5, fret: 3, finger: 3 }], open: [2, 3, 4] },
  C: { name: "C Major", dots: [{ s: 1, fret: 3, finger: 3 }, { s: 2, fret: 2, finger: 2 }, { s: 4, fret: 1, finger: 1 }], open: [3, 5], muted: [0] },
  D: { name: "D Major", dots: [{ s: 3, fret: 2, finger: 1 }, { s: 5, fret: 2, finger: 2 }, { s: 4, fret: 3, finger: 3 }], open: [2], muted: [0, 1] },
  E: { name: "E Major", dots: [{ s: 1, fret: 2, finger: 2 }, { s: 2, fret: 2, finger: 3 }, { s: 3, fret: 1, finger: 1 }], open: [0, 4, 5] },
  A: { name: "A Major", dots: [{ s: 2, fret: 2, finger: 1 }, { s: 3, fret: 2, finger: 2 }, { s: 4, fret: 2, finger: 3 }], open: [1, 5], muted: [0] },
  Em: { name: "E Minor", dots: [{ s: 1, fret: 2, finger: 2 }, { s: 2, fret: 2, finger: 3 }], open: [0, 3, 4, 5] },
  Am: { name: "A Minor", dots: [{ s: 2, fret: 2, finger: 2 }, { s: 3, fret: 2, finger: 3 }, { s: 4, fret: 1, finger: 1 }], open: [1, 5], muted: [0] },
  Dm: { name: "D Minor", dots: [{ s: 3, fret: 2, finger: 2 }, { s: 4, fret: 3, finger: 3 }, { s: 5, fret: 1, finger: 1 }], open: [2], muted: [0, 1] },
  Em7: { name: "E Minor 7", dots: [{ s: 1, fret: 2, finger: 2 }, { s: 2, fret: 2, finger: 3 }, { s: 4, fret: 3, finger: 4 }], open: [0, 3, 5] },
  Cadd9: { name: "C add9", dots: [{ s: 1, fret: 3, finger: 2 }, { s: 2, fret: 2, finger: 1 }, { s: 4, fret: 3, finger: 3 }], open: [3, 5], muted: [0] },
  Gb: { name: "G / B", dots: [{ s: 1, fret: 2, finger: 2 }, { s: 5, fret: 3, finger: 3 }], open: [2, 3, 4], muted: [0] },
  Dsus4: { name: "D sus4", dots: [{ s: 3, fret: 2, finger: 1 }, { s: 4, fret: 3, finger: 2 }, { s: 5, fret: 3, finger: 3 }], open: [2], muted: [0, 1] },
  Asus4: { name: "A sus4", dots: [{ s: 2, fret: 2, finger: 1 }, { s: 3, fret: 2, finger: 2 }, { s: 4, fret: 3, finger: 3 }], open: [1, 5], muted: [0] },
  // --- Barre chords ---
  F: { name: "F Major", barre: { fret: 1, from: 0, to: 5, finger: 1 }, dots: [{ s: 1, fret: 3, finger: 3 }, { s: 2, fret: 3, finger: 4 }, { s: 3, fret: 2, finger: 2 }], open: [] },
  Bm: { name: "B Minor", baseFret: 2, barre: { fret: 2, from: 1, to: 5, finger: 1 }, dots: [{ s: 2, fret: 4, finger: 3 }, { s: 3, fret: 4, finger: 4 }, { s: 4, fret: 3, finger: 2 }], open: [], muted: [0] },
  B: { name: "B Major", baseFret: 2, barre: { fret: 2, from: 1, to: 5, finger: 1 }, dots: [{ s: 2, fret: 4, finger: 2 }, { s: 3, fret: 4, finger: 3 }, { s: 4, fret: 4, finger: 4 }], open: [], muted: [0] },
  "F#m": { name: "F# Minor", baseFret: 2, barre: { fret: 2, from: 0, to: 5, finger: 1 }, dots: [{ s: 1, fret: 4, finger: 3 }, { s: 2, fret: 4, finger: 4 }], open: [] },
};

// ===== Curriculum =====

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  kicker: string;
  objective: string;
  chord?: string;
  progression?: { key: string; degrees: number[] };
  learn: { title: string; body: string }[];
  practice: string[];
  playAlong: string;
  tip?: string;
}

export interface Module {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

export const MODULES: Module[] = [
  {
    id: "m1",
    num: 1,
    title: "Foundations",
    subtitle: "Posture, hand position & first notes",
    lessons: [
      {
        id: "m1l1",
        title: "Holding the Guitar",
        subtitle: "Classical posture and a relaxed hold",
        minutes: 8,
        kicker: "Module 1 · Lesson 1",
        objective: "Sit and hold the guitar so your hands are free to move without tension.",
        learn: [
          { title: "Sit tall", body: "Sit forward on a firm chair, both feet flat. Rest the waist of the guitar on your right leg (or left leg with a footstool for full classical posture)." },
          { title: "Let the neck rise", body: "Angle the headstock up to about eye-level height. This keeps your fretting wrist straight instead of collapsed." },
          { title: "Relax your shoulders", body: "Your right forearm drapes over the top of the body. Neither hand should be holding the guitar up — the body and legs do that." },
        ],
        practice: [
          "Set up your posture, then let go with both hands for 5 seconds. If the guitar slides, adjust your hold until it balances on its own.",
          "Play any single string 10 times, resetting your posture between each. Aim for the same relaxed position every time.",
        ],
        playAlong: "Nothing to play yet — just get comfortable. A relaxed body is the foundation every other skill is built on.",
        tip: "Tension is the enemy. Check your shoulders every few minutes and let them drop.",
      },
      {
        id: "m1l2",
        title: "Naming the Strings",
        subtitle: "E A D G B E, low to high",
        minutes: 6,
        kicker: "Module 1 · Lesson 2",
        objective: "Know the name of every open string by sight and sound.",
        learn: [
          { title: "The six strings", body: "From thickest (lowest) to thinnest (highest): E, A, D, G, B, E. The two E strings are two octaves apart." },
          { title: "A memory phrase", body: "'Eddie Ate Dynamite, Good Bye Eddie' — the first letters give you E A D G B E from low to high." },
          { title: "Say them as you pluck", body: "Point to each string and say its name out loud while you play it. Naming while doing locks it in fast." },
        ],
        practice: [
          "Play each string low to high, naming it out loud: E–A–D–G–B–E.",
          "Now high to low: E–B–G–D–A–E.",
          "Close your eyes, pluck a random string, and name it before opening them.",
        ],
        playAlong: "Play all six strings slowly like a gentle wash of sound, naming each. This is your first 'chord' — the open strings ringing together.",
        tip: "The 6th (low E) and 1st (high E) share a name. If you get lost, find the thickest string — that's always low E.",
      },
      {
        id: "m1l3",
        title: "Fretting a Clean Note",
        subtitle: "Left-hand position that rings clear",
        minutes: 10,
        kicker: "Module 1 · Lesson 3",
        objective: "Press a fretted note that rings cleanly with no buzz.",
        learn: [
          { title: "Press behind the fret", body: "Place your fingertip just behind the metal fret wire, not on top of it and not in the middle of the space. This gives a clear note with the least effort." },
          { title: "Use your fingertips", body: "Come down on the very tip of the finger so you don't accidentally mute the neighbouring strings." },
          { title: "Thumb behind the neck", body: "Rest your thumb on the back of the neck, roughly opposite your fingers. This gives your fingers leverage to press." },
        ],
        practice: [
          "Press the 3rd fret of the B string with your ring finger and play it. Adjust until it rings with zero buzz.",
          "Lift off, shake out your hand, and place it again. Repeat 10 times aiming for a clean note first try.",
          "Walk one finger up frets 1–2–3–4 on the G string, one clear note each.",
        ],
        playAlong: "Play the melody of the first line of 'Mary Had a Little Lamb' on the B string: 3rd fret, 1st fret, open, 1st fret — slowly and cleanly.",
        tip: "Buzzing usually means you're too far behind the fret or not pressing quite hard enough. Creep your finger toward the fret wire.",
      },
      {
        id: "m1l4",
        title: "Your First Melody",
        subtitle: "Playing on the top strings",
        minutes: 12,
        kicker: "Module 1 · Lesson 4",
        objective: "Play a simple, recognizable melody one note at a time.",
        learn: [
          { title: "One note at a time", body: "Melody is single notes played in sequence. Keep your right-hand thumb or a pick moving evenly." },
          { title: "Count as you go", body: "Say '1, 2, 3, 4' steadily and play a note on each count. Even timing matters more than speed." },
          { title: "Look ahead", body: "Glance at the next note before you finish the current one so your hand is already moving there." },
        ],
        practice: [
          "Play 'Ode to Joy' on the B and high-E strings: B(open)-B-C(1st fret)-D(3rd)... take it four notes at a time.",
          "Play it again counting out loud to keep steady time.",
        ],
        playAlong: "Play the melody slowly along with the metronome tool at 60 BPM, one note per click.",
        tip: "If a passage trips you up, slow down until you can play it perfectly, then speed up. Speed is a by-product of accuracy.",
      },
    ],
  },
  {
    id: "m2",
    num: 2,
    title: "Rhythm & Strumming",
    subtitle: "Keeping time & worship strum patterns",
    lessons: [
      {
        id: "m2l1",
        title: "Feeling the Beat",
        subtitle: "Counting in 4/4 time",
        minutes: 8,
        kicker: "Module 2 · Lesson 1",
        objective: "Feel and count a steady 4/4 pulse — the backbone of worship music.",
        learn: [
          { title: "Four beats to a bar", body: "Most worship songs are in 4/4: you count '1, 2, 3, 4' over and over. Beat 1 feels the strongest." },
          { title: "Tap it out", body: "Tap your foot on every number. The foot is your inner clock — keep it going no matter what your hands do." },
          { title: "Subdivide", body: "Between each number is an 'and': 1-and-2-and-3-and-4-and. Those 'ands' are where up-strums live." },
        ],
        practice: [
          "Tap your foot and count '1 2 3 4' out loud for one minute with the metronome at 70 BPM.",
          "Now count the 'ands': 1-and-2-and-3-and-4-and, still tapping only on the numbers.",
        ],
        playAlong: "Open the Metronome tool at 70 BPM and count along until it feels automatic.",
        tip: "If your strumming ever falls apart, it's almost always the foot that stopped. Keep it moving.",
      },
      {
        id: "m2l2",
        title: "The Down Strum",
        subtitle: "Even quarter-note strums",
        minutes: 10,
        kicker: "Module 2 · Lesson 2",
        objective: "Strum steady down-strokes in time on one chord.",
        chord: "Em",
        learn: [
          { title: "Brush, don't hit", body: "Strum from the wrist, brushing down across the strings. Let the pick or thumb glide — you're painting, not chopping." },
          { title: "One strum per beat", body: "Play a down-strum on each count: 1, 2, 3, 4. This is 'quarter-note' strumming." },
          { title: "Keep the arm moving", body: "Your strumming hand keeps a steady down-motion even between strums, like a pendulum." },
        ],
        practice: [
          "Hold an E minor chord and strum down on every beat at 70 BPM for two minutes.",
          "Count out loud while you strum: 'down-2-3-4' every bar.",
        ],
        playAlong: "Set the Progression Looper to any key and use just the click — strum a down-stroke on each beat.",
        tip: "Aim your strum at the middle of the strings, not the edges, for the fullest sound.",
      },
      {
        id: "m2l3",
        title: "Down-Up Patterns",
        subtitle: "Adding upstrokes for movement",
        minutes: 12,
        kicker: "Module 2 · Lesson 3",
        objective: "Add up-strums on the 'and' to create flow and momentum.",
        chord: "G",
        learn: [
          { title: "The up-strum", body: "On the way back up, let the pick catch just the top 2–3 strings. Up-strums are lighter than down-strums." },
          { title: "Down on numbers, up on ands", body: "Down = 1 2 3 4, Up = the 'ands' in between. Try: down-up-down-up all bar (eighth notes)." },
          { title: "Let some strums miss", body: "You don't have to hit strings on every motion. The hand keeps moving; you choose when to make contact." },
        ],
        practice: [
          "On a G chord, strum steady eighths: D-U-D-U-D-U-D-U at 70 BPM.",
          "Try the pattern D-D-U-U-D-U and repeat it around the bar.",
        ],
        playAlong: "Loop a 1-5-6-4 progression at a slow tempo and lay your down-up pattern over it.",
        tip: "Keep your wrist loose. A stiff arm makes up-strums clunky — the motion should feel like shaking water off your hand.",
      },
      {
        id: "m2l4",
        title: "The Worship Strum",
        subtitle: "A gentle pattern for ballads",
        minutes: 12,
        kicker: "Module 2 · Lesson 4",
        objective: "Play the most common flowing worship strum pattern.",
        chord: "C",
        learn: [
          { title: "The pattern", body: "The classic worship strum is: Down, Down-Up, Up-Down-Up — counted 1, 2-and, and-3-and (with a miss on beat 3's down). It flows rather than marches." },
          { title: "Ghost the misses", body: "Keep your hand moving through the strums you skip so the rhythm stays even." },
          { title: "Dynamics", body: "Play softer in verses, fuller in choruses. The same pattern can whisper or soar." },
        ],
        practice: [
          "On a C chord, play D · D-U · U-D-U slowly until it's smooth.",
          "Speed it up gradually to 75 BPM, keeping it relaxed and flowing.",
        ],
        playAlong: "Loop a 1-5-6-4 progression at 72 BPM and play the worship strum through the chord changes.",
        tip: "This one pattern fits a huge portion of modern worship songs. Master it and you can play along with almost anything.",
      },
    ],
  },
  {
    id: "m3",
    num: 3,
    title: "Chord Shapes",
    subtitle: "Open chords, transitions & the capo",
    lessons: [
      {
        id: "m3l1",
        title: "Reading Chord Charts",
        subtitle: "Dots, fingers, and open strings",
        minutes: 7,
        kicker: "Module 3 · Lesson 1",
        objective: "Read a chord diagram fluently so you can learn any new shape.",
        chord: "Em",
        learn: [
          { title: "The grid", body: "Vertical lines are strings (low E on the left), horizontal lines are frets. The thick bar at the top is the nut." },
          { title: "Dots and numbers", body: "A dot shows where to press; the number inside tells you which finger (1=index, 2=middle, 3=ring, 4=pinky)." },
          { title: "Above the nut", body: "An 'o' means play that string open; an 'x' means don't play it at all." },
        ],
        practice: [
          "Read the E minor diagram and place your fingers from it without help.",
          "Play the chord one string at a time to check every note rings — fix any that buzz or are muted.",
        ],
        playAlong: "Strum E minor slowly with the worship strum from Module 2.",
        tip: "Whenever you meet a new chord in this app, the diagram tells you everything. Learn to read it and you're self-sufficient.",
      },
      {
        id: "m3l2",
        title: "The E Minor Chord",
        subtitle: "Your first full chord",
        minutes: 8,
        kicker: "Module 3 · Lesson 2",
        objective: "Play a clean, full-sounding E minor — the easiest chord on guitar.",
        chord: "Em",
        learn: [
          { title: "Two fingers", body: "Middle finger on the A string (5th), 2nd fret. Ring finger on the D string (4th), 2nd fret. Everything else rings open." },
          { title: "Strum all six", body: "E minor uses all six strings, so strum from the low E straight through." },
          { title: "Listen for ring", body: "Both open E strings and the open G and B should ring clearly alongside your two fretted notes." },
        ],
        practice: [
          "Form E minor, strum, and check each string rings.",
          "Lift off, shake out, and re-form it 10 times, aiming for a clean chord first try.",
        ],
        playAlong: "Strum E minor with the worship strum for a full minute — let it become effortless.",
        tip: "E minor is the 6th chord in the key of G and the 6 in a 1-5-6-4 — you'll use it constantly.",
      },
      {
        id: "m3l3",
        title: "The G Major Chord",
        subtitle: "The most-used chord in worship music",
        minutes: 10,
        kicker: "Module 3 · Lesson 3",
        objective: "Play a clean G major and know why it matters.",
        chord: "G",
        learn: [
          { title: "Place your fingers", body: "Middle finger on the low E (6th), 3rd fret. Index on the A (5th), 2nd fret. Ring finger on the high E (1st), 3rd fret." },
          { title: "Let the middle strings ring", body: "The D, G, and B strings stay open. Arch your fingers so they don't touch them." },
          { title: "Strum all six", body: "G is a full six-string chord — big and joyful." },
        ],
        practice: [
          "Form G, strum, and check every string is clear.",
          "Practice landing all three fingers at once, not one at a time.",
        ],
        playAlong: "Alternate two bars of G and two bars of E minor with the worship strum.",
        tip: "G is the '1' (home chord) of the most common worship key. If you learn one chord well, make it this one.",
      },
      {
        id: "m3l4",
        title: "The C & D Chords",
        subtitle: "Completing the key of G",
        minutes: 10,
        kicker: "Module 3 · Lesson 4",
        objective: "Add C major and D major so you can play in the key of G.",
        chord: "C",
        learn: [
          { title: "C major", body: "Ring finger on the A (5th) 3rd fret, middle on the D (4th) 2nd fret, index on the B (2nd) 1st fret. Don't play the low E." },
          { title: "D major", body: "A small triangle on the top strings: index on G (3rd) 2nd fret, ring on B (2nd) 3rd fret, middle on high E (1st) 2nd fret. Play from the D string down." },
          { title: "Now you have four", body: "G, C, D, and Em together give you the four chords behind thousands of worship songs." },
        ],
        practice: [
          "Form C, check it rings, then D, then back. Go slowly.",
          "Play one bar each: G – C – D – Em, resetting as needed.",
        ],
        playAlong: "Loop a 1-4-6-5 progression in G (G-C-Em-D) and strum along at a slow tempo.",
        tip: "For C and D, avoid strumming the low E string — start your strum from the A or D string.",
      },
      {
        id: "m3l5",
        title: "Smooth Transitions",
        subtitle: "Changing chords without stopping",
        minutes: 10,
        kicker: "Module 3 · Lesson 5",
        objective: "Move between chords in time without pausing the strum.",
        chord: "G",
        learn: [
          { title: "Look for common fingers", body: "Between some chords a finger stays put or barely moves. Find those 'anchor' fingers and pivot around them." },
          { title: "Move as a shape", body: "Lift and place all fingers together as one unit, not one at a time." },
          { title: "Change on the last up-strum", body: "Start moving to the next chord slightly early, during the final up-strum of the bar, so you land on beat 1." },
        ],
        practice: [
          "Change G to C over and over, just the hands, no strumming, aiming for a clean landing.",
          "Now add one strum per chord, changing every beat. Keep the metronome slow.",
        ],
        playAlong: "Loop G-C-D-G at a very slow tempo and change chords in time with the click.",
        tip: "It's better to change on time with a slightly rough chord than to stop and 'fix' it. Keep the beat and the fingers will catch up.",
      },
      {
        id: "m3l6",
        title: "Using a Capo",
        subtitle: "Play easy shapes in any key",
        minutes: 8,
        kicker: "Module 3 · Lesson 6",
        objective: "Use a capo to match a singer's key while keeping easy open shapes.",
        learn: [
          { title: "What a capo does", body: "A capo clamps across a fret and raises the pitch of every string. Your open shapes now sound higher, in a new key." },
          { title: "Place it well", body: "Clamp just behind the fret (like a good fretting finger) so nothing buzzes. Check each string rings." },
          { title: "Find the fret", body: "Use the Capo & Keys tool: tell it the key you need, and it shows which shapes to play and where to clamp." },
        ],
        practice: [
          "Put a capo on the 2nd fret and play your G shape — it now sounds as A. Play G-C-D shapes and hear the new key.",
          "Use the Capo & Keys tool to find the capo for the key of Bb, then play it.",
        ],
        playAlong: "Capo 2, then loop G-C-D-Em shapes — you're now playing in the key of A.",
        tip: "Capos are standard on worship teams. Two guitarists often capo differently to layer the same song richly.",
      },
      {
        id: "m3l7",
        title: "Your First Worship Song",
        subtitle: "Putting it all together",
        minutes: 12,
        kicker: "Module 3 · Lesson 7",
        objective: "Play a full, simple worship song start to finish.",
        chord: "G",
        progression: { key: "G", degrees: [1, 5, 6, 4] },
        learn: [
          { title: "The progression", body: "Many worship songs are just 1-5-6-4. In G that's G-D-Em-C, looping through verse and chorus." },
          { title: "Steady over perfect", body: "Keep the worship strum going and change chords in time. A steady groove carries the song." },
          { title: "Build dynamics", body: "Play the verse softly, then strum fuller in the chorus to lift the room." },
        ],
        practice: [
          "Loop G-D-Em-C with the worship strum, two strums to a bar, at 72 BPM.",
          "Play it four times through without stopping, even if a chord is rough.",
        ],
        playAlong: "Use the Progression Looper in G, 1-5-6-4, and play the full pattern along with it.",
        tip: "Congratulations — this four-chord loop is a real worship song engine. Head to the Song Library to try it on actual songs.",
      },
    ],
  },
  {
    id: "m4",
    num: 4,
    title: "Lead & Melody",
    subtitle: "Scales, licks & playing the tune",
    lessons: [
      {
        id: "m4l1",
        title: "The Major Scale",
        subtitle: "The roadmap of melody",
        minutes: 12,
        kicker: "Module 4 · Lesson 1",
        objective: "Play the major scale and understand why every melody comes from it.",
        learn: [
          { title: "Do-re-mi", body: "The major scale is the familiar do-re-mi-fa-sol-la-ti-do. Every note of a major-key melody comes from these seven notes." },
          { title: "One-octave shape", body: "In the open position, the G major scale runs across the lower strings. Learn it as a shape your fingers memorize." },
          { title: "Ascend and descend", body: "Practice up and back down. Coming down is where most people rush — keep it even." },
        ],
        practice: [
          "Play the G major scale slowly, one note per metronome click at 60 BPM.",
          "Play it ascending, then immediately descending, without a gap.",
        ],
        playAlong: "Loop a G chord in the Progression Looper and play the scale over it — hear how every note belongs.",
        tip: "Sing the notes as you play them. Connecting your ear to your fingers is what turns scales into music.",
      },
      {
        id: "m4l2",
        title: "Playing a Hymn Melody",
        subtitle: "Be Thou My Vision, one note at a time",
        minutes: 14,
        kicker: "Module 4 · Lesson 2",
        objective: "Play a recognizable hymn melody as a lead line.",
        learn: [
          { title: "Melody is just scale notes", body: "A hymn tune is the major scale rearranged into a beautiful order. You already have the notes under your fingers." },
          { title: "Phrase by phrase", body: "Learn the first line, then the second, then join them. Don't tackle the whole tune at once." },
          { title: "Let it breathe", body: "Leave small spaces between phrases like a singer taking a breath. Music lives in the gaps too." },
        ],
        practice: [
          "Learn the first phrase of 'Be Thou My Vision' by ear or from the notes, slowly.",
          "Add the second phrase and play them joined.",
        ],
        playAlong: "Have a friend (or the Progression Looper in D) hold the chords while you play the melody on top.",
        tip: "Playing a familiar melody is the fastest way to train your ear — you already know when a note is wrong.",
      },
      {
        id: "m4l3",
        title: "The Pentatonic Scale",
        subtitle: "Five notes for lead lines",
        minutes: 12,
        kicker: "Module 4 · Lesson 3",
        objective: "Learn the pentatonic 'box' — the shape most lead guitar is built on.",
        learn: [
          { title: "Five friendly notes", body: "The pentatonic scale drops the two trickiest notes of the major scale, leaving five that sound good over almost anything." },
          { title: "The box shape", body: "It sits in one position as a repeatable 'box' you can move anywhere on the neck to change key." },
          { title: "Target the chord tones", body: "Land on notes that are in the current chord for lines that sound intentional, not random." },
        ],
        practice: [
          "Play the E minor pentatonic box up and down, two notes per beat at 70 BPM.",
          "Improvise four notes, then rest for four beats. Repeat, choosing different notes.",
        ],
        playAlong: "Loop a 6-4-1-5 progression in G and improvise using only the pentatonic box.",
        tip: "You don't need many notes to sound good in worship — a few well-placed pentatonic notes say more than a flurry.",
      },
      {
        id: "m4l4",
        title: "Simple Improvisation",
        subtitle: "Phrasing over a worship progression",
        minutes: 15,
        kicker: "Module 4 · Lesson 4",
        objective: "Improvise melodic, tasteful lead lines over a chord loop.",
        learn: [
          { title: "Play like you speak", body: "Good improvising is like conversation: short phrases, with space to breathe between them. Don't fill every beat." },
          { title: "Repeat and vary", body: "Play a little phrase, then play it again slightly changed. Repetition makes a line feel like a melody." },
          { title: "Serve the song", body: "In worship, lead guitar supports the moment — swell into choruses, lay out in quiet verses." },
        ],
        practice: [
          "Over a slow chord loop, play one 2-second phrase per chord, then rest.",
          "Take yesterday's phrase and vary it three different ways.",
        ],
        playAlong: "Loop 1-5-6-4 in G and trade: two bars of lead, two bars of silence, listening to the chords.",
        tip: "The rests are the music. A lead line that leaves space feels far more worshipful than constant noodling.",
      },
    ],
  },
  {
    id: "m5",
    num: 5,
    title: "Leading Worship",
    subtitle: "Improvise, dynamics & leading a set",
    lessons: [
      {
        id: "m5l1",
        title: "Dynamics & Feel",
        subtitle: "When to build and when to rest",
        minutes: 12,
        kicker: "Module 5 · Lesson 1",
        objective: "Shape a song's energy with your playing, not just your volume.",
        learn: [
          { title: "The arc of a song", body: "Most worship songs breathe: gentle verse, building pre-chorus, full chorus, stripped-back bridge. Your dynamics draw that arc." },
          { title: "Tools for build", body: "Add strings to your strum, strum harder, move from fingerpicking to full strums, or add a driving eighth-note feel to lift energy." },
          { title: "Tools for rest", body: "Drop to the top strings, fingerpick, or leave space entirely. Silence from the guitar can be powerful." },
        ],
        practice: [
          "Play one progression four times, getting fuller each pass, then drop suddenly to a whisper.",
          "Play a verse fingerpicked and the chorus with full strums.",
        ],
        playAlong: "Loop a progression and practice building for eight bars, then pulling right back.",
        tip: "The congregation follows the band's energy. Learning to build and release is the heart of leading worship from the guitar.",
      },
      {
        id: "m5l2",
        title: "Leading from the Guitar",
        subtitle: "Cueing the band and the room",
        minutes: 14,
        kicker: "Module 5 · Lesson 2",
        objective: "Guide a song's structure so the team and congregation can follow you.",
        learn: [
          { title: "Set the tempo", body: "Count the band in clearly, or start a steady intro so everyone locks to your pulse. You are the clock." },
          { title: "Signal changes", body: "Use simple, visible cues — a nod, a lifted hand, calling the section — so the team knows when the chorus or bridge is coming." },
          { title: "Play the map", body: "Know the song's structure cold so you can lengthen a chorus or repeat a bridge in the moment and the band follows your lead." },
        ],
        practice: [
          "Count a song in out loud and start playing exactly on '1'.",
          "Play a song and, without stopping, decide to repeat the chorus — signal it clearly to an imaginary band.",
        ],
        playAlong: "Loop a progression and practice starting, adding a section, and ending cleanly on a single strum.",
        tip: "Confidence is a gift to your team. Even a simple part played decisively is easier to follow than a fancy one played timidly.",
      },
      {
        id: "m5l3",
        title: "Spontaneous Worship",
        subtitle: "Playing in open, unscripted moments",
        minutes: 15,
        kicker: "Module 5 · Lesson 3",
        objective: "Hold an open, prayerful musical space with just a chord or two.",
        learn: [
          { title: "Pick a home", body: "Spontaneous moments often live on one or two chords (a 1-4 vamp). Choose a key and settle in." },
          { title: "Less is more", body: "Gentle fingerpicking, a slow swell, or a single sustained chord creates space for prayer and singing." },
          { title: "Follow the leader", body: "Watch the worship leader and the room. Rise when they rise, soften when they soften — you're accompanying a conversation with God." },
        ],
        practice: [
          "Fingerpick a 1-4 vamp in G very slowly for two minutes without rushing.",
          "Hold a single chord and swell it in and out with your volume for one minute.",
        ],
        playAlong: "Loop a 1-4 vamp at a slow tempo and practice adding and removing texture without changing the chords.",
        tip: "In these moments your job is to get out of the way. A simple, steady bed of sound lets the room encounter God.",
      },
      {
        id: "m5l4",
        title: "Leading a Full Set",
        subtitle: "Planning and carrying a worship set",
        minutes: 18,
        kicker: "Module 5 · Lesson 4",
        objective: "Plan and play a short set of songs that flows as one journey.",
        learn: [
          { title: "Order for flow", body: "Group songs by key and tempo so transitions are smooth. A common arc: an upbeat opener, into mid-tempo, into an intimate closer." },
          { title: "Connect the songs", body: "Use a shared key or a capo change to glide from one song into the next without dead air." },
          { title: "Plan the dynamics", body: "Decide where the set builds and where it rests, so the whole thing has one shape, not four separate songs." },
        ],
        practice: [
          "Choose three songs from the Song Library and put them in an order that flows by key and tempo.",
          "Play the last chord of song one into the first chord of song two with no gap.",
        ],
        playAlong: "Use the Song Library charts to play three songs back to back, keeping the pulse steady between them.",
        tip: "You've come the whole journey — from your first note to leading a set. Keep serving, keep growing, and play skillfully for the Lord.",
      },
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
