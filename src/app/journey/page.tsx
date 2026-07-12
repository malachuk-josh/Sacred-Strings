"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MODULES, ALL_LESSONS } from "@/lib/curriculum";
import { defaultProgress, type Progress } from "@/lib/progress";

export default function JourneyPage() {
  const { isSignedIn } = useUser();
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

  const done = new Set(progress.completedLessons);
  const nextLesson = ALL_LESSONS.find((l) => !done.has(l.id)) ?? ALL_LESSONS[ALL_LESSONS.length - 1];
  const overallPct = Math.round((progress.completedLessons.length / ALL_LESSONS.length) * 100);

  // Determine each module's state
  const moduleStates = MODULES.map((m, idx) => {
    const total = m.lessons.length;
    const completed = m.lessons.filter((l) => done.has(l.id)).length;
    const isComplete = completed === total;
    const isCurrent = m.lessons.some((l) => l.id === nextLesson.id);
    // locked if a prior module isn't complete and this isn't current/complete
    const priorComplete = MODULES.slice(0, idx).every((pm) => pm.lessons.every((l) => done.has(l.id)));
    const locked = !isComplete && !isCurrent && !priorComplete;
    return { module: m, total, completed, isComplete, isCurrent, locked };
  });

  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <div className="text-sm font-medium text-muted">Beginner to Worship Leader</div>
      <h1 className="font-display text-[33px] font-semibold leading-tight text-espresso lg:text-[40px]">Your Journey</h1>
      <div className="mb-8 mt-1.5 flex items-center gap-2.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "#E5D8C0" }}>
          <div className="h-full rounded-full" style={{ width: `${overallPct}%`, background: "linear-gradient(90deg,#B8834A,#D4A96A)" }} />
        </div>
        <span className="text-[13px] font-semibold text-muted">{overallPct}%</span>
      </div>

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
        {moduleStates.map(({ module: m, total, completed, isComplete, isCurrent, locked }) => {
          const content = (
            <div
              className="rounded-[16px] p-4"
              style={
                isCurrent && !isComplete
                  ? { background: "linear-gradient(155deg,#4A2E18,#2C1810)", color: "#F5E6D0", boxShadow: "0 10px 24px rgba(44,24,16,.28)" }
                  : { background: isComplete ? "#fff" : "#FAF4EA", border: "1px solid #EADFC9", opacity: locked ? 0.72 : 1 }
              }
            >
              <div className="kicker mb-1 text-[11px]" style={{ color: isCurrent && !isComplete ? "#C89B5C" : locked ? "#B8A585" : "#A08966" }}>
                Module {m.num} · {isComplete ? "Complete" : isCurrent ? "In Progress" : locked ? "Locked" : "Available"}
              </div>
              <div className="font-display text-[20px] font-semibold lg:text-[22px]" style={{ color: isCurrent && !isComplete ? "#F5E6D0" : locked ? "#6B5844" : "#2C1810" }}>{m.title}</div>
              <div className="mt-0.5 text-[13px]" style={{ color: isCurrent && !isComplete ? "#c9b49a" : locked ? "#A08966" : "#8B7355" }}>{m.subtitle}</div>
              {isCurrent && !isComplete && (
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="h-[5px] flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.15)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(completed / total) * 100}%`, background: "#D4A96A" }} />
                  </div>
                  <span className="text-xs text-[#c9b49a]">{completed} / {total}</span>
                </div>
              )}
            </div>
          );
          return (
            <div key={m.id} className="relative mb-5">
              <span className="absolute" style={{ left: isCurrent && !isComplete ? -40 : -38, top: isCurrent && !isComplete ? 0 : 2 }}>
                <TimelineNode complete={isComplete} current={isCurrent && !isComplete} />
              </span>
              {locked ? content : <Link href="/journey" className="block">{content}</Link>}
              {/* lesson links for the current/available module */}
              {(isCurrent || isComplete) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.lessons.map((l) => (
                    <Link key={l.id} href={`/lesson/${l.id}`}
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                      style={done.has(l.id)
                        ? { background: "#EFE7D6", color: "#8B7355" }
                        : { background: "#5C3A1E", color: "#F5E6D0" }}>
                      {done.has(l.id) ? "✓ " : ""}{l.title}
                    </Link>
                  ))}
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
