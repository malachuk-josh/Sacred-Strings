import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { defaultProfile, profileKey, SKILL_LEVELS, type Profile, type SkillLevel } from "@/lib/progress";

export const runtime = "nodejs";

async function loadProfile(userId: string): Promise<Profile> {
  const data = await getRedis().get<Profile>(profileKey(userId));
  return data ? { ...defaultProfile, ...data } : { ...defaultProfile };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const profile = await loadProfile(userId);
  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const current = await loadProfile(userId);

  const profile: Profile = {
    displayName:
      typeof body.displayName === "string" ? body.displayName.trim().slice(0, 80) : current.displayName,
    skillLevel: SKILL_LEVELS.includes(body.skillLevel as SkillLevel)
      ? (body.skillLevel as SkillLevel)
      : current.skillLevel,
    updatedAt: new Date().toISOString(),
  };

  await getRedis().set(profileKey(userId), profile);
  return NextResponse.json({ profile });
}
