"use client";

import { useState } from "react";

interface TheoryTopic {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
}

const topics: TheoryTopic[] = [
  {
    id: "notes",
    title: "Notes & the Staff",
    summary: "The building blocks of written music",
    category: "Fundamentals",
    content: "Music is written on a staff of five lines. Each line and space represents a pitch. On guitar, we read primarily in treble clef. The notes on the lines (bottom to top) are E-G-B-D-F, and the spaces spell F-A-C-E. Classical guitar music is written an octave higher than it sounds — this is standard and something every guitarist should know.",
  },
  {
    id: "intervals",
    title: "Intervals",
    summary: "The distance between two notes — the DNA of melody and harmony",
    category: "Fundamentals",
    content: "An interval is the distance between two pitches. Unison (same note), minor 2nd (one fret), major 2nd (two frets), minor 3rd (three frets), major 3rd (four frets), and so on up to the octave (twelve frets). Intervals give chords and melodies their character. A major chord has a major 3rd and perfect 5th. Recognizing intervals by ear is one of the most powerful skills for a worship guitarist.",
  },
  {
    id: "scales",
    title: "Major & Minor Scales",
    summary: "The roadmaps of melody",
    category: "Scales & Modes",
    content: "The major scale follows the pattern: Whole-Whole-Half-Whole-Whole-Whole-Half. In the key of C: C-D-E-F-G-A-B-C. The natural minor scale is the 6th mode of the major scale (Aeolian), following: W-H-W-W-H-W-W. Most worship music sits in major keys, but minor sections add depth and emotion — think of a bridge that moves to the relative minor for contrast.",
  },
  {
    id: "modes",
    title: "Modes for Worship",
    summary: "Seven flavors of the major scale",
    category: "Scales & Modes",
    content: "Each mode starts on a different degree of the major scale. For worship guitar, three modes matter most: Ionian (major — bright, joyful), Mixolydian (major with a flat 7 — the sound of much modern worship), and Dorian (minor with a natural 6 — warm and soulful). When improvising over a worship progression, identifying the mode gives you a roadmap for lead lines.",
  },
  {
    id: "keys",
    title: "Keys & Key Signatures",
    summary: "The tonal home of a song",
    category: "Harmony",
    content: "A key tells you which notes belong to a song. Key of G means G-A-B-C-D-E-F#. Common worship keys on guitar: G, D, A, E, C. With a capo, you can play open-chord shapes in any key. Understanding keys lets you transpose instantly — if the vocalist needs a song lower, you know exactly where to move.",
  },
  {
    id: "chords",
    title: "Chord Construction",
    summary: "How chords are built from scales",
    category: "Harmony",
    content: "Chords are built by stacking thirds. A major chord: root, major 3rd, perfect 5th. A minor chord: root, minor 3rd, perfect 5th. In any major key, the chords follow a pattern: I-major, ii-minor, iii-minor, IV-major, V-major, vi-minor, vii°-diminished. This is why worship songs in G use G, Am, Bm, C, D, Em — they all belong to the key.",
  },
  {
    id: "nashville",
    title: "Nashville Number System",
    summary: "The universal language of worship teams",
    category: "Harmony",
    content: "Instead of writing chord names, the Nashville system uses numbers: 1-2-3-4-5-6-7 representing scale degrees. A song charted as 1-5-6-4 in the key of G means G-D-Em-C. The beauty: the chart works in ANY key. If the leader calls it in A, the same chart gives you A-E-F#m-D. This is how professional worship musicians communicate.",
  },
  {
    id: "rhythm",
    title: "Rhythm & Time Signatures",
    summary: "The heartbeat beneath the melody",
    category: "Rhythm",
    content: "Most worship music is in 4/4 (four quarter-note beats per measure) or 6/8 (six eighth-note beats, felt in two groups of three — a flowing, intimate feel often used in slower worship). Understanding subdivisions — eighth notes, sixteenth notes, triplets — lets you lock in with the band and create rhythmic interest in your playing.",
  },
  {
    id: "progression",
    title: "Common Worship Progressions",
    summary: "The chord movements that define modern worship",
    category: "Worship Application",
    content: "The most common worship progressions: 1-5-6-4 (the 'worship progression' — used in countless songs), 1-4-6-5, 6-4-1-5 (starting on the minor for a more reflective feel), and 1-4 (simple two-chord vamp for open worship). Knowing these by ear means you can follow along even without a chart — essential for spontaneous worship moments.",
  },
  {
    id: "leading",
    title: "Musical Leadership",
    summary: "Theory in service of the Spirit",
    category: "Worship Application",
    content: "Theory serves worship, not the other way around. A worship leader who understands theory can: modulate to build energy (moving up a half-step), use chord substitutions for freshness (try a 2-minor instead of a 4-major), resolve tension at the right moment, and communicate clearly with the team. The goal is never to show off knowledge — it's to remove musical barriers so the congregation can encounter God.",
  },
];

const categories = [...new Set(topics.map((t) => t.category))];

export default function TheoryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const filtered = activeCategory === "all" ? topics : topics.filter((t) => t.category === activeCategory);

  return (
    <div className="px-4 py-8 lg:px-12 lg:py-12">
      <h1 className="font-[var(--font-playfair)] text-2xl lg:text-4xl font-bold mb-2">
        Music Theory
      </h1>
      <p className="text-warm-gray mb-8">
        The language of music — understand it to serve worship better.
      </p>

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-gold text-navy"
              : "bg-navy/50 text-gray-300 hover:bg-navy"
          }`}
        >
          All Topics
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-gold text-navy"
                : "bg-navy/50 text-gray-300 hover:bg-navy"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Topics */}
      <div className="space-y-3">
        {filtered.map((topic) => (
          <div
            key={topic.id}
            className="rounded-lg border border-gold/10 transition-all hover:border-gold/30"
          >
            <button
              onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{topic.title}</h3>
                  <p className="text-sm text-warm-gray mt-1">{topic.summary}</p>
                </div>
                <span className="text-gold text-xl ml-4">
                  {expandedTopic === topic.id ? "−" : "+"}
                </span>
              </div>
            </button>
            {expandedTopic === topic.id && (
              <div className="px-4 pb-4 border-t border-gold/10 pt-4">
                <p className="text-sm leading-relaxed text-foreground/80">
                  {topic.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
