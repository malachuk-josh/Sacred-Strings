"use client";

import { useState } from "react";
import { SONGS, type Song } from "@/lib/curriculum";

const FILTERS = ["All", "Beginner", "Intermediate"] as const;

export default function SongsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const songs = SONGS.filter((s) => {
    const matchesFilter = filter === "All" || s.difficulty === filter;
    const matchesQuery = s.title.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 pb-10 lg:px-10 lg:pt-10">
      <div className="text-sm font-medium text-muted">Play what you&apos;re learning</div>
      <h1 className="mb-5 font-display text-[33px] font-semibold leading-tight text-espresso lg:text-[40px]">Worship Songs</h1>

      {/* search */}
      <div className="mb-4 flex items-center gap-2.5 rounded-[12px] border border-border-warm bg-white px-3.5 py-3">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#B8A585" strokeWidth="1.6" /><path d="M11 11l3 3" stroke="#B8A585" strokeWidth="1.6" strokeLinecap="round" /></svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search hymns &amp; songs"
          className="w-full bg-transparent text-sm text-espresso outline-none placeholder:text-faint-2"
        />
      </div>

      {/* filter chips */}
      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
            style={filter === f ? { background: "#5C3A1E", color: "#F5E6D0" } : { background: "#fff", border: "1px solid #EADFC9", color: "#8B7355" }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* song rows */}
      <div className="flex flex-col gap-3">
        {songs.map((s) => (
          <SongRow key={s.title} song={s} />
        ))}
        {songs.length === 0 && <p className="text-sm text-muted">No songs match that search.</p>}
      </div>
    </div>
  );
}

function SongRow({ song }: { song: Song }) {
  const intermediate = song.difficulty === "Intermediate";
  return (
    <div className="flex items-center gap-3.5 rounded-[16px] border border-border-warm bg-white p-3.5">
      <span
        className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[12px]"
        style={{ background: intermediate ? "linear-gradient(145deg,#C89B5C,#8B5E3C)" : "linear-gradient(145deg,#E8C78E,#B8834A)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V5l10-2v13" stroke={intermediate ? "#F5E6D0" : "#2C1810"} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="6" cy="18" r="3" stroke={intermediate ? "#F5E6D0" : "#2C1810"} strokeWidth="1.8" />
          <circle cx="16" cy="16" r="3" stroke={intermediate ? "#F5E6D0" : "#2C1810"} strokeWidth="1.8" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[18px] font-semibold text-espresso">{song.title}</div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-xs text-muted">Key of {song.key}</span>
          <span className="h-[3px] w-[3px] rounded-full" style={{ background: "#C9B49A" }} />
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={intermediate ? { color: "#B8834A", background: "#F5E9D6" } : { color: "#5C9668", background: "#E7F0E5" }}
          >
            {song.difficulty}
          </span>
        </div>
      </div>
      <span className="text-[11px] font-semibold text-faint">{song.chords} chords</span>
    </div>
  );
}
