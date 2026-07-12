import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";

export interface SetlistSong {
  title: string;
  author: string;
  key?: string;
  chart?: string; // in-app chart id when available
  catalogId?: string;
}

export interface Setlist {
  id: string;
  name: string;
  favorite: boolean;
  updatedAt: string;
  songs: SetlistSong[];
}

interface PlannerDoc {
  setlists: Setlist[];
  songFavs: SetlistSong[];
}

const emptyDoc: PlannerDoc = { setlists: [], songFavs: [] };

function plannerKey(userId: string) {
  return `sacred:user:${userId}:planner`;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function sanitizeSong(raw: unknown): SetlistSong | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const title = str(s.title, 120);
  if (!title) return null;
  const song: SetlistSong = { title, author: str(s.author, 120) };
  const key = str(s.key, 6);
  const chart = str(s.chart, 60);
  const catalogId = str(s.catalogId, 80);
  if (key) song.key = key;
  if (chart) song.chart = chart;
  if (catalogId) song.catalogId = catalogId;
  return song;
}

function sanitizeDoc(raw: unknown): PlannerDoc {
  if (!raw || typeof raw !== "object") return emptyDoc;
  const d = raw as Record<string, unknown>;
  const setlists = (Array.isArray(d.setlists) ? d.setlists : [])
    .slice(0, 60)
    .map((raw): Setlist | null => {
      if (!raw || typeof raw !== "object") return null;
      const s = raw as Record<string, unknown>;
      const id = str(s.id, 40);
      const name = str(s.name, 80);
      if (!id || !name) return null;
      return {
        id,
        name,
        favorite: !!s.favorite,
        updatedAt: str(s.updatedAt, 40) || new Date().toISOString(),
        songs: (Array.isArray(s.songs) ? s.songs : []).slice(0, 60).map(sanitizeSong).filter((x): x is SetlistSong => !!x),
      };
    })
    .filter((x): x is Setlist => !!x);
  const songFavs = (Array.isArray(d.songFavs) ? d.songFavs : [])
    .slice(0, 400)
    .map(sanitizeSong)
    .filter((x): x is SetlistSong => !!x);
  return { setlists, songFavs };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const doc = await getRedis().get<PlannerDoc>(plannerKey(userId));
  return NextResponse.json({ doc: doc ? { ...emptyDoc, ...doc } : emptyDoc });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const doc = sanitizeDoc(body?.doc);
  await getRedis().set(plannerKey(userId), doc);
  return NextResponse.json({ ok: true, doc });
}
