"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

interface Exercise {
  id: string;
  title: string;
  category: string;
  description: string;
  bpm: number;
  duration: number; // seconds
}

const exercises: Exercise[] = [
  { id: "p1", title: "Chromatic Warm-Up", category: "Warm-Up", description: "Four-finger chromatic exercise across all six strings. Focus on even tone and clean fretting.", bpm: 60, duration: 120 },
  { id: "p2", title: "Open Chord Transitions", category: "Chords", description: "Cycle through G → C → D → Em. Aim for smooth transitions with no silence between chords.", bpm: 72, duration: 180 },
  { id: "p3", title: "Arpeggio Pattern (p-i-m-a)", category: "Fingerpicking", description: "Right hand pattern: thumb on bass, then index-middle-ring on treble strings. Maintain even volume.", bpm: 80, duration: 150 },
  { id: "p4", title: "G Major Scale (Position 1)", category: "Scales", description: "Play the G major scale in open position. Ascending and descending, two octaves. Use alternating i-m fingers.", bpm: 60, duration: 120 },
  { id: "p5", title: "Pentatonic Box 1", category: "Scales", description: "E minor pentatonic in first position. Practice with quarter notes, then eighth notes.", bpm: 70, duration: 120 },
  { id: "p6", title: "Worship Progression (1-5-6-4)", category: "Worship", description: "In the key of G: G-D-Em-C. Practice with a steady strum, then fingerpicking. Feel the song.", bpm: 72, duration: 240 },
  { id: "p7", title: "Barre Chord Stamina", category: "Chords", description: "Hold F major barre for 30 seconds, release, repeat. Build endurance without tension.", bpm: 0, duration: 180 },
  { id: "p8", title: "Hymn Melody: Be Thou My Vision", category: "Worship", description: "Play the melody on the first three strings. Focus on tone and phrasing — let the melody breathe.", bpm: 66, duration: 180 },
];

export default function PracticePage() {
  const { isSignedIn } = useUser();
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // Load any already-completed exercises for signed-in users.
  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.progress?.completedExercises) {
          setCompleted(new Set<string>(data.progress.completedExercises));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && isRunning && activeExercise) {
        const finished = activeExercise;
        setCompleted((prev) => new Set(prev).add(finished.id));
        setIsRunning(false);
        // Persist for signed-in users; browsing without an account still works locally.
        if (isSignedIn) {
          fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "completeExercise",
              id: finished.id,
              minutes: Math.round(finished.duration / 60),
            }),
          }).catch(() => {});
        }
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, activeExercise, isSignedIn]);

  const startExercise = useCallback((exercise: Exercise) => {
    setActiveExercise(exercise);
    setTimeLeft(exercise.duration);
    setIsRunning(true);
  }, []);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="px-4 py-8 lg:px-12 lg:py-12">
      <h1 className="font-[var(--font-playfair)] text-2xl lg:text-4xl font-bold mb-2">
        Daily Practice
      </h1>
      <p className="text-warm-gray mb-8">
        Consistent practice builds the musician. Choose an exercise and start the timer.
      </p>

      {/* Active Exercise Timer */}
      {activeExercise && (
        <div className="mb-8 rounded-xl border border-gold/30 bg-navy p-6 text-center">
          <h2 className="text-lg font-semibold text-gold mb-1">{activeExercise.title}</h2>
          <p className="text-sm text-gray-300 mb-4">{activeExercise.description}</p>
          {activeExercise.bpm > 0 && (
            <p className="text-xs text-warm-gray mb-4">Target tempo: {activeExercise.bpm} BPM</p>
          )}
          <div className="text-4xl font-mono font-bold text-cream mb-4">
            {formatTime(timeLeft)}
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="rounded-full bg-gold px-6 py-2 text-sm font-medium text-navy transition-colors hover:bg-gold-dark"
            >
              {isRunning ? "Pause" : timeLeft === 0 ? "Done!" : "Resume"}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setActiveExercise(null);
              }}
              className="rounded-full border border-gold/30 px-6 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full bg-navy/50">
          <div
            className="h-2 rounded-full bg-gold transition-all"
            style={{ width: `${(completed.size / exercises.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-warm-gray">
          {completed.size}/{exercises.length}
        </span>
      </div>

      {/* Exercise List */}
      <div className="space-y-3">
        {exercises.map((exercise) => {
          const isDone = completed.has(exercise.id);
          return (
            <button
              key={exercise.id}
              onClick={() => startExercise(exercise)}
              className={`w-full text-left rounded-lg border p-4 transition-all ${
                isDone
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-gold/10 hover:border-gold/30 hover:bg-navy/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                  isDone ? "bg-green-500/20 text-green-400" : "bg-gold/10 text-gold"
                }`}>
                  {isDone ? "✓" : "▶"}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{exercise.title}</h3>
                  <p className="text-sm text-warm-gray mt-0.5">{exercise.description}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs text-warm-gray">{formatTime(exercise.duration)}</span>
                  {exercise.bpm > 0 && (
                    <span className="text-xs text-gold/60">{exercise.bpm} BPM</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
