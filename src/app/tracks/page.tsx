"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TRACKS, DRUM_PATTERNS, BASS_PATTERNS, type PracticeTrack } from "@/lib/tracks";
import { MAJOR_KEYS, majorKeyChords, pitchOf, preferFlat, guitarTriadFreqs, pitchToFreq } from "@/lib/music";
import {
  armAudio, unlockAudio, trackNow, openTrackBus, closeTrackBus, dampStrings,
  kickAt, snareAt, hatAt, bassAt, padAt, strumAt,
} from "@/lib/audio";

interface Layers { pad: boolean; drums: boolean; bass: boolean; guitar: boolean }

export default function TracksPage() {
  const [trackId, setTrackId] = useState(TRACKS[0].id);
  const track = TRACKS.find((t) => t.id === trackId)!;
  const [keyName, setKeyName] = useState(track.key);
  const [bpm, setBpm] = useState(track.bpm);
  const [layers, setLayers] = useState<Layers>({ pad: true, drums: true, bass: true, guitar: false });
  const [playing, setPlaying] = useState(false);
  const [bar, setBar] = useState(0);

  const schedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uiTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startRef = useRef(0);
  const nextBarRef = useRef(0);
  const layersRef = useRef(layers);
  layersRef.current = layers;

  useEffect(() => {
    armAudio();
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chords = useMemo(() => {
    const root = pitchOf(keyName) ?? 7;
    const diatonic = majorKeyChords(root, preferFlat(keyName));
    return track.degrees.map((d) => diatonic[d - 1]);
  }, [keyName, track]);

  const stopAll = () => {
    if (schedRef.current) clearInterval(schedRef.current);
    schedRef.current = null;
    uiTimersRef.current.forEach(clearTimeout);
    uiTimersRef.current = [];
    closeTrackBus();
    dampStrings();
  };

  const scheduleBar = (barIdx: number, t: number, secPerBeat: number) => {
    const beats = track.beatsPerBar;
    const barDur = beats * secPerBeat;
    const chord = chords[barIdx % chords.length];
    const L = layersRef.current;

    if (L.pad) padAt(t, guitarTriadFreqs(chord.root, chord.quality).slice(1), barDur);
    if (L.bass) {
      const freq = pitchToFreq(chord.root, 1);
      const hits = BASS_PATTERNS[track.style];
      hits.forEach((b, i) => {
        const next = hits[i + 1] !== undefined ? hits[i + 1] : beats;
        bassAt(t + b * secPerBeat, freq, (next - b) * secPerBeat * 0.95);
      });
    }
    if (L.drums) {
      const pat = DRUM_PATTERNS[track.style];
      if (pat) {
        pat.kick.forEach((b) => b < beats && kickAt(t + b * secPerBeat));
        pat.snare.forEach((b) => b < beats && snareAt(t + b * secPerBeat, pat.snareGain));
        pat.hats.forEach((b) => b < beats && hatAt(t + b * secPerBeat, pat.hatGain));
      }
    }
    if (L.guitar) strumAt(t, guitarTriadFreqs(chord.root, chord.quality), 0.3);

    // UI highlight
    const delay = Math.max(0, (t - trackNow()) * 1000);
    uiTimersRef.current.push(setTimeout(() => setBar(barIdx % chords.length), delay));
  };

  const start = async () => {
    await unlockAudio();
    stopAll();
    openTrackBus();
    const secPerBeat = 60 / bpm;
    const barDur = track.beatsPerBar * secPerBeat;
    startRef.current = trackNow() + 0.15;
    nextBarRef.current = 0;
    setBar(0);
    const pump = () => {
      const horizon = trackNow() + 0.6;
      while (startRef.current + nextBarRef.current * barDur < horizon) {
        scheduleBar(nextBarRef.current, startRef.current + nextBarRef.current * barDur, secPerBeat);
        nextBarRef.current += 1;
      }
    };
    pump();
    schedRef.current = setInterval(pump, 150);
    setPlaying(true);
  };

  const stop = () => {
    stopAll();
    setPlaying(false);
  };

  // Restart cleanly when track / key / tempo change during playback.
  useEffect(() => {
    if (playing) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, keyName, bpm]);

  const selectTrack = (t: PracticeTrack) => {
    const wasPlaying = playing;
    stop();
    setTrackId(t.id);
    setKeyName(t.key);
    setBpm(t.bpm);
    setBar(0);
    if (wasPlaying) setTimeout(() => start(), 50);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <Link href="/" className="text-sm text-bronze">← Today</Link>
      <h1 className="mt-3 mb-1 font-display text-[33px] font-semibold text-espresso">Practice Tracks</h1>
      <p className="mb-6 text-sm text-muted">
        Play with a worship team, not just a click — synthesized pad, drums and bass at real modern-worship tempos.
      </p>

      {/* player */}
      <div className="rounded-[22px] p-6 text-center text-cream lg:p-8" style={{ background: "radial-gradient(circle at 50% 38%,#4A2E18 0%,#2C1810 60%,#1A0E08 100%)", boxShadow: "0 16px 36px rgba(44,24,16,.28)" }}>
        <div className="kicker mb-1 text-[11px] text-amber">{track.title} · {keyName} · {bpm} BPM · {track.beatsPerBar === 3 ? "3/4" : track.beatsPerBar === 6 ? "6/8" : "4/4"}</div>
        <p className="mb-4 text-xs text-[#c9b49a]">{track.practiceGoal}</p>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-2.5">
          {chords.map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl font-display text-xl font-semibold transition-all"
                style={playing && bar === i
                  ? { background: "#D4A96A", color: "#2C1810", transform: "scale(1.08)", boxShadow: "0 6px 18px rgba(212,169,106,.45)" }
                  : { background: "rgba(255,255,255,.08)", color: "#F5E6D0" }}
              >
                {c.name}
              </span>
              <span className="mt-1 text-[11px] text-[#c9b49a]">{track.degrees[i]}</span>
            </div>
          ))}
        </div>

        {/* layer toggles */}
        <div className="mb-5 flex justify-center gap-2">
          {(Object.keys(layers) as (keyof Layers)[]).map((k) => (
            <button
              key={k}
              onClick={() => setLayers((l) => ({ ...l, [k]: !l[k] }))}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition-colors"
              style={layers[k] ? { background: "rgba(212,169,106,.9)", color: "#2C1810" } : { background: "rgba(255,255,255,.1)", color: "#C9B49A" }}
            >
              {k}
            </button>
          ))}
        </div>

        <button
          onClick={playing ? stop : start}
          className="rounded-full px-10 py-3 text-sm font-bold text-espresso"
          style={{ background: "#D4A96A", boxShadow: "0 8px 22px rgba(212,169,106,.4)" }}
        >
          {playing ? "Stop" : "Play"}
        </button>
      </div>

      {/* key + tempo */}
      <div className="mt-5 space-y-4">
        <div>
          <div className="kicker mb-2 text-[12px] text-muted">Key</div>
          <div className="flex flex-wrap gap-2">
            {MAJOR_KEYS.map((k) => (
              <button key={k} onClick={() => setKeyName(k)}
                className="rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors"
                style={k === keyName ? { background: "#5C3A1E", color: "#F5E6D0", borderColor: "#5C3A1E" } : { background: "#fff", borderColor: "#EADFC9", color: "#5C3A1E" }}>
                {k}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="kicker mb-2 text-[12px] text-muted">Tempo · {bpm} BPM</div>
          <input type="range" min={track.minBpm} max={track.maxBpm} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-full accent-[#B8834A]" />
        </div>
      </div>

      {/* track list */}
      <div className="mt-8">
        <div className="kicker mb-3 text-[12px] text-muted">Tracks</div>
        <div className="flex flex-col gap-3">
          {TRACKS.map((t) => {
            const active = t.id === trackId;
            return (
              <button key={t.id} onClick={() => selectTrack(t)}
                className="rounded-[16px] border p-4 text-left transition-all"
                style={active ? { background: "linear-gradient(135deg,#4A2E18,#2C1810)", borderColor: "#4A2E18", color: "#F5E6D0" } : { background: "#fff", borderColor: "#EADFC9" }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg font-semibold" style={{ color: active ? "#F5E6D0" : "#2C1810" }}>{t.title}</div>
                    <div className="mt-0.5 text-xs" style={{ color: active ? "#c9b49a" : "#8B7355" }}>{t.vibe}</div>
                  </div>
                  <div className="flex-none text-right text-xs" style={{ color: active ? "#C89B5C" : "#A08966" }}>
                    {t.bpm} BPM<br />{t.beatsPerBar === 3 ? "3/4" : t.beatsPerBar === 6 ? "6/8" : "4/4"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-faint">
        Pair these with the Module 2 lessons: The Modern Ballad and Pushes &amp; Syncopation.
      </p>
    </div>
  );
}
