"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { CATALOG, type CatalogSong } from "@/lib/worship-catalog";

interface SetlistSong {
  title: string;
  author: string;
  key?: string;
  chart?: string;
  catalogId?: string;
}
interface Setlist {
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

const KEYS = ["", "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const FILTERS = ["All", "Modern", "Traditional", "My Songs"] as const;
type Filter = (typeof FILTERS)[number];

const newId = () => `sl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const songEq = (a: SetlistSong, b: SetlistSong) =>
  a.title.toLowerCase() === b.title.toLowerCase() && a.author.toLowerCase() === b.author.toLowerCase();

export default function SetlistsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [doc, setDoc] = useState<PlannerDoc>({ setlists: [], songFavs: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const loadedRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch("/api/setlists")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.doc) setDoc(d.doc);
        loadedRef.current = true;
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  // debounced autosave
  const persist = useCallback((next: PlannerDoc) => {
    setDoc(next);
    if (!loadedRef.current) return;
    setSaving("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch("/api/setlists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doc: next }),
        });
        setSaving("saved");
        setTimeout(() => setSaving("idle"), 1500);
      } catch {
        setSaving("idle");
      }
    }, 700);
  }, []);

  const editing = doc.setlists.find((s) => s.id === editingId) ?? null;

  const updateSetlist = (id: string, fn: (s: Setlist) => Setlist) => {
    persist({
      ...doc,
      setlists: doc.setlists.map((s) => (s.id === id ? { ...fn(s), updatedAt: new Date().toISOString() } : s)),
    });
  };

  const createSetlist = () => {
    const s: Setlist = { id: newId(), name: "Sunday Setlist", favorite: false, updatedAt: new Date().toISOString(), songs: [] };
    persist({ ...doc, setlists: [s, ...doc.setlists] });
    setEditingId(s.id);
  };

  const deleteSetlist = (id: string) => {
    if (!confirm("Delete this setlist?")) return;
    persist({ ...doc, setlists: doc.setlists.filter((s) => s.id !== id) });
    if (editingId === id) setEditingId(null);
  };

  const isFav = (song: SetlistSong) => doc.songFavs.some((f) => songEq(f, song));
  const toggleFavSong = (song: SetlistSong) => {
    const stripped: SetlistSong = { title: song.title, author: song.author, ...(song.chart ? { chart: song.chart } : {}), ...(song.catalogId ? { catalogId: song.catalogId } : {}) };
    persist({
      ...doc,
      songFavs: isFav(song) ? doc.songFavs.filter((f) => !songEq(f, song)) : [...doc.songFavs, stripped],
    });
  };

  // search results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (filter === "My Songs") {
      return doc.songFavs.filter((s) => !q || s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q));
    }
    const cat = filter === "Modern" ? "modern" : filter === "Traditional" ? "traditional" : undefined;
    const list = CATALOG.filter((s) => {
      if (cat && s.category !== cat) return false;
      if (!q) return true;
      return s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q);
    });
    return list.slice(0, q ? 40 : 25).map((c): SetlistSong => ({ title: c.title, author: c.author, catalogId: c.id, ...(c.chart ? { chart: c.chart } : {}) }));
  }, [query, filter, doc.songFavs]);

  const sortedSetlists = [...doc.setlists].sort((a, b) =>
    a.favorite !== b.favorite ? (a.favorite ? -1 : 1) : b.updatedAt.localeCompare(a.updatedAt)
  );

  if (isLoaded && !isSignedIn) {
    return (
      <div className="mx-auto max-w-2xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
        <h1 className="mb-6 font-display text-[33px] font-semibold text-espresso">Setlist Planner</h1>
        <div className="rounded-[20px] p-8 text-center text-cream" style={{ background: "linear-gradient(155deg,#4A2E18,#2C1810)", boxShadow: "0 16px 36px rgba(44,24,16,.28)" }}>
          <p className="mb-2 font-display text-xl">Sign in to plan your sets</p>
          <p className="mx-auto mb-6 max-w-md text-sm text-[#c9b49a]">
            Setlists and saved songs live in your account, synced across every device — build Sunday&apos;s set on your laptop, open it on your phone at church.
          </p>
          <SignInButton mode="modal">
            <button className="rounded-full px-6 py-2.5 text-sm font-semibold text-espresso" style={{ background: "#D4A96A" }}>Sign in / Create account</button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-muted">Plan the worship team&apos;s week</div>
          <h1 className="mb-1 font-display text-[33px] font-semibold text-espresso">Setlist Planner</h1>
        </div>
        <span className="mt-2 text-xs text-faint">{saving === "saving" ? "Saving…" : saving === "saved" ? "Saved ✓" : ""}</span>
      </div>

      {loading ? (
        <p className="mt-6 text-muted">Loading your setlists…</p>
      ) : editing ? (
        /* ================= EDITOR ================= */
        <div className="mt-4">
          <button onClick={() => setEditingId(null)} className="text-sm text-bronze">← All setlists</button>

          <div className="mt-3 flex items-center gap-2">
            <input
              value={editing.name}
              onChange={(e) => updateSetlist(editing.id, (s) => ({ ...s, name: e.target.value }))}
              className="w-full rounded-[12px] border border-border-warm bg-white px-4 py-2.5 font-display text-xl font-semibold text-espresso outline-none focus:border-bronze"
            />
            <button
              onClick={() => updateSetlist(editing.id, (s) => ({ ...s, favorite: !s.favorite }))}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-[12px] border border-border-warm bg-white text-xl"
              aria-label="Favorite setlist"
            >
              {editing.favorite ? "★" : "☆"}
            </button>
          </div>

          {/* songs in set */}
          <div className="mt-4 flex flex-col gap-2">
            {editing.songs.length === 0 && (
              <p className="rounded-[12px] border border-dashed border-border-warm-2 p-4 text-center text-sm text-muted">
                No songs yet — search below and tap + to add.
              </p>
            )}
            {editing.songs.map((song, i) => (
              <div key={`${song.title}-${i}`} className="flex items-center gap-2 rounded-[14px] border border-border-warm bg-white p-3">
                <span className="w-5 text-center text-xs font-bold text-faint">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-espresso">{song.title}</div>
                  <div className="truncate text-xs text-muted">
                    {song.author}
                    {song.chart && (
                      <> · <Link href={`/songs/${song.chart}`} className="font-semibold text-bronze">chart →</Link></>
                    )}
                  </div>
                </div>
                <select
                  value={song.key ?? ""}
                  onChange={(e) => updateSetlist(editing.id, (s) => ({ ...s, songs: s.songs.map((x, xi) => (xi === i ? { ...x, key: e.target.value || undefined } : x)) }))}
                  className="rounded-[8px] border border-border-warm bg-parchment px-1.5 py-1 text-xs text-espresso outline-none"
                  aria-label="Key"
                >
                  {KEYS.map((k) => <option key={k} value={k}>{k || "key"}</option>)}
                </select>
                <div className="flex flex-col">
                  <button disabled={i === 0} onClick={() => updateSetlist(editing.id, (s) => { const songs = [...s.songs]; [songs[i - 1], songs[i]] = [songs[i], songs[i - 1]]; return { ...s, songs }; })} className="px-1 text-xs text-bronze disabled:opacity-25">▲</button>
                  <button disabled={i === editing.songs.length - 1} onClick={() => updateSetlist(editing.id, (s) => { const songs = [...s.songs]; [songs[i + 1], songs[i]] = [songs[i], songs[i + 1]]; return { ...s, songs }; })} className="px-1 text-xs text-bronze disabled:opacity-25">▼</button>
                </div>
                <button onClick={() => updateSetlist(editing.id, (s) => ({ ...s, songs: s.songs.filter((_, xi) => xi !== i) }))} className="px-1 text-lg leading-none text-faint" aria-label="Remove">×</button>
              </div>
            ))}
          </div>

          {/* search + add */}
          <div className="mt-7">
            <div className="kicker mb-2 text-[12px] text-muted">Add songs</div>
            <div className="mb-3 flex items-center gap-2.5 rounded-[12px] border border-border-warm bg-white px-3.5 py-2.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#B8A585" strokeWidth="1.6" /><path d="M11 11l3 3" stroke="#B8A585" strokeWidth="1.6" strokeLinecap="round" /></svg>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles, artists & worship teams" className="w-full bg-transparent text-sm text-espresso outline-none placeholder:text-faint-2" />
            </div>
            <div className="mb-4 flex gap-2 overflow-x-auto">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
                  style={filter === f ? { background: "#5C3A1E", color: "#F5E6D0" } : { background: "#fff", border: "1px solid #EADFC9", color: "#8B7355" }}>
                  {f}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {results.map((song) => (
                <div key={`${song.catalogId ?? song.title}-${song.author}`} className="flex items-center gap-2 rounded-[12px] border border-border-warm bg-white px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-espresso">{song.title}</div>
                    <div className="truncate text-xs text-muted">{song.author}{song.chart ? " · has chart" : ""}</div>
                  </div>
                  <button onClick={() => toggleFavSong(song)} className="px-1 text-lg" aria-label="Save song" style={{ color: isFav(song) ? "#B8834A" : "#C9B49A" }}>
                    {isFav(song) ? "♥" : "♡"}
                  </button>
                  <button
                    onClick={() => updateSetlist(editing.id, (s) => ({ ...s, songs: [...s.songs, song] }))}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-lg font-bold text-cream"
                    style={{ background: "#5C3A1E" }}
                    aria-label="Add to setlist"
                  >
                    +
                  </button>
                </div>
              ))}
              {results.length === 0 && filter !== "My Songs" && (
                <p className="py-2 text-center text-sm text-muted">No matches in the catalog.</p>
              )}
              {results.length === 0 && filter === "My Songs" && (
                <p className="py-2 text-center text-sm text-muted">No saved songs yet — tap ♡ on any search result.</p>
              )}
              {query.trim().length > 1 && (
                <button
                  onClick={() => {
                    const custom: SetlistSong = { title: query.trim(), author: "Custom" };
                    updateSetlist(editing.id, (s) => ({ ...s, songs: [...s.songs, custom] }));
                    if (!isFav(custom)) toggleFavSong(custom);
                    setQuery("");
                  }}
                  className="rounded-[12px] border border-dashed border-bronze/50 px-3 py-2.5 text-sm font-semibold text-bronze"
                >
                  + Add &ldquo;{query.trim()}&rdquo; as a custom song
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= LIST ================= */
        <div className="mt-4">
          <button onClick={createSetlist} className="mb-5 w-full rounded-[14px] py-3.5 text-center text-sm font-bold text-cream" style={{ background: "linear-gradient(135deg,#5C3A1E,#2C1810)", boxShadow: "0 8px 20px rgba(44,24,16,.25)" }}>
            + New Setlist
          </button>

          {sortedSetlists.length === 0 && (
            <p className="rounded-[14px] border border-dashed border-border-warm-2 p-6 text-center text-sm text-muted">
              No setlists yet. Create one and start planning Sunday.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {sortedSetlists.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-[16px] border border-border-warm bg-white p-4">
                <button onClick={() => updateSetlist(s.id, (x) => ({ ...x, favorite: !x.favorite }))} className="text-xl" aria-label="Favorite" style={{ color: s.favorite ? "#D4A96A" : "#C9B49A" }}>
                  {s.favorite ? "★" : "☆"}
                </button>
                <button onClick={() => setEditingId(s.id)} className="min-w-0 flex-1 text-left">
                  <div className="truncate font-display text-lg font-semibold text-espresso">{s.name}</div>
                  <div className="text-xs text-muted">
                    {s.songs.length} song{s.songs.length === 1 ? "" : "s"}
                    {s.songs.length > 0 && <> · {s.songs.slice(0, 3).map((x) => x.title).join(" · ")}{s.songs.length > 3 ? " …" : ""}</>}
                  </div>
                </button>
                <button onClick={() => deleteSetlist(s.id)} className="px-1 text-lg text-faint" aria-label="Delete">×</button>
              </div>
            ))}
          </div>

          {/* saved songs */}
          {doc.songFavs.length > 0 && (
            <div className="mt-8">
              <div className="kicker mb-3 text-[12px] text-muted">My saved songs</div>
              <div className="flex flex-col gap-2">
                {doc.songFavs.map((song) => (
                  <div key={`${song.title}-${song.author}`} className="flex items-center gap-2 rounded-[12px] border border-border-warm bg-white px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-espresso">{song.title}</div>
                      <div className="truncate text-xs text-muted">
                        {song.author}
                        {song.chart && (<> · <Link href={`/songs/${song.chart}`} className="font-semibold text-bronze">chart →</Link></>)}
                      </div>
                    </div>
                    <button onClick={() => toggleFavSong(song)} className="px-1 text-lg text-bronze" aria-label="Remove from saved">♥</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
