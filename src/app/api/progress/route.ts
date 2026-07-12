import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { defaultProgress, progressKey, type Progress, type HistoryEntry } from "@/lib/progress";

export const runtime = "nodejs";

function dateStr(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function loadProgress(userId: string): Promise<Progress> {
  const data = await getRedis().get<Progress>(progressKey(userId));
  return data ? { ...defaultProgress, ...data } : { ...defaultProgress };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const progress = await loadProgress(userId);
  return NextResponse.json({ progress });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const progress = await loadProgress(userId);
  const today = dateStr(0);

  // Records activity for today, advancing streaks and the practice history.
  const touchDay = (minutes: number, exercisesInc: number) => {
    if (progress.lastActive !== today) {
      progress.currentStreak = progress.lastActive === dateStr(-1) ? progress.currentStreak + 1 : 1;
      progress.lastActive = today;
      if (progress.currentStreak > progress.longestStreak) {
        progress.longestStreak = progress.currentStreak;
      }
    }
    let entry: HistoryEntry | undefined = progress.history.find((h) => h.date === today);
    if (!entry) {
      entry = { date: today, minutes: 0, exercises: 0 };
      progress.history.unshift(entry);
    }
    entry.minutes += minutes;
    entry.exercises += exercisesInc;
    progress.totalMinutes += minutes;
    progress.history = progress.history.slice(0, 60);
  };

  const minutes = Math.max(0, Math.round(Number(body.minutes) || 0));

  if (body.action === "completeExercise" && typeof body.id === "string") {
    if (!progress.completedExercises.includes(body.id)) progress.completedExercises.push(body.id);
    touchDay(minutes, 1);
  } else if (body.action === "completeLesson" && typeof body.id === "string") {
    if (!progress.completedLessons.includes(body.id)) progress.completedLessons.push(body.id);
    touchDay(minutes, 0);
  } else {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  await getRedis().set(progressKey(userId), progress);
  return NextResponse.json({ progress });
}
