import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="font-[var(--font-display)] text-2xl font-800 tracking-tight text-[var(--color-ink)]">
          digi<span className="text-[var(--color-brand)]">me</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login?signup=true"
            className="text-sm font-medium bg-[var(--color-brand)] text-white px-4 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-dark)] transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-[var(--color-brand)]/10 text-[var(--color-brand)] text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 bg-[var(--color-brand)] rounded-full animate-pulse" />
          Now available as a Framer Plugin
        </div>

        <h1 className="font-[var(--font-display)] text-5xl md:text-7xl font-800 tracking-tight text-[var(--color-ink)] leading-[1.05] mb-6">
          Turn your portfolio into a{" "}
          <span className="text-[var(--color-brand)]">24/7 AI sales rep</span>
        </h1>

        <p className="text-lg md:text-xl text-[var(--color-ink-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          DigiMe converts your portfolio website into an AI chatbot that speaks
          in your voice, shows your projects, captures leads, and books calls —
          while you sleep.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/login?signup=true"
            className="w-full sm:w-auto text-base font-semibold bg-[var(--color-brand)] text-white px-8 py-3.5 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-dark)] transition-colors shadow-lg shadow-[var(--color-brand)]/20"
          >
            Start Free — No Credit Card
          </Link>
          <Link
            href="#demo"
            className="w-full sm:w-auto text-base font-medium text-[var(--color-ink)] border border-[var(--color-border-strong)] px-8 py-3.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-sunken)] transition-colors"
          >
            See Demo
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {[
            {
              emoji: "🎯",
              title: "Lead Capture",
              desc: "Visitors share their name, email, and project details right in the chat.",
            },
            {
              emoji: "📅",
              title: "Cal.com Booking",
              desc: "Book calls without leaving the conversation. Connected to your calendar.",
            },
            {
              emoji: "🃏",
              title: "Project Cards",
              desc: "Rich cards with images and tags that showcase your best work.",
            },
            {
              emoji: "🧠",
              title: "Your Voice",
              desc: "Three-layer prompt architecture makes the AI sound like you, not a bot.",
            },
            {
              emoji: "⚡",
              title: "60 Second Setup",
              desc: "Paste your URL or add knowledge manually. One click to go live.",
            },
            {
              emoji: "🔌",
              title: "Works Everywhere",
              desc: "Framer, Webflow, WordPress, Squarespace, or any HTML site.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--color-brand)]/30 transition-colors"
            >
              <div className="text-2xl mb-2">{f.emoji}</div>
              <h3 className="font-semibold text-[var(--color-ink)] mb-1">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8 px-6 text-center text-sm text-[var(--color-ink-faint)]">
        <span className="font-[var(--font-display)] font-700">
          digi<span className="text-[var(--color-brand)]">me</span>
        </span>{" "}
        — Built by{" "}
        <a
          href="https://uxabhi.com"
          target="_blank"
          rel="noopener"
          className="text-[var(--color-brand)] hover:underline"
        >
          @uxabhi
        </a>
      </footer>
    </div>
  );
}
