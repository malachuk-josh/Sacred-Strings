"use client";

import { useEffect, useState } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { ALL_LESSONS, MODULES } from "@/lib/curriculum";
import { defaultProgress, defaultProfile, SKILL_LEVELS, type Progress, type Profile, type SkillLevel } from "@/lib/progress";

export default function ProfilePage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        if (pr?.profile) setProfile({ ...defaultProfile, ...pr.profile, displayName: pr.profile.displayName || user?.firstName || "" });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user]);

  const saveProfile = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const d = await res.json();
        if (d?.profile) setProfile({ ...defaultProfile, ...d.profile });
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const lessonsDone = progress.completedLessons.length;
  const chordsLearned = progress.completedLessons.filter((id) => {
    const l = ALL_LESSONS.find((x) => x.id === id);
    return l?.chords?.length;
  }).length;

  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <div className="text-sm font-medium text-muted">Your account</div>
      <h1 className="mb-6 font-display text-[33px] font-semibold leading-tight text-espresso lg:text-[40px]">Profile</h1>

      {isLoaded && !isSignedIn && (
        <div className="rounded-[20px] p-8 text-center text-cream" style={{ background: "linear-gradient(155deg,#4A2E18,#2C1810)", boxShadow: "0 16px 36px rgba(44,24,16,.28)" }}>
          <p className="mb-2 font-display text-xl">Sign in to track your journey</p>
          <p className="mx-auto mb-6 max-w-md text-sm text-[#c9b49a]">
            Create a free account to save your streak, completed lessons, and practice history — synced across every device.
          </p>
          <SignInButton mode="modal">
            <button className="rounded-full px-6 py-2.5 text-sm font-semibold text-espresso" style={{ background: "#D4A96A" }}>Sign in / Create account</button>
          </SignInButton>
        </div>
      )}

      {isSignedIn && (loading ? (
        <p className="text-muted">Loading your profile…</p>
      ) : (
        <>
          {/* identity row */}
          <div className="mb-6 flex items-center gap-4 rounded-[18px] border border-border-warm bg-white p-5">
            <UserButton appearance={{ elements: { avatarBox: { width: 52, height: 52 } } }} />
            <div className="flex-1">
              <div className="font-display text-[22px] font-semibold text-espresso">{profile.displayName || user?.fullName || "Worship musician"}</div>
              <div className="text-sm capitalize text-muted">{profile.skillLevel} · {user?.primaryEmailAddress?.emailAddress}</div>
            </div>
          </div>

          {/* stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat value={progress.currentStreak} label="Day streak" />
            <Stat value={progress.longestStreak} label="Best streak" />
            <Stat value={progress.totalMinutes} label="Total minutes" />
            <Stat value={`${lessonsDone}/${ALL_LESSONS.length}`} label="Lessons done" />
          </div>

          {/* journey progress by module */}
          <div className="mb-6 rounded-[18px] border border-border-warm bg-white p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-espresso">Curriculum Progress</h2>
            <div className="space-y-4">
              {MODULES.map((m) => {
                const total = m.lessons.length;
                const done = m.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
                return (
                  <div key={m.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-espresso">{m.title}</span>
                      <span className="text-muted">{done}/{total}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full" style={{ background: "#E5D8C0" }}>
                      <div className="h-full rounded-full" style={{ width: `${(done / total) * 100}%`, background: "linear-gradient(90deg,#B8834A,#D4A96A)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-xs text-muted">{chordsLearned} chords learned</div>
          </div>

          {/* editable profile */}
          <div className="mb-6 rounded-[18px] border border-border-warm bg-white p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-espresso">Edit profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-muted">Display name</span>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => { setProfile((p) => ({ ...p, displayName: e.target.value })); setSaved(false); }}
                  placeholder="Your name"
                  className="mt-1 w-full rounded-[10px] border border-border-warm bg-parchment px-3 py-2 text-sm text-espresso outline-none focus:border-bronze"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Skill level</span>
                <select
                  value={profile.skillLevel}
                  onChange={(e) => { setProfile((p) => ({ ...p, skillLevel: e.target.value as SkillLevel })); setSaved(false); }}
                  className="mt-1 w-full rounded-[10px] border border-border-warm bg-parchment px-3 py-2 text-sm capitalize text-espresso outline-none focus:border-bronze"
                >
                  {SKILL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl} className="capitalize">{lvl}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="mt-4 rounded-full px-5 py-2 text-sm font-semibold text-cream disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#5C3A1E,#2C1810)" }}
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save profile"}
            </button>
          </div>

          <div className="rounded-[18px] p-6 text-center" style={{ background: "linear-gradient(155deg,#F3E7D4,#EFE0C9)", border: "1px solid #E5D8C0" }}>
            <p className="font-display text-lg italic text-cocoa">&ldquo;And whatsoever ye do, do it heartily, as to the Lord, and not unto men.&rdquo;</p>
            <p className="kicker mt-2 text-xs text-faint">Colossians 3:23</p>
          </div>
        </>
      ))}
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-[16px] border border-border-warm bg-white p-4">
      <div className="font-display text-[28px] font-bold leading-none text-chestnut">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
