"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ALL_LESSONS, MODULES } from "@/lib/curriculum";
import type { Progress } from "@/lib/progress";
import { defaultProgress } from "@/lib/progress";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const PlayIcon = ({ size = 16, color = "#2C1810" }: { size?: number; color?: string }) => (
  <svg width={size} height={(size / 16) * 18} viewBox="0 0 16 18"><path d="M2 2l12 7-12 7V2z" fill={color} /></svg>
);

export default function TodayPage() {
  const { user, isSignedIn } = useUser();
  const [progress, setProgress] = useState<Progress>(defaultProgress);

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !cancelled && d?.progress && setProgress({ ...defaultProgress, ...d.progress }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  const firstName = user?.firstName || "friend";
  const done = new Set(progress.completedLessons);
  const nextLesson = ALL_LESSONS.find((l) => !done.has(l.id)) ?? ALL_LESSONS[ALL_LESSONS.length - 1];
  const nextModule = MODULES.find((m) => m.lessons.some((l) => l.id === nextLesson.id));
  const overallPct = Math.round((progress.completedLessons.length / ALL_LESSONS.length) * 100);

  const today = new Date().toISOString().slice(0, 10);
  const last7 = new Set(
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    })
  );
  const weekEntries = progress.history.filter((h) => last7.has(h.date));
  const weeklyMinutes = weekEntries.reduce((n, h) => n + h.minutes, 0);
  const daysPracticed = weekEntries.filter((h) => h.minutes > 0).length;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-16 pb-10 lg:px-10 lg:pt-9">
      {/* Mobile top bar */}
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2.5">
          <Image src="/icons/icon-192.png" alt="" width={30} height={30} className="rounded-lg" />
          <span className="font-display text-[19px] font-bold text-espresso">Sacred Strings</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border-warm bg-white px-3 py-1.5" style={{ boxShadow: "0 1px 3px rgba(92,58,30,.06)" }}>
          <svg width="15" height="17" viewBox="0 0 15 17" fill="none"><path d="M7.5 1C7.5 1 3 5 3 9.5a4.5 4.5 0 009 0C12 7 9.5 5.5 9.5 3c-1 1-2 1.5-2 3.5C6 6 6 4 7.5 1z" fill="#C89B5C" /></svg>
          <span className="text-sm font-bold text-chestnut">{progress.currentStreak}</span>
        </div>
      </div>

      {/* Greeting + (desktop) search */}
      <div className="mb-4 flex items-start justify-between lg:mb-8">
        <div>
          <div className="text-sm font-medium text-muted">{greeting()}, {firstName}</div>
          <h1 className="font-display text-[33px] font-semibold leading-tight text-espresso lg:text-[38px]">Peace be with you.</h1>
        </div>
        <div className="hidden items-center gap-2.5 rounded-[11px] border border-border-warm-2 bg-white px-4 py-2.5 lg:flex" style={{ width: 220 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#B8A585" strokeWidth="1.6" /><path d="M11 11l3 3" stroke="#B8A585" strokeWidth="1.6" strokeLinecap="round" /></svg>
          <span className="text-sm text-faint-2">Search lessons &amp; songs</span>
        </div>
      </div>

      {/* Verse (mobile) */}
      <div className="mb-6 border-l-2 pl-3.5 lg:hidden" style={{ borderColor: "#D4A96A" }}>
        <p className="font-display text-[18px] italic leading-snug text-chestnut">&ldquo;Sing to him a new song; play skillfully, and shout for joy.&rdquo;</p>
        <p className="kicker mt-1.5 text-xs text-faint">Psalm 33:3</p>
      </div>

      {/* Continue card / hero */}
      <Link href={`/lesson/${nextLesson.id}`} className="mb-6 block overflow-hidden rounded-[22px] p-6 text-cream lg:flex lg:items-center lg:gap-8 lg:p-9"
        style={{ background: "linear-gradient(135deg,#4A2E18 0%,#2C1810 100%)", boxShadow: "0 16px 36px rgba(44,24,16,.28)", position: "relative" }}>
        <span aria-hidden className="pointer-events-none absolute rounded-full" style={{ right: -40, top: -50, width: 240, height: 240, border: "1px solid rgba(212,169,106,.14)" }} />
        <span aria-hidden className="pointer-events-none absolute rounded-full" style={{ right: 0, top: -20, width: 180, height: 180, border: "1px dashed rgba(212,169,106,.18)" }} />
        <div className="relative flex-1">
          <div className="kicker mb-2 text-[11px] text-amber">Continue · {nextModule?.title ?? "Lesson"}</div>
          <div className="font-display text-[26px] font-semibold leading-tight lg:text-[40px]">{nextLesson.title}</div>
          <div className="mt-1 mb-4 text-[13px] text-[#c9b49a] lg:text-[15px]">{nextLesson.subtitle}</div>
          <div className="flex items-center gap-3.5 lg:hidden">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full" style={{ background: "#D4A96A", boxShadow: "0 4px 12px rgba(212,169,106,.4)" }}>
              <PlayIcon />
            </span>
            <div className="flex-1">
              <div className="mb-1.5 flex justify-between text-[11px] text-[#c9b49a]"><span>{overallPct}% complete</span><span>{nextLesson.minutes} min</span></div>
              <div className="h-[5px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.15)" }}><div className="h-full rounded-full" style={{ width: `${overallPct}%`, background: "linear-gradient(90deg,#D4A96A,#E8C78E)" }} /></div>
            </div>
          </div>
          {/* desktop progress */}
          <div className="mt-5 hidden max-w-[440px] lg:block">
            <div className="mb-1.5 flex justify-between text-xs text-[#c9b49a]"><span>{overallPct}% complete</span><span>{nextLesson.minutes} min</span></div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.15)" }}><div className="h-full rounded-full" style={{ width: `${overallPct}%`, background: "linear-gradient(90deg,#D4A96A,#E8C78E)" }} /></div>
          </div>
        </div>
        <div className="relative hidden flex-col items-center gap-3 lg:flex">
          <span className="flex h-[84px] w-[84px] items-center justify-center rounded-full" style={{ background: "#D4A96A", boxShadow: "0 10px 26px rgba(212,169,106,.4)" }}><PlayIcon size={26} /></span>
          <span className="text-[13px] font-semibold text-[#e9d9c0]">Resume</span>
        </div>
      </Link>

      {/* Stat tiles */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <StatTile value={`${weeklyMinutes}`} suffix=" min" label="this week" />
        <StatTile value={`${daysPracticed}`} suffix="/7" label="days practiced" />
        <div className="hidden lg:block"><StatTile value={`${progress.currentStreak}`} label="day streak" /></div>
      </div>

      {/* Practice tools (mobile) */}
      <div className="lg:hidden">
        <div className="kicker mb-3 text-[13px] text-muted">Practice Tools</div>
        <div className="grid grid-cols-3 gap-3">
          <ToolTile href="/looper" label="Looper" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 3l3 3-3 3M4 11v-1a4 4 0 014-4h12M7 21l-3-3 3-3M20 13v1a4 4 0 01-4 4H4" stroke="#C89B5C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
          <ToolTile href="/capo" label="Capo & Keys" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" stroke="#C89B5C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
          <ToolTile href="/metronome" label="Metronome" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#C89B5C" strokeWidth="1.6" /><path d="M12 12V6M12 12l4 3" stroke="#5C3A1E" strokeWidth="1.6" strokeLinecap="round" /></svg>} />
          <ToolTile href="/tuner" label="Tuner" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M8 6v12M16 6v12M4 9v6M20 9v6" stroke="#C89B5C" strokeWidth="1.6" strokeLinecap="round" /></svg>} />
          <ToolTile href="/chords" label="Chords" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#C89B5C" strokeWidth="1.6" /><path d="M8 8h8M8 12h8M8 16h5" stroke="#5C3A1E" strokeWidth="1.6" strokeLinecap="round" /></svg>} />
        </div>
      </div>

      {/* Desktop two-column: journey + rail */}
      <div className="mt-2 hidden grid-cols-[1.6fr_1fr] gap-7 lg:grid">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-espresso">Your Journey</h2>
            <span className="text-[13px] font-semibold text-bronze">{overallPct}% complete</span>
          </div>
          <div className="flex flex-col gap-3">
            {MODULES.map((m) => {
              const total = m.lessons.length;
              const completed = m.lessons.filter((l) => done.has(l.id)).length;
              const isCurrent = m.lessons.some((l) => l.id === nextLesson.id);
              const isComplete = completed === total;
              return (
                <Link key={m.id} href="/journey" className="flex items-center gap-4 rounded-[14px] p-4"
                  style={isCurrent && !isComplete
                    ? { background: "linear-gradient(135deg,#4A2E18,#2C1810)", color: "#F5E6D0", boxShadow: "0 10px 22px rgba(44,24,16,.22)" }
                    : { background: isComplete ? "#fff" : "#FAF4EA", border: "1px solid #EADFC9", opacity: !isComplete && !isCurrent ? 0.7 : 1 }}>
                  <ModuleNode complete={isComplete} current={isCurrent && !isComplete} />
                  <div className="flex-1">
                    <div className="font-display text-[19px] font-semibold" style={{ color: isCurrent && !isComplete ? "#F5E6D0" : isComplete ? "#2C1810" : "#6B5844" }}>{m.title}</div>
                    <div className="text-[13px]" style={{ color: isCurrent && !isComplete ? "#c9b49a" : "#8B7355" }}>{m.subtitle}</div>
                  </div>
                  <span className="text-xs" style={{ color: isCurrent && !isComplete ? "#c9b49a" : "#A08966" }}>{completed} / {total}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-[18px] border border-border-warm-2 p-6" style={{ background: "linear-gradient(155deg,#F3E7D4,#EFE0C9)" }}>
            <div className="kicker mb-3 text-[11px] text-bronze">Verse of the day</div>
            <p className="font-display text-[23px] italic leading-snug text-cocoa">&ldquo;Sing to him a new song; play skillfully, and shout for joy.&rdquo;</p>
            <p className="kicker mt-3 text-[13px] text-faint">Psalm 33:3</p>
          </div>
          <div className="rounded-[18px] border border-border-warm bg-white p-5">
            <h3 className="mb-3.5 font-display text-xl font-semibold text-espresso">Up next</h3>
            <div className="flex flex-col gap-3.5">
              {ALL_LESSONS.filter((l) => !done.has(l.id)).slice(0, 3).map((l) => (
                <Link key={l.id} href={`/lesson/${l.id}`} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px]" style={{ background: "#F3E7D4" }}><PlayIcon size={15} color="#B8834A" /></span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-espresso">{l.title}</div>
                    <div className="text-xs text-muted">{l.kicker?.split("·").pop()?.trim()} · {l.minutes} min</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ value, suffix, label }: { value: string; suffix?: string; label: string }) {
  return (
    <div className="rounded-[16px] border border-border-warm bg-white p-4 lg:p-5">
      <div className="font-display text-[28px] font-bold leading-none text-chestnut lg:text-[34px]">
        {value}
        {suffix && <span className="text-base text-faint-2 lg:text-xl">{suffix}</span>}
      </div>
      <div className="mt-1.5 text-xs text-muted lg:text-[13px]">{label}</div>
    </div>
  );
}

function ToolTile({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex-1 rounded-[16px] border border-border-warm bg-white px-2.5 py-4 text-center">
      <div className="mb-1.5 flex justify-center">{icon}</div>
      <div className="text-xs font-semibold text-[#3D2B1F]">{label}</div>
    </Link>
  );
}

function ModuleNode({ complete, current }: { complete: boolean; current: boolean }) {
  if (complete)
    return (
      <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full" style={{ background: "#5C3A1E" }}>
        <svg width="15" height="15" viewBox="0 0 16 16"><path d="M3 8l3.5 3.5L13 4" stroke="#F5E6D0" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  if (current)
    return (
      <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full" style={{ background: "#D4A96A", boxShadow: "0 0 0 5px rgba(212,169,106,.2)" }}>
        <span className="h-[11px] w-[11px] rounded-full" style={{ background: "#2C1810" }} />
      </span>
    );
  return (
    <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full" style={{ background: "#EADFC9" }}>
      <svg width="13" height="15" viewBox="0 0 13 15" fill="none"><rect x="1.5" y="6" width="10" height="8" rx="2" stroke="#B8A585" strokeWidth="1.6" /><path d="M4 6V4a2.5 2.5 0 015 0v2" stroke="#B8A585" strokeWidth="1.6" /></svg>
    </span>
  );
}
