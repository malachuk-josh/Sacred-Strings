"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MODULES, ALL_LESSONS } from "@/lib/curriculum";
import { defaultProgress, type Progress } from "@/lib/progress";

export default function JourneyPage() {
  const { isSignedIn } = useUser();
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [userToggled, setUserToggled] = useState(false);

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

  const done = new Set(progress.completedLessons);
  const nextLesson = ALL_LESSONS.find((l) => !done.has(l.id)) ?? ALL_LESSONS[ALL_LESSONS.length - 1];
  const currentModule = MODULES.find((m) => m.lessons.some((l) => l.id === nextLesson.id));
  const overallPct = Math.round((progress.completedLessons.length / ALL_LESSONS.length) * 100);

  // Auto-expand the current module until the user takes over.
  useEffect(() => {
    if (!userToggled && currentModule) setExpanded(currentModule.id);
  }, [currentModule, userToggled]);

  const moduleStates = MODULES.map((m, idx) => {
    const total = m.lessons.length;
    const completed = m.lessons.filter((l) => done.has(l.id)).length;
    const isComplete = completed === total;
    const isCurrent = m.lessons.some((l) => l.id === nextLesson.id);
    const priorComplete = MODULES.slice(0, idx).every((pm) => pm.lessons.every((l) => done.has(l.id)));
    const locked = !isComplete && !isCurrent && !priorComplete;
    const minutes = m.lessons.reduce((n, l) => n + l.minutes, 0);
    return { module: m, total, completed, isComplete, isCurrent, locked, minutes };
  });

  const toggle = (id: string, locked: boolean) => {
    if (locked) return;
    setUserToggled(true);
    setExpanded((e) => (e === id ? null : id));
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <div className="text-sm font-medium text-muted">Beginner to Worship Leader</div>
      <h1 className="font-display text-[33px] font-semibold leading-tight text-espresso lg:text-[40px]">Your Journey</h1>
      <div className="mb-5 mt-1.5 flex items-center gap-2.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "#E5D8C0" }}>
          <div className="h-full rounded-full" style={{ width: `${overallPct}%`, background: "linear-gradient(90deg,#B8834A,#D4A96A)" }} />
        </div>
        <span className="text-[13px] font-semibold text-muted">{overallPct}%</span>
      </div>

      {/* Continue CTA */}
      <Link
        href={`/lesson/${nextLesson.id}`}
        className="mb-8 flex items-center gap-4 rounded-[16px] p-4 text-cream"
        style={{ background: "linear-gradient(135deg,#4A2E18,#2C1810)", boxShadow: "0 10px 24px rgba(44,24,16,.25)" }}
      >
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full" style={{ background: "#D4A96A", boxShadow: "0 4px 12px rgba(212,169,106,.4)" }}>
          <svg width="14" height="16" viewBox="0 0 16 18"><path d="M2 2l12 7-12 7V2z" fill="#2C1810" /></svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="kicker block text-[10px] text-amber">Continue</span>
          <span className="block truncate font-display text-lg font-semibold">{nextLesson.title}</span>
        </span>
        <span className="text-xs text-[#c9b49a]">{nextLesson.minutes} min</span>
      </Link>

      {/* timeline */}
      <div className="relative pl-11">
        <div
          className="absolute w-0.5"
          style={{
            left: 15,
            top: 14,
            bottom: 14,
            background: `linear-gradient(180deg,#C89B5C 0%,#C89B5C ${overallPct}%,#E5D8C0 ${overallPct}%,#E5D8C0 100%)`,
          }}
        />
        {moduleStates.map(({ module: m, total, completed, isComplete, isCurrent, locked, minutes }) => {
          const isOpen = expanded === m.id && !locked;
          const dark = isCurrent && !isComplete;
          return (
            <div key={m.id} className="relative mb-5">
              <span className="absolute" style={{ left: dark ? -40 : -38, top: dark ? 0 : 2 }}>
                <TimelineNode complete={isComplete} current={dark} />
              </span>

              {/* module card */}
              <button
                onClick={() => toggle(m.id, locked)}
                className="w-full rounded-[16px] p-4 text-left"
                style={
                  dark
                    ? { background: "linear-gradient(155deg,#4A2E18,#2C1810)", color: "#F5E6D0", boxShadow: "0 10px 24px rgba(44,24,16,.28)" }
                    : { background: isComplete ? "#fff" : "#FAF4EA", border: "1px solid #EADFC9", opacity: locked ? 0.72 : 1 }
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="kicker mb-1 text-[11px]" style={{ color: dark ? "#C89B5C" : locked ? "#B8A585" : "#A08966" }}>
                      Module {m.num} · {isComplete ? "Complete" : dark ? "In Progress" : locked ? "Locked" : "Available"}
                    </div>
                    <div className="font-display text-[20px] font-semibold lg:text-[22px]" style={{ color: dark ? "#F5E6D0" : locked ? "#6B5844" : "#2C1810" }}>{m.title}</div>
                    <div className="mt-0.5 text-[13px]" style={{ color: dark ? "#c9b49a" : locked ? "#A08966" : "#8B7355" }}>{m.subtitle}</div>
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1.5">
                    <span className="text-xs" style={{ color: dark ? "#c9b49a" : "#A08966" }}>{completed} / {total} · {minutes} min</span>
                    {!locked && (
                      <svg width="14" height="9" viewBox="0 0 14 9" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                        <path d="M1 1l6 6 6-6" stroke={dark ? "#C89B5C" : "#B8834A"} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                {dark && (
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="h-[5px] flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.15)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(completed / total) * 100}%`, background: "#D4A96A" }} />
                    </div>
                  </div>
                )}
              </button>

              {/* expanded lesson list */}
              {isOpen && (
                <div className="mt-2 overflow-hidden rounded-[14px] border border-border-warm bg-white">
                  {m.lessons.map((l, li) => {
                    const isDone = done.has(l.id);
                    const isNext = l.id === nextLesson.id;
                    return (
                      <Link
                        key={l.id}
                        href={`/lesson/${l.id}`}
                        className="flex items-center gap-3 border-b border-border-warm px-4 py-3 last:border-b-0"
                        style={isNext ? { background: "#FBF3E3" } : undefined}
                      >
                        <span
                          className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[12px] font-bold"
                          style={isDone ? { background: "#5C3A1E", color: "#F5E6D0" } : isNext ? { background: "#D4A96A", color: "#2C1810" } : { background: "#F3E7D4", color: "#8B7355" }}
                        >
                          {isDone ? "✓" : li + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-espresso">{l.title}</span>
                          <span className="block truncate text-xs text-muted">{l.subtitle}</span>
                        </span>
                        <span className="flex-none text-xs text-faint">{l.minutes} min</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineNode({ complete, current }: { complete: boolean; current: boolean }) {
  if (complete)
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "#5C3A1E" }}>
        <svg width="15" height="15" viewBox="0 0 16 16"><path d="M3 8l3.5 3.5L13 4" stroke="#F5E6D0" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  if (current)
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#D4A96A", boxShadow: "0 0 0 5px rgba(212,169,106,.25)" }}>
        <span className="h-[11px] w-[11px] rounded-full" style={{ background: "#2C1810" }} />
      </span>
    );
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "#EADFC9" }}>
      <svg width="13" height="15" viewBox="0 0 13 15" fill="none"><rect x="1.5" y="6" width="10" height="8" rx="2" stroke="#B8A585" strokeWidth="1.6" /><path d="M4 6V4a2.5 2.5 0 015 0v2" stroke="#B8A585" strokeWidth="1.6" /></svg>
    </span>
  );
}
