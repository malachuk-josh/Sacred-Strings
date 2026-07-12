"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

type IconProps = { active?: boolean };
const stroke = (active?: boolean) => (active ? "#D4A96A" : "#BCA684");

const TodayIcon = ({ active }: IconProps) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <path d="M3 10l9-7 9 7v9a1 1 0 01-1 1h-4v-6H8v6H4a1 1 0 01-1-1v-9z" fill={active ? "#D4A96A" : "none"} stroke={active ? "none" : "#BCA684"} strokeWidth="1.8" />
  </svg>
);
const JourneyIcon = ({ active }: IconProps) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <path d="M4 6h16M4 12h16M4 18h16" stroke={stroke(active)} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const SongsIcon = ({ active }: IconProps) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <path d="M9 18V5l10-2v13" stroke={stroke(active)} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="6" cy="18" r="3" stroke={stroke(active)} strokeWidth="1.8" />
    <circle cx="16" cy="16" r="3" stroke={stroke(active)} strokeWidth="1.8" />
  </svg>
);
const TunerIcon = ({ active }: IconProps) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <path d="M12 3v18M8 6v12M16 6v12M4 9v6M20 9v6" stroke={stroke(active)} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const ChordsIcon = ({ active }: IconProps) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke={stroke(active)} strokeWidth="1.8" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke={stroke(active)} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const CapoIcon = ({ active }: IconProps) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" stroke={stroke(active)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LooperIcon = ({ active }: IconProps) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <path d="M17 3l3 3-3 3M4 11v-1a4 4 0 014-4h12M7 21l-3-3 3-3M20 13v1a4 4 0 01-4 4H4" stroke={stroke(active)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TracksIcon = ({ active }: IconProps) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <path d="M3 12h2l2-6 3 12 3-9 2 3h6" stroke={stroke(active)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SetlistIcon = ({ active }: IconProps) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <path d="M4 6h10M4 12h8M4 18h6" stroke={stroke(active)} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M18 16V7l3-1" stroke={stroke(active)} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="16" cy="17" r="2.4" stroke={stroke(active)} strokeWidth="1.8" />
  </svg>
);

const FlameIcon = () => (
  <svg width="22" height="25" viewBox="0 0 15 17" fill="none">
    <path d="M7.5 1C7.5 1 3 5 3 9.5a4.5 4.5 0 009 0C12 7 9.5 5.5 9.5 3c-1 1-2 1.5-2 3.5C6 6 6 4 7.5 1z" fill="#D4A96A" />
  </svg>
);

const navItems = [
  { href: "/", label: "Today", desktopLabel: "Today", Icon: TodayIcon },
  { href: "/journey", label: "Journey", desktopLabel: "Your Journey", Icon: JourneyIcon },
  { href: "/songs", label: "Songs", desktopLabel: "Song Library", Icon: SongsIcon },
  { href: "/setlists", label: "Setlists", desktopLabel: "Setlist Planner", Icon: SetlistIcon },
  { href: "/tracks", label: "Tracks", desktopLabel: "Practice Tracks", Icon: TracksIcon },
  { href: "/looper", label: "Looper", desktopLabel: "Progression Looper", Icon: LooperIcon },
  { href: "/capo", label: "Capo", desktopLabel: "Capo & Keys", Icon: CapoIcon },
  { href: "/tuner", label: "Tuner", desktopLabel: "Tuner", Icon: TunerIcon },
  { href: "/chords", label: "Chords", desktopLabel: "Chord Library", Icon: ChordsIcon },
];

// Mobile tab bar icons — colored per active/inactive state (chestnut / faint).
const mColor = (active: boolean) => (active ? "#5C3A1E" : "#B8A585");
const MTodayIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 10l9-7 9 7v9a1 1 0 01-1 1h-4v-6H8v6H4a1 1 0 01-1-1v-9z" fill={active ? "#5C3A1E" : "none"} stroke={active ? "none" : "#B8A585"} strokeWidth="1.8" />
  </svg>
);
const MJourneyIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M4 6h16M4 12h16M4 18h16" stroke={mColor(active)} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const MSongsIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M9 18V5l10-2v13" stroke={mColor(active)} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="6" cy="18" r="3" stroke={mColor(active)} strokeWidth="1.8" />
    <circle cx="16" cy="16" r="3" stroke={mColor(active)} strokeWidth="1.8" />
  </svg>
);
const MProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={mColor(active)} strokeWidth="1.8" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={mColor(active)} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const mobileTabs = [
  { href: "/", label: "Today", Icon: MTodayIcon },
  { href: "/journey", label: "Journey", Icon: MJourneyIcon },
  { href: "/songs", label: "Songs", Icon: MSongsIcon },
  { href: "/profile", label: "Profile", Icon: MProfileIcon },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setStreak(null);
      return;
    }
    let cancelled = false;
    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !cancelled && d?.progress && setStreak(d.progress.currentStreak ?? 0))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* ===== Desktop sidebar ===== */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col"
        style={{ background: "linear-gradient(180deg,#3A2415 0%,#241209 100%)" }}>
        <div className="flex items-center gap-3 px-6 pb-7 pt-7">
          <Image src="/icons/icon-192.png" alt="Sacred Strings" width={38} height={38} className="rounded-[10px]" />
          <span className="font-display text-[21px] font-bold text-cream">Sacred Strings</span>
        </div>

        <nav className="flex flex-col gap-1 px-3.5">
          {navItems.map(({ href, desktopLabel, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-[11px] px-3.5 py-3 text-[15px] transition-colors"
                style={
                  active
                    ? { background: "rgba(212,169,106,.16)", color: "#F5E6D0", fontWeight: 600 }
                    : { color: "#BCA684" }
                }
              >
                <Icon active={active} />
                {desktopLabel}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* streak card */}
        <div className="mx-3.5 mb-3 flex items-center gap-3 rounded-[14px] px-4 py-3.5" style={{ background: "rgba(0,0,0,.22)" }}>
          <FlameIcon />
          <div>
            <div className="font-display text-[22px] font-bold leading-none text-cream">
              {streak ?? 0} days
            </div>
            <div className="text-xs text-[#BCA684]">Practice streak</div>
          </div>
        </div>

        {/* profile row */}
        <div className="flex items-center gap-3 border-t px-6 pb-6 pt-3.5" style={{ borderColor: "rgba(212,169,106,.12)" }}>
          {isSignedIn ? (
            <>
              <UserButton />
              <div className="flex-1 overflow-hidden">
                <div className="truncate text-sm font-semibold text-cream">
                  {user?.fullName || user?.firstName || "My account"}
                </div>
                <div className="text-xs text-[#BCA684]">Worship team</div>
              </div>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="w-full rounded-[11px] px-4 py-2.5 text-sm font-semibold text-espresso" style={{ background: "#D4A96A" }}>
                Sign in to save progress
              </button>
            </SignInButton>
          )}
        </div>
      </aside>

      {/* ===== Mobile tab bar ===== */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex justify-around px-5 pb-7 pt-3 lg:hidden"
        style={{ background: "rgba(250,244,234,.9)", backdropFilter: "blur(12px)", borderTop: "1px solid #E5D8C0" }}
      >
        {mobileTabs.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1">
              <Icon active={active} />
              <span className="text-[10px]" style={{ color: active ? "#5C3A1E" : "#B8A585", fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
