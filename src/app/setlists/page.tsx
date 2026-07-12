"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { CATALOG } from "@/lib/worship-catalog";
import { TEAM_ROLES } from "@/lib/team";
import { songselectSearchUrl, songselectSongUrl } from "@/lib/songselect";

interface SetlistSong {
  title: string;
  author: string;
  key?: string;
  chart?: string;
  catalogId?: string;
  ccli?: string;
}
interface TeamSlot {
  role: string;
  person: string;
}
interface Setlist {
  id: string;
  name: string;
  favorite: boolean;
  updatedAt: string;
  date?: string;
  notes?: string;
  team?: TeamSlot[];
  songs: SetlistSong[];
}
interface PlannerDoc {
  setlists: Setlist[];
  songFavs: SetlistSong[];
}
interface ChurchSong {
  id: string;
  title: string;
  author: string;
  ccli?: string;
  addedBy: string;
}
interface Person {
  id: string;
  name: string;
  roles: string[];
}
interface SavedTeam {
  id: string;
  name: string;
  slots: TeamSlot[];
}
interface ChurchDoc {
  songs: ChurchSong[];
  people: Person[];
  teams: SavedTeam[];
}

const KEYS = ["", "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const FILTERS = ["All", "Modern", "Traditional", "Church", "My Songs"] as const;
type Filter = (typeof FILTERS)[number];

const newId = () => `sl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const songEq = (a: SetlistSong, b: SetlistSong) =>
  a.title.toLowerCase() === b.title.toLowerCase() && a.author.toLowerCase() === b.author.toLowerCase();
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export default function SetlistsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [doc, setDoc] = useState<PlannerDoc>({ setlists: [], songFavs: [] });
  const [church, setChurch] = useState<ChurchDoc>({ songs: [], people: [], teams: [] });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonRoles, setNewPersonRoles] = useState<string[]>([]);
  const [newSlotIdx, setNewSlotIdx] = useState<number | null>(null);
  const [newSlotName, setNewSlotName] = useState("");
  const [savingTeam, setSavingTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [ssQuery, setSsQuery] = useState("");
  const loadedRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load personal + church docs
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([
      fetch("/api/setlists").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/church").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([p, c]) => {
        if (cancelled) return;
        if (p?.doc) setDoc(p.doc);
        if (c?.doc) {
          setChurch({ songs: [], people: [], teams: [], ...c.doc });
          setIsAdmin(!!c.isAdmin);
        }
        loadedRef.current = true;
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

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

  const churchPost = useCallback(async (payload: Record<string, unknown>) => {
    const r = await fetch("/api/church", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (r.ok) {
      const d = await r.json();
      if (d?.doc) setChurch({ songs: [], people: [], teams: [], ...d.doc });
      return d?.doc as ChurchDoc | undefined;
    }
    return undefined;
  }, []);

  const editing = doc.setlists.find((s) => s.id === editingId) ?? null;

  const updateSetlist = (id: string, fn: (s: Setlist) => Setlist) => {
    persist({
      ...doc,
      setlists: doc.setlists.map((s) => (s.id === id ? { ...fn(s), updatedAt: new Date().toISOString() } : s)),
    });
  };

  const createSetlist = (date?: string) => {
    const s: Setlist = {
      id: newId(),
      name: "Worship Set",
      favorite: false,
      updatedAt: new Date().toISOString(),
      ...(date ? { date } : {}),
      songs: [],
    };
    persist({ ...doc, setlists: [s, ...doc.setlists] });
    setEditingId(s.id);
  };

  const deleteSetlist = (id: string) => {
    if (!confirm("Delete this setlist?")) return;
    persist({ ...doc, setlists: doc.setlists.filter((s) => s.id !== id) });
    if (editingId === id) setEditingId(null);
  };

  const duplicateSetlist = (src: Setlist) => {
    const copy: Setlist = {
      ...src,
      id: newId(),
      name: `${src.name} (copy)`,
      favorite: false,
      date: undefined,
      updatedAt: new Date().toISOString(),
      songs: src.songs.map((x) => ({ ...x })),
      team: src.team?.map((t) => ({ ...t })),
    };
    persist({ ...doc, setlists: [copy, ...doc.setlists] });
  };

  const [copied, setCopied] = useState(false);
  const copyForTeam = (s: Setlist) => {
    const lines: string[] = [];
    lines.push(`${s.name}${s.date ? ` — ${fmtDate(s.date)}` : ""}`);
    if (s.songs.length) {
      lines.push("", "Songs:");
      s.songs.forEach((x, i) => lines.push(`${i + 1}. ${x.title}${x.key ? ` (${x.key})` : ""}${x.ccli ? ` · CCLI ${x.ccli}` : ""}`));
    }
    const team = (s.team ?? []).filter((t) => t.person);
    if (team.length) {
      lines.push("", "Team:");
      team.forEach((t) => lines.push(`${t.person} — ${t.role}`));
    }
    if (s.notes) lines.push("", `Notes: ${s.notes}`);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const isFav = (song: SetlistSong) => doc.songFavs.some((f) => songEq(f, song));
  const toggleFavSong = (song: SetlistSong) => {
    const stripped: SetlistSong = { title: song.title, author: song.author, ...(song.chart ? { chart: song.chart } : {}), ...(song.catalogId ? { catalogId: song.catalogId } : {}) };
    persist({ ...doc, songFavs: isFav(song) ? doc.songFavs.filter((f) => !songEq(f, song)) : [...doc.songFavs, stripped] });
  };

  // ---- search ----
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (t: string, a: string) => !q || t.toLowerCase().includes(q) || a.toLowerCase().includes(q);
    const churchRows = church.songs
      .filter((s) => match(s.title, s.author))
      .map((s): SetlistSong & { churchId?: string } => ({ title: s.title, author: s.author, catalogId: `church-${s.id}`, churchId: s.id, ...(s.ccli ? { ccli: s.ccli } : {}) }));
    if (filter === "My Songs") {
      return doc.songFavs.filter((s) => match(s.title, s.author));
    }
    if (filter === "Church") return churchRows;
    const cat = filter === "Modern" ? "modern" : filter === "Traditional" ? "traditional" : undefined;
    const catalogRows = CATALOG.filter((s) => (!cat || s.category === cat) && match(s.title, s.author))
      .slice(0, q ? 40 : 25)
      .map((c): SetlistSong => ({ title: c.title, author: c.author, catalogId: c.id, ...(c.chart ? { chart: c.chart } : {}) }));
    return filter === "All" ? [...catalogRows, ...churchRows.slice(0, 15)] : catalogRows;
  }, [query, filter, doc.songFavs, church.songs]);

  // ---- calendar ----
  const marks = useMemo(() => {
    const m = new Map<string, number>();
    doc.setlists.forEach((s) => {
      if (s.date) m.set(s.date, (m.get(s.date) ?? 0) + 1);
    });
    return m;
  }, [doc.setlists]);

  const pickDate = (iso: string) => {
    const existing = doc.setlists.find((s) => s.date === iso);
    if (existing) setEditingId(existing.id);
    else createSetlist(iso);
  };

  // Everyone, alphabetically — used by the roster and every person picker.
  const sortedPeople = useMemo(
    () => [...church.people].sort((a, b) => a.name.localeCompare(b.name)),
    [church.people]
  );

  const sortedSetlists = useMemo(() => {
    const today = todayIso();
    const rank = (s: Setlist) => (s.favorite ? 0 : 1);
    const bucket = (s: Setlist) => (!s.date ? 1 : s.date >= today ? 0 : 2);
    return [...doc.setlists].sort((a, b) => {
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      if (bucket(a) !== bucket(b)) return bucket(a) - bucket(b);
      if (a.date && b.date) return bucket(a) === 2 ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [doc.setlists]);

  const addPerson = async () => {
    const name = newPersonName.trim();
    if (!name) return;
    await churchPost({ action: "addPerson", name, roles: newPersonRoles });
    setNewPersonName("");
    setNewPersonRoles([]);
  };

  if (isLoaded && !isSignedIn) {
    return (
      <div className="mx-auto max-w-2xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
        <h1 className="mb-6 font-display text-[33px] font-semibold text-espresso">Setlist Planner</h1>
        <div className="rounded-[20px] p-8 text-center text-cream" style={{ background: "linear-gradient(155deg,#4A2E18,#2C1810)", boxShadow: "0 16px 36px rgba(44,24,16,.28)" }}>
          <p className="mb-2 font-display text-xl">Sign in to plan worship</p>
          <p className="mx-auto mb-6 max-w-md text-sm text-[#c9b49a]">
            Plan services on the calendar, assign your worship team, and share one church song library — synced across every device.
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
          <div className="flex items-center justify-between">
            <button onClick={() => setEditingId(null)} className="text-sm text-bronze">← All setlists</button>
            <div className="flex items-center gap-4">
              <button onClick={() => copyForTeam(editing)} className="text-xs font-semibold text-bronze">
                {copied ? "Copied ✓" : "Copy for team"}
              </button>
              <button onClick={() => deleteSetlist(editing.id)} className="text-xs text-faint">Delete</button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              value={editing.name}
              onChange={(e) => updateSetlist(editing.id, (s) => ({ ...s, name: e.target.value }))}
              className="w-full rounded-[12px] border border-border-warm bg-white px-4 py-2.5 font-display text-xl font-semibold text-espresso outline-none focus:border-bronze"
            />
            <button
              onClick={() => updateSetlist(editing.id, (s) => ({ ...s, favorite: !s.favorite }))}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-[12px] border border-border-warm bg-white text-xl"
              style={{ color: editing.favorite ? "#D4A96A" : "#C9B49A" }}
              aria-label="Favorite setlist"
            >
              {editing.favorite ? "★" : "☆"}
            </button>
          </div>

          {/* date + notes */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="kicker text-[10px] text-muted">Service date</span>
              <input
                type="date"
                value={editing.date ?? ""}
                onChange={(e) => updateSetlist(editing.id, (s) => ({ ...s, date: e.target.value || undefined }))}
                className="mt-1 w-full rounded-[10px] border border-border-warm bg-white px-3 py-2 text-sm text-espresso outline-none focus:border-bronze"
              />
            </label>
            <label className="block">
              <span className="kicker text-[10px] text-muted">Notes</span>
              <input
                value={editing.notes ?? ""}
                onChange={(e) => updateSetlist(editing.id, (s) => ({ ...s, notes: e.target.value || undefined }))}
                placeholder="Rehearsal 8:30am…"
                className="mt-1 w-full rounded-[10px] border border-border-warm bg-white px-3 py-2 text-sm text-espresso outline-none focus:border-bronze placeholder:text-faint-2"
              />
            </label>
          </div>

          {/* ---- team ---- */}
          <div className="mt-6">
            <div className="kicker mb-2 text-[12px] text-muted">Team for this service</div>
            <div className="flex flex-col gap-2">
              {(editing.team ?? []).map((slot, i) => (
                <div key={i} className="flex items-center gap-2 rounded-[12px] border border-border-warm bg-white p-2.5">
                  <select
                    value={slot.role}
                    onChange={(e) => updateSetlist(editing.id, (s) => ({ ...s, team: (s.team ?? []).map((t, ti) => (ti === i ? { ...t, role: e.target.value } : t)) }))}
                    className="w-[42%] rounded-[8px] border border-border-warm bg-parchment px-2 py-1.5 text-xs text-espresso outline-none"
                  >
                    {TEAM_ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  {newSlotIdx === i ? (
                    <span className="flex flex-1 gap-1">
                      <input
                        autoFocus
                        value={newSlotName}
                        onChange={(e) => setNewSlotName(e.target.value)}
                        placeholder="Name"
                        className="w-full min-w-0 rounded-[8px] border border-bronze bg-white px-2 py-1.5 text-xs text-espresso outline-none"
                      />
                      <button
                        onClick={async () => {
                          const name = newSlotName.trim();
                          if (name) {
                            await churchPost({ action: "addPerson", name, roles: [slot.role] });
                            updateSetlist(editing.id, (s) => ({ ...s, team: (s.team ?? []).map((t, ti) => (ti === i ? { ...t, person: name } : t)) }));
                          }
                          setNewSlotIdx(null);
                          setNewSlotName("");
                        }}
                        className="rounded-[8px] px-2.5 text-xs font-bold text-cream"
                        style={{ background: "#5C3A1E" }}
                      >
                        ✓
                      </button>
                    </span>
                  ) : (
                    <select
                      value={slot.person}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setNewSlotIdx(i);
                          setNewSlotName("");
                        } else {
                          updateSetlist(editing.id, (s) => ({ ...s, team: (s.team ?? []).map((t, ti) => (ti === i ? { ...t, person: e.target.value } : t)) }));
                        }
                      }}
                      className="flex-1 rounded-[8px] border border-border-warm bg-parchment px-2 py-1.5 text-xs text-espresso outline-none"
                    >
                      <option value="">— who? —</option>
                      {sortedPeople.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                      <option value="__new__">+ New person…</option>
                    </select>
                  )}
                  <div className="flex flex-col">
                    <button disabled={i === 0} onClick={() => updateSetlist(editing.id, (s) => { const team = [...(s.team ?? [])]; [team[i - 1], team[i]] = [team[i], team[i - 1]]; return { ...s, team }; })} className="px-1 text-xs text-bronze disabled:opacity-25" aria-label="Move up">▲</button>
                    <button disabled={i === (editing.team?.length ?? 0) - 1} onClick={() => updateSetlist(editing.id, (s) => { const team = [...(s.team ?? [])]; [team[i + 1], team[i]] = [team[i], team[i + 1]]; return { ...s, team }; })} className="px-1 text-xs text-bronze disabled:opacity-25" aria-label="Move down">▼</button>
                  </div>
                  <button
                    onClick={() => updateSetlist(editing.id, (s) => ({ ...s, team: (s.team ?? []).filter((_, ti) => ti !== i) }))}
                    className="px-1 text-lg leading-none text-faint"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateSetlist(editing.id, (s) => ({ ...s, team: [...(s.team ?? []), { role: "Vocals", person: "" }] }))}
                className="rounded-[12px] border border-dashed border-border-warm-2 px-3 py-2 text-sm font-semibold text-bronze"
              >
                + Add a role
              </button>

              {/* saved teams: load + save */}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {church.teams.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const t = church.teams.find((x) => x.id === e.target.value);
                      if (t) updateSetlist(editing.id, (s) => ({ ...s, team: t.slots.map((sl) => ({ ...sl })) }));
                    }}
                    className="rounded-[10px] border border-border-warm bg-white px-2.5 py-1.5 text-xs font-semibold text-chestnut outline-none"
                  >
                    <option value="">Load a saved team…</option>
                    {[...church.teams].sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.slots.length})</option>
                    ))}
                  </select>
                )}
                {(editing.team?.filter((t) => t.person).length ?? 0) > 0 && (
                  savingTeam ? (
                    <span className="flex gap-1">
                      <input
                        autoFocus
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Team name (e.g. Team A)"
                        className="w-[160px] rounded-[10px] border border-bronze bg-white px-2.5 py-1.5 text-xs text-espresso outline-none"
                      />
                      <button
                        onClick={async () => {
                          const name = teamName.trim();
                          if (name) await churchPost({ action: "saveTeam", name, slots: (editing.team ?? []).filter((t) => t.person || t.role) });
                          setSavingTeam(false);
                          setTeamName("");
                        }}
                        className="rounded-[10px] px-3 text-xs font-bold text-cream"
                        style={{ background: "#5C3A1E" }}
                      >
                        Save
                      </button>
                    </span>
                  ) : (
                    <button onClick={() => setSavingTeam(true)} className="rounded-[10px] border border-border-warm bg-white px-2.5 py-1.5 text-xs font-semibold text-bronze">
                      Save as team…
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* ---- songs in set ---- */}
          <div className="mt-6">
            <div className="kicker mb-2 text-[12px] text-muted">Songs</div>
            <div className="flex flex-col gap-2">
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
                      {song.chart && (<> · <Link href={`/songs/${song.chart}`} className="font-semibold text-bronze">chart →</Link></>)}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        href={song.ccli ? songselectSongUrl(song.ccli) : songselectSearchUrl(song.title, song.author)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-bronze"
                      >
                        SongSelect ↗
                      </a>
                      <input
                        value={song.ccli ?? ""}
                        onChange={(e) => {
                          const ccli = e.target.value.replace(/\D/g, "").slice(0, 10);
                          updateSetlist(editing.id, (s) => ({ ...s, songs: s.songs.map((x, xi) => (xi === i ? { ...x, ccli: ccli || undefined } : x)) }));
                        }}
                        placeholder="CCLI #"
                        inputMode="numeric"
                        className="w-[84px] rounded-[6px] border border-border-warm bg-parchment px-1.5 py-0.5 text-[11px] text-espresso outline-none placeholder:text-faint-2"
                      />
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
          </div>

          {/* ---- search + add ---- */}
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
              {results.map((song) => {
                const churchId = (song as SetlistSong & { churchId?: string }).churchId;
                return (
                  <div key={`${song.catalogId ?? song.title}-${song.author}`} className="flex items-center gap-2 rounded-[12px] border border-border-warm bg-white px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-espresso">{song.title}</div>
                      <div className="truncate text-xs text-muted">{song.author}{song.chart ? " · has chart" : ""}{song.ccli ? ` · CCLI ${song.ccli}` : ""}{churchId ? " · church library" : ""}</div>
                    </div>
                    {churchId && isAdmin && (
                      <button onClick={() => churchPost({ action: "deleteSong", id: churchId })} className="px-1 text-base text-faint" aria-label="Remove from church library">×</button>
                    )}
                    <button onClick={() => toggleFavSong(song)} className="px-1 text-lg" aria-label="Save song" style={{ color: isFav(song) ? "#B8834A" : "#C9B49A" }}>
                      {isFav(song) ? "♥" : "♡"}
                    </button>
                    <button
                      onClick={() => updateSetlist(editing.id, (s) => ({ ...s, songs: [...s.songs, { title: song.title, author: song.author, ...(song.chart ? { chart: song.chart } : {}), ...(song.catalogId ? { catalogId: song.catalogId } : {}), ...(song.ccli ? { ccli: song.ccli } : {}) }] }))}
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-lg font-bold text-cream"
                      style={{ background: "#5C3A1E" }}
                      aria-label="Add to setlist"
                    >
                      +
                    </button>
                  </div>
                );
              })}
              {results.length === 0 && (
                <p className="py-2 text-center text-sm text-muted">
                  {filter === "My Songs" ? "No saved songs yet — tap ♡ on any result." : filter === "Church" ? "Nothing in the church library yet — add the songs your church sings." : "No matches."}
                </p>
              )}
              {query.trim().length > 1 && (
                <>
                  <button
                    onClick={async () => {
                      const title = query.trim();
                      await churchPost({ action: "addSong", title, author: "" });
                      updateSetlist(editing.id, (s) => ({ ...s, songs: [...s.songs, { title, author: "Unknown" }] }));
                      setQuery("");
                    }}
                    className="rounded-[12px] border border-dashed border-bronze/50 px-3 py-2.5 text-sm font-semibold text-bronze"
                  >
                    + Add &ldquo;{query.trim()}&rdquo; to the church library
                  </button>
                  <a
                    href={songselectSearchUrl(query.trim())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[12px] border border-border-warm bg-white px-3 py-2.5 text-center text-sm font-semibold text-chestnut"
                  >
                    Search SongSelect for &ldquo;{query.trim()}&rdquo; ↗
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= LIST ================= */
        <div className="mt-4">
          {/* calendar */}
          <MiniCalendar month={calMonth} setMonth={setCalMonth} marks={marks} onPick={pickDate} />

          {/* standalone SongSelect search */}
          <div className="mt-5 rounded-[18px] border border-border-warm bg-white p-4">
            <div className="kicker mb-2 text-[12px] text-bronze">Search SongSelect by CCLI</div>
            <div className="flex gap-2">
              <input
                value={ssQuery}
                onChange={(e) => setSsQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && ssQuery.trim()) window.open(songselectSearchUrl(ssQuery.trim()), "_blank", "noopener");
                }}
                placeholder="Any song, author, or lyric…"
                className="w-full min-w-0 rounded-[10px] border border-border-warm bg-parchment px-3 py-2 text-sm text-espresso outline-none focus:border-bronze placeholder:text-faint-2"
              />
              <a
                href={ssQuery.trim() ? songselectSearchUrl(ssQuery.trim()) : "https://songselect.ccli.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-none items-center rounded-[10px] px-4 text-sm font-bold text-cream"
                style={{ background: "linear-gradient(135deg,#5C3A1E,#2C1810)" }}
              >
                Search ↗
              </a>
            </div>
            <p className="mt-2 text-[11px] text-faint">Opens SongSelect in a new tab — sign in there with the church&apos;s CCLI account for charts.</p>
          </div>

          <button onClick={() => createSetlist()} className="mb-5 mt-5 w-full rounded-[14px] py-3.5 text-center text-sm font-bold text-cream" style={{ background: "linear-gradient(135deg,#5C3A1E,#2C1810)", boxShadow: "0 8px 20px rgba(44,24,16,.25)" }}>
            + New Setlist
          </button>

          {sortedSetlists.length === 0 && (
            <p className="rounded-[14px] border border-dashed border-border-warm-2 p-6 text-center text-sm text-muted">
              No setlists yet. Tap a date on the calendar or create one here.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {sortedSetlists.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-[16px] border border-border-warm bg-white p-4">
                <button onClick={() => updateSetlist(s.id, (x) => ({ ...x, favorite: !x.favorite }))} className="text-xl" aria-label="Favorite" style={{ color: s.favorite ? "#D4A96A" : "#C9B49A" }}>
                  {s.favorite ? "★" : "☆"}
                </button>
                <button onClick={() => setEditingId(s.id)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-lg font-semibold text-espresso">{s.name}</span>
                    {s.date && (
                      <span className="flex-none rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: s.date >= todayIso() ? "#5C3A1E" : "#EFE7D6", color: s.date >= todayIso() ? "#F5E6D0" : "#8B7355" }}>
                        {fmtDate(s.date)}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {s.songs.length} song{s.songs.length === 1 ? "" : "s"}
                    {(s.team?.filter((t) => t.person).length ?? 0) > 0 && <> · {s.team!.filter((t) => t.person).length} on team</>}
                    {s.songs.length > 0 && <> · {s.songs.slice(0, 3).map((x) => x.title).join(" · ")}{s.songs.length > 3 ? " …" : ""}</>}
                  </div>
                </button>
                <button onClick={() => duplicateSetlist(s)} className="px-1 text-sm text-bronze" aria-label="Duplicate" title="Duplicate">⧉</button>
                <button onClick={() => deleteSetlist(s.id)} className="px-1 text-lg text-faint" aria-label="Delete">×</button>
              </div>
            ))}
          </div>

          {/* ---- worship team roster ---- */}
          <div className="mt-8 rounded-[18px] border border-border-warm bg-white p-5">
            <div className="kicker mb-3 text-[12px] text-bronze">Worship team</div>
            {church.people.length === 0 && (
              <p className="mb-3 text-sm text-muted">No team members yet — add the people who serve.</p>
            )}
            <div className="flex flex-col gap-2">
              {sortedPeople.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-bold text-espresso" style={{ background: "linear-gradient(145deg,#E8C78E,#B8834A)" }}>
                    {p.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-espresso">{p.name}</div>
                    <div className="truncate text-xs text-muted">{p.roles.length ? p.roles.join(" · ") : "—"}</div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => churchPost({ action: "deletePerson", id: p.id })} className="px-1 text-base text-faint" aria-label="Remove person">×</button>
                  )}
                </div>
              ))}
            </div>

            {/* saved teams */}
            {church.teams.length > 0 && (
              <div className="mt-4 border-t border-border-warm pt-4">
                <div className="kicker mb-2 text-[11px] text-muted">Saved teams</div>
                <div className="flex flex-col gap-1.5">
                  {[...church.teams].sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-espresso">{t.name}</span>
                      <span className="flex-none text-xs text-muted">
                        {t.slots.filter((sl) => sl.person).length} member{t.slots.filter((sl) => sl.person).length === 1 ? "" : "s"}
                      </span>
                      {isAdmin && (
                        <button onClick={() => churchPost({ action: "deleteTeam", id: t.id })} className="px-1 text-base text-faint" aria-label="Delete team">×</button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-faint">Load a saved team inside any setlist&apos;s Team section.</p>
              </div>
            )}

            {/* add person */}
            <div className="mt-4 border-t border-border-warm pt-4">
              <input
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Add a team member…"
                className="w-full rounded-[10px] border border-border-warm bg-parchment px-3 py-2 text-sm text-espresso outline-none focus:border-bronze placeholder:text-faint-2"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TEAM_ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setNewPersonRoles((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]))}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors"
                    style={newPersonRoles.includes(r) ? { background: "#5C3A1E", color: "#F5E6D0" } : { background: "#F3E7D4", color: "#8B7355" }}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {newPersonName.trim() && (
                <button onClick={addPerson} className="mt-3 rounded-full px-5 py-2 text-sm font-semibold text-cream" style={{ background: "linear-gradient(135deg,#5C3A1E,#2C1810)" }}>
                  Add {newPersonName.trim()}
                </button>
              )}
            </div>
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
                        {" · "}
                        <a href={song.ccli ? songselectSongUrl(song.ccli) : songselectSearchUrl(song.title, song.author)} target="_blank" rel="noopener noreferrer" className="font-semibold text-bronze">SongSelect ↗</a>
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

/* ================= Mini calendar ================= */
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

function MiniCalendar({ month, setMonth, marks, onPick }: {
  month: Date;
  setMonth: (d: Date) => void;
  marks: Map<string, number>;
  onPick: (iso: string) => void;
}) {
  const y = month.getFullYear();
  const m = month.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const isToday = (d: number) => d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
  const iso = (d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="rounded-[18px] border border-border-warm bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => setMonth(new Date(y, m - 1, 1))} className="px-2 text-lg text-bronze" aria-label="Previous month">‹</button>
        <span className="font-display text-lg font-semibold text-espresso">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
        <button onClick={() => setMonth(new Date(y, m + 1, 1))} className="px-2 text-lg text-bronze" aria-label="Next month">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DOW.map((d, i) => (
          <span key={i} className="kicker py-1 text-[10px] text-faint">{d}</span>
        ))}
        {Array.from({ length: firstDow }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1;
          const has = marks.has(iso(d));
          return (
            <button
              key={d}
              onClick={() => onPick(iso(d))}
              className="relative mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-full text-sm transition-colors"
              style={
                has
                  ? { background: "#5C3A1E", color: "#F5E6D0", fontWeight: 700 }
                  : isToday(d)
                    ? { background: "#F3E7D4", color: "#5C3A1E", fontWeight: 700 }
                    : { color: "#2C1810" }
              }
            >
              {d}
              {has && <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ background: "#D4A96A" }} />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[11px] text-faint">Tap a date to plan that service — dates with a setlist are marked.</p>
    </div>
  );
}
