"use client";

import { useEffect, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { defaultProgress, defaultProfile, SKILL_LEVELS, type Progress, type Profile, type SkillLevel } from "@/lib/progress";

const TRACKS: { label: string; prefix: string; total: number }[] = [
  { label: "Beginner's Path", prefix: "b", total: 12 },
  { label: "Rhythm & Foundation", prefix: "i", total: 16 },
  { label: "Lead Guitar for Worship", prefix: "a", total: 20 },
];

export default function ProgressPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([
      fetch("/api/progress").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([p, pr]) => {
        if (cancelled) return;
        if (p?.progress) setProgress({ ...defaultProgress, ...p.progress });
        if (pr?.profile) {
          setProfile({
            ...defaultProfile,
            ...pr.profile,
            displayName: pr.profile.displayName || user?.firstName || "",
          });
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.profile) setProfile({ ...defaultProfile, ...data.profile });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const totalLessons = TRACKS.reduce((n, t) => n + t.total, 0);
  const lessonsDone = progress.completedLessons.length;

  return (
    <div className="px-4 py-8 lg:px-12 lg:py-12">
      <h1 className="font-[var(--font-playfair)] text-2xl lg:text-4xl font-bold mb-2">
        Your Progress
      </h1>
      <p className="text-warm-gray mb-8">Faithful practice, faithful growth.</p>

      {/* Signed-out prompt */}
      {isLoaded && !isSignedIn && (
        <div className="rounded-xl border border-gold/30 bg-navy p-8 text-center">
          <p className="text-lg text-cream mb-2 font-[var(--font-playfair)]">
            Sign in to track your journey
          </p>
          <p className="text-sm text-gray-300 mb-6 max-w-md mx-auto">
            Create a free account to save your streak, completed lessons, and practice
            history — synced across every device you use.
          </p>
          <SignInButton mode="modal">
            <button className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-dark">
              Sign in / Create account
            </button>
          </SignInButton>
        </div>
      )}

      {isSignedIn && (
        loading ? (
          <p className="text-warm-gray">Loading your progress…</p>
        ) : (
          <>
            {/* Profile basics */}
            <div className="rounded-xl border border-gold/20 p-6 mb-8">
              <h2 className="font-semibold mb-4">Profile</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-warm-gray">Display name</span>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
                    placeholder="Your name"
                    className="mt-1 w-full rounded-md border border-gold/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold/60"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-warm-gray">Skill level</span>
                  <select
                    value={profile.skillLevel}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, skillLevel: e.target.value as SkillLevel }))
                    }
                    className="mt-1 w-full rounded-md border border-gold/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold/60"
                  >
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl} className="bg-navy">
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="mt-4 rounded-full bg-gold px-5 py-2 text-sm font-medium text-navy transition-colors hover:bg-gold-dark disabled:opacity-60"
              >
                {savingProfile ? "Saving…" : "Save profile"}
              </button>
            </div>

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
                <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
                  <div className="rounded-xl border border-gold/20 p-4">
                    <p className="text-2xl font-bold text-gold">{progress.currentStreak}</p>
                    <p className="text-xs text-warm-gray mt-1">Day Streak</p>
                  </div>
                  <div className="rounded-xl border border-gold/20 p-4">
                    <p className="text-2xl font-bold text-gold">{progress.longestStreak}</p>
                    <p className="text-xs text-warm-gray mt-1">Best Streak</p>
                  </div>
                  <div className="rounded-xl border border-gold/20 p-4">
                    <p className="text-2xl font-bold text-gold">{progress.totalMinutes}</p>
                    <p className="text-xs text-warm-gray mt-1">Total Minutes</p>
                  </div>
                  <div className="rounded-xl border border-gold/20 p-4">
                    <p className="text-2xl font-bold text-gold">
                      {lessonsDone}/{totalLessons}
                    </p>
                    <p className="text-xs text-warm-gray mt-1">Lessons Done</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gold/20 p-6 mb-8">
                  <h2 className="font-semibold mb-4">Curriculum Progress</h2>
                  <div className="space-y-4">
                    {TRACKS.map((track) => {
                      const done = progress.completedLessons.filter((id) =>
                        id.startsWith(track.prefix)
                      ).length;
                      return (
                        <div key={track.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{track.label}</span>
                            <span className="text-warm-gray">
                              {done}/{track.total}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-navy/50">
                            <div
                              className="h-2 rounded-full bg-gold transition-all"
                              style={{ width: `${Math.min(100, (done / track.total) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
                {progress.history.length === 0 ? (
                  <p className="text-warm-gray">
                    No practice logged yet. Head to the Practice tab and complete an exercise!
                  </p>
                ) : (
                  progress.history.map((entry) => (
                    <div key={entry.date} className="rounded-lg border border-gold/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-warm-gray mt-1">
                            {entry.exercises} exercise{entry.exercises === 1 ? "" : "s"} completed
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-gold">{entry.minutes} min</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
