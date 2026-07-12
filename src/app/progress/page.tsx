"use client";

import { useState } from "react";

interface ProgressEntry {
  date: string;
  minutes: number;
  exercises: number;
}

// Mock data — in production this would come from local storage or a backend
const mockProgress: ProgressEntry[] = [
  { date: "2024-12-09", minutes: 25, exercises: 4 },
  { date: "2024-12-08", minutes: 30, exercises: 5 },
  { date: "2024-12-07", minutes: 15, exercises: 3 },
  { date: "2024-12-06", minutes: 0, exercises: 0 },
  { date: "2024-12-05", minutes: 20, exercises: 4 },
  { date: "2024-12-04", minutes: 35, exercises: 6 },
  { date: "2024-12-03", minutes: 25, exercises: 4 },
];

const stats = {
  currentStreak: 3,
  longestStreak: 7,
  totalMinutes: 150,
  lessonsCompleted: 8,
  totalLessons: 48,
};

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

  return (
    <div className="px-4 py-8 lg:px-12 lg:py-12">
      <h1 className="font-[var(--font-playfair)] text-2xl lg:text-4xl font-bold mb-2">
        Your Progress
      </h1>
      <p className="text-warm-gray mb-8">
        Faithful practice, faithful growth.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab("overview")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "overview" ? "bg-gold text-navy" : "bg-navy/50 text-gray-300 hover:bg-navy"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "history" ? "bg-gold text-navy" : "bg-navy/50 text-gray-300 hover:bg-navy"
          }`}
        >
          History
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
            <div className="rounded-xl border border-gold/20 p-4">
              <p className="text-2xl font-bold text-gold">{stats.currentStreak}</p>
              <p className="text-xs text-warm-gray mt-1">Day Streak</p>
            </div>
            <div className="rounded-xl border border-gold/20 p-4">
              <p className="text-2xl font-bold text-gold">{stats.longestStreak}</p>
              <p className="text-xs text-warm-gray mt-1">Best Streak</p>
            </div>
            <div className="rounded-xl border border-gold/20 p-4">
              <p className="text-2xl font-bold text-gold">{stats.totalMinutes}</p>
              <p className="text-xs text-warm-gray mt-1">Total Minutes</p>
            </div>
            <div className="rounded-xl border border-gold/20 p-4">
              <p className="text-2xl font-bold text-gold">{stats.lessonsCompleted}/{stats.totalLessons}</p>
              <p className="text-xs text-warm-gray mt-1">Lessons Done</p>
            </div>
          </div>

          {/* Curriculum Progress */}
          <div className="rounded-xl border border-gold/20 p-6 mb-8">
            <h2 className="font-semibold mb-4">Curriculum Progress</h2>
            <div className="space-y-4">
              {[
                { label: "Beginner's Path", done: 8, total: 12 },
                { label: "Rhythm & Foundation", done: 0, total: 16 },
                { label: "Lead Guitar for Worship", done: 0, total: 20 },
              ].map((track) => (
                <div key={track.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{track.label}</span>
                    <span className="text-warm-gray">{track.done}/{track.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-navy/50">
                    <div
                      className="h-2 rounded-full bg-gold transition-all"
                      style={{ width: `${(track.done / track.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Encouragement */}
          <div className="rounded-xl bg-navy p-6 text-center">
            <p className="text-gold font-[var(--font-playfair)] text-lg italic">
              &ldquo;Whatever you do, work at it with all your heart, as working for the Lord.&rdquo;
            </p>
            <p className="text-warm-gray text-sm mt-2">Colossians 3:23</p>
          </div>
        </>
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          {mockProgress.map((entry) => (
            <div
              key={entry.date}
              className={`rounded-lg border p-4 ${
                entry.minutes > 0 ? "border-gold/20" : "border-gold/5 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {entry.minutes > 0 ? (
                    <p className="text-sm text-warm-gray mt-1">
                      {entry.exercises} exercises completed
                    </p>
                  ) : (
                    <p className="text-sm text-warm-gray mt-1">Rest day</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gold">
                    {entry.minutes > 0 ? `${entry.minutes} min` : "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
