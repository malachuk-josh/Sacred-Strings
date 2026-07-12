"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/curriculum", label: "Curriculum", icon: "📖" },
  { href: "/theory", label: "Theory", icon: "🎵" },
  { href: "/practice", label: "Practice", icon: "🎸" },
  { href: "/progress", label: "Progress", icon: "📊" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <>
      {/* Mobile auth control (top-right) */}
      <div className="fixed right-3 top-3 z-50 lg:hidden">
        {isSignedIn ? (
          <UserButton />
        ) : (
          <SignInButton mode="modal">
            <button className="rounded-full bg-gold px-4 py-1.5 text-xs font-medium text-navy shadow-md">
              Sign in
            </button>
          </SignInButton>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gold/20 bg-navy px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="font-[var(--font-playfair)] text-xl font-bold text-gold">
              Sacred Strings
            </h1>
          </div>
          <div className="pb-2">
            {isSignedIn ? (
              <div className="flex items-center gap-3 rounded-md bg-navy-light/50 px-3 py-2">
                <UserButton />
                <span className="text-sm text-gray-300">My account</span>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="w-full rounded-md bg-gold px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-gold-dark">
                  Sign in to save progress
                </button>
              </SignInButton>
            )}
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group flex gap-x-3 rounded-md p-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-gold/10 text-gold"
                          : "text-gray-300 hover:bg-gold/5 hover:text-gold-light"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-gold/20 pt-4">
            <p className="text-xs text-warm-gray">
              &ldquo;Make a joyful noise unto the Lord&rdquo;
            </p>
            <p className="text-xs text-warm-gray/60 mt-1">Psalm 100:1</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-navy lg:hidden">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors ${
                  isActive ? "text-gold" : "text-gray-400"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
