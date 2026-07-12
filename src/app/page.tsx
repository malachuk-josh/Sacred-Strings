import Link from "next/link";

const pathways = [
  {
    title: "Beginner's Path",
    description: "Start from zero — learn to hold the guitar, read basic notation, and play your first worship chords.",
    level: "Beginner",
    lessons: 12,
    href: "/curriculum?level=beginner",
  },
  {
    title: "Rhythm & Foundation",
    description: "Master chord shapes, strumming patterns, and rhythmic foundations for congregational worship.",
    level: "Intermediate",
    lessons: 16,
    href: "/curriculum?level=intermediate",
  },
  {
    title: "Lead Guitar for Worship",
    description: "Develop melodic playing, scales, arpeggios, and lead techniques to guide worship from the guitar.",
    level: "Advanced",
    lessons: 20,
    href: "/curriculum?level=advanced",
  },
];

export default function Home() {
  return (
    <div className="px-4 py-8 lg:px-12 lg:py-12">
      {/* Hero */}
      <section className="mb-12 lg:mb-16">
        <h1 className="font-[var(--font-playfair)] text-3xl lg:text-5xl font-bold text-foreground mb-4">
          Sacred Strings
        </h1>
        <p className="text-lg lg:text-xl text-warm-gray max-w-2xl">
          A classical guitar curriculum for worship. From your first chord to leading
          your congregation — grow as a musician and servant.
        </p>
      </section>

      {/* Pathways */}
      <section className="mb-12">
        <h2 className="font-[var(--font-playfair)] text-xl lg:text-2xl font-semibold mb-6">
          Choose Your Path
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pathways.map((path) => (
            <Link
              key={path.title}
              href={path.href}
              className="group rounded-xl border border-gold/20 p-6 transition-all hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                  {path.level}
                </span>
                <span className="text-xs text-warm-gray">{path.lessons} lessons</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-gold transition-colors">
                {path.title}
              </h3>
              <p className="text-sm text-warm-gray">{path.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions - Desktop gets more */}
      <section className="hidden lg:block">
        <h2 className="font-[var(--font-playfair)] text-xl font-semibold mb-6">
          Quick Start
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/practice"
            className="rounded-xl bg-navy p-6 text-cream transition-all hover:bg-navy-light"
          >
            <h3 className="text-lg font-semibold text-gold mb-2">Daily Practice</h3>
            <p className="text-sm text-gray-300">
              Jump into today&apos;s exercises — scales, arpeggios, and worship songs.
            </p>
          </Link>
          <Link
            href="/theory"
            className="rounded-xl bg-navy p-6 text-cream transition-all hover:bg-navy-light"
          >
            <h3 className="text-lg font-semibold text-gold mb-2">Music Theory</h3>
            <p className="text-sm text-gray-300">
              Understand the language of music — keys, modes, and how they serve worship.
            </p>
          </Link>
        </div>
      </section>

      {/* Mobile Quick Action */}
      <section className="lg:hidden">
        <Link
          href="/practice"
          className="block w-full rounded-xl bg-gold p-4 text-center text-navy font-semibold transition-all active:scale-[0.98]"
        >
          Start Today&apos;s Practice
        </Link>
      </section>
    </div>
  );
}
