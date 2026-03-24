import Link from "next/link";
import { MessageCircle, Zap, Target, Calendar, Layers, Globe, ArrowRight, Check, X } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-surface)]/80 border-b border-[var(--color-border)]/50">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="font-[var(--font-display)] text-2xl font-800 tracking-tight text-[var(--color-ink)]">
            digi<span className="text-[var(--color-brand)]">me</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden sm:inline text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
              Features
            </a>
            <a href="#pricing" className="hidden sm:inline text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
              Pricing
            </a>
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/login?signup=true"
              className="text-sm font-medium bg-[var(--color-brand)] text-white px-4 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-dark)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand)]/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-20 md:pt-28 pb-20 text-center">
        <div className="animate-fade-in-up inline-flex items-center gap-2 bg-[var(--color-brand)]/10 text-[var(--color-brand)] text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 bg-[var(--color-brand)] rounded-full animate-pulse" />
          Now available as a Framer Plugin
        </div>

        <h1 className="animate-fade-in-up stagger-1 font-[var(--font-display)] text-5xl md:text-7xl font-800 tracking-tight text-[var(--color-ink)] leading-[1.05] mb-6">
          Turn your portfolio
          <br />
          into a{" "}
          <span className="text-[var(--color-brand)] relative">
            24/7 AI sales rep
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 8c50-6 100-6 148-2s100 4 148-2" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
            </svg>
          </span>
        </h1>

        <p className="animate-fade-in-up stagger-2 text-lg md:text-xl text-[var(--color-ink-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          DigiMe converts your portfolio into an AI chatbot that speaks
          in your voice, shows your projects, captures leads, and books calls —
          while you sleep.
        </p>

        <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/login?signup=true"
            className="w-full sm:w-auto text-base font-semibold bg-[var(--color-brand)] text-white px-8 py-3.5 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-dark)] transition-all shadow-lg shadow-[var(--color-brand)]/20 hover:shadow-xl hover:shadow-[var(--color-brand)]/30 hover:-translate-y-0.5"
          >
            Start Free — No Credit Card
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto text-base font-medium text-[var(--color-ink)] border border-[var(--color-border-strong)] px-8 py-3.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-sunken)] transition-all hover:-translate-y-0.5"
          >
            See How It Works
          </a>
        </div>

        <p className="animate-fade-in-up stagger-4 text-sm text-[var(--color-ink-faint)] mb-16">
          Free forever &bull; No credit card &bull; Works on any site
        </p>

        {/* Browser Mockup / Hero Image */}
        <div className="animate-fade-in-up stagger-5 max-w-lg mx-auto">
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-2xl shadow-black/8 overflow-hidden">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-md px-3 py-1 text-xs text-[var(--color-ink-faint)] text-center">
                  yourportfolio.com
                </div>
              </div>
            </div>
            {/* Chat Preview */}
            <div className="p-5 space-y-3 bg-white">
              {/* Bot greeting */}
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">A</div>
                <div className="bg-[var(--color-surface-sunken)] text-[var(--color-ink)] text-sm px-3.5 py-2.5 rounded-2xl rounded-bl-sm max-w-[80%] leading-relaxed">
                  Hey! I&apos;m Abhi&apos;s AI assistant. Want to see some projects or book a call?
                </div>
              </div>
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-[var(--color-brand)] text-white text-sm px-3.5 py-2.5 rounded-2xl rounded-br-sm max-w-[70%]">
                  Show me your best work
                </div>
              </div>
              {/* Bot project card */}
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">A</div>
                <div className="max-w-[80%] space-y-2">
                  <div className="bg-[var(--color-surface-sunken)] text-[var(--color-ink)] text-sm px-3.5 py-2.5 rounded-2xl rounded-bl-sm leading-relaxed">
                    Here&apos;s one of my favorites:
                  </div>
                  <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-white">
                    <div className="h-24 bg-gradient-to-br from-[var(--color-brand)]/20 via-orange-100 to-amber-50 flex items-center justify-center">
                      <span className="text-3xl">🎨</span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">FinTech Dashboard</p>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">Complete redesign of a trading platform</p>
                      <div className="flex gap-1.5 mt-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">Figma</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">UI/UX</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="animate-fade-in-up font-[var(--font-display)] text-3xl md:text-4xl font-800 tracking-tight text-[var(--color-ink)] mb-4">
            Everything your portfolio needs
          </h2>
          <p className="animate-fade-in-up stagger-1 text-[var(--color-ink-muted)] max-w-xl mx-auto">
            A complete AI layer that sits on top of your existing portfolio — no redesign required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: <Target className="w-5 h-5" />, title: "Lead Capture", desc: "Visitors share their name, email, and project details right in the chat.", bg: "bg-red-50" },
            { icon: <Calendar className="w-5 h-5" />, title: "Cal.com Booking", desc: "Book calls without leaving the conversation. Connected to your calendar.", bg: "bg-blue-50" },
            { icon: <Layers className="w-5 h-5" />, title: "Project Cards", desc: "Rich cards with images and tags that showcase your best work.", bg: "bg-violet-50" },
            { icon: <MessageCircle className="w-5 h-5" />, title: "Your Voice", desc: "Three-layer prompt architecture makes the AI sound like you, not a bot.", bg: "bg-green-50" },
            { icon: <Zap className="w-5 h-5" />, title: "60 Second Setup", desc: "Paste your URL or add knowledge manually. One click to go live.", bg: "bg-amber-50" },
            { icon: <Globe className="w-5 h-5" />, title: "Works Everywhere", desc: "Framer, Webflow, WordPress, Squarespace, or any HTML site.", bg: "bg-cyan-50" },
          ].map((f, i) => (
            <div
              key={f.title}
              className={`animate-fade-in-up stagger-${i + 1} bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--color-brand)]/20 transition-all duration-300 group`}
            >
              <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center text-[var(--color-ink)] mb-4 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-1.5">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="animate-fade-in-up font-[var(--font-display)] text-3xl md:text-4xl font-800 tracking-tight text-[var(--color-ink)] mb-4">
            Live in 60 seconds
          </h2>
          <p className="animate-fade-in-up stagger-1 text-[var(--color-ink-muted)]">
            Three steps. No code. No design changes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-[2px] border-t-2 border-dashed border-[var(--color-border-strong)]" />

          {[
            { num: "1", icon: "🔗", title: "Paste your URL", desc: "Drop your portfolio link and we auto-extract your projects, skills, and about info." },
            { num: "2", icon: "🎨", title: "Customize your bot", desc: "Set your brand color, greeting, personality, and suggested questions." },
            { num: "3", icon: "🚀", title: "Embed & go live", desc: "Copy one line of code or install the Framer plugin. You're live." },
          ].map((step, i) => (
            <div key={step.num} className={`animate-fade-in-up stagger-${i + 1} text-center relative`}>
              <div className="w-14 h-14 rounded-full bg-[var(--color-brand)] text-white font-[var(--font-display)] text-xl font-800 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--color-brand)]/20 relative z-10">
                {step.num}
              </div>
              <div className="text-2xl mb-3">{step.icon}</div>
              <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed max-w-[240px] mx-auto">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="animate-fade-in-up font-[var(--font-display)] text-3xl md:text-4xl font-800 tracking-tight text-[var(--color-ink)] mb-4">
            Simple, honest pricing
          </h2>
          <p className="animate-fade-in-up stagger-1 text-[var(--color-ink-muted)]">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Free",
              price: "$0",
              period: "forever",
              desc: "Perfect for trying it out",
              features: [
                { text: "1 chatbot", ok: true },
                { text: "50 messages / month", ok: true },
                { text: "10 knowledge entries", ok: true },
                { text: "DigiMe branding", ok: true },
                { text: "Lead capture", ok: false },
                { text: "Custom branding", ok: false },
              ],
              cta: "Get Started Free",
              popular: false,
            },
            {
              name: "Pro",
              price: "$14",
              period: "/mo",
              desc: "For freelancers who want leads",
              features: [
                { text: "1 chatbot", ok: true },
                { text: "1,000 messages / month", ok: true },
                { text: "Unlimited knowledge", ok: true },
                { text: "Lead capture & export", ok: true },
                { text: "Cal.com booking", ok: true },
                { text: "Remove branding", ok: true },
              ],
              cta: "Start Pro Trial",
              popular: true,
            },
            {
              name: "Agency",
              price: "$29",
              period: "/mo",
              desc: "For agencies & studios",
              features: [
                { text: "5 chatbots", ok: true },
                { text: "5,000 messages / month", ok: true },
                { text: "Unlimited knowledge", ok: true },
                { text: "Everything in Pro", ok: true },
                { text: "Priority support", ok: true },
                { text: "Team collaboration", ok: true },
              ],
              cta: "Start Agency Trial",
              popular: false,
            },
          ].map((tier, i) => (
            <div
              key={tier.name}
              className={`animate-fade-in-up stagger-${i + 1} relative bg-[var(--color-surface-raised)] rounded-[var(--radius-xl)] p-7 border-2 transition-all hover:-translate-y-1 hover:shadow-xl ${
                tier.popular
                  ? "border-[var(--color-brand)] shadow-lg shadow-[var(--color-brand)]/10"
                  : "border-[var(--color-border)]"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[var(--color-brand)] text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="font-[var(--font-display)] text-lg font-700 text-[var(--color-ink)] mb-1">{tier.name}</h3>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">{tier.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-800 text-[var(--color-ink)]">{tier.price}</span>
                <span className="text-[var(--color-ink-muted)] text-sm">{tier.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {tier.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-sm">
                    {f.ok ? (
                      <Check className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-[var(--color-ink-faint)] shrink-0" />
                    )}
                    <span className={f.ok ? "text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login?signup=true"
                className={`block w-full text-center text-sm font-semibold py-3 rounded-[var(--radius-md)] transition-all ${
                  tier.popular
                    ? "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)] shadow-md shadow-[var(--color-brand)]/20"
                    : "bg-[var(--color-surface-sunken)] text-[var(--color-ink)] hover:bg-[var(--color-surface)] border border-[var(--color-border)]"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-6 mb-20">
        <div className="max-w-4xl mx-auto bg-[#1A1A1A] rounded-[var(--radius-xl)] px-8 py-16 md:py-20 text-center">
          <h2 className="animate-fade-in-up font-[var(--font-display)] text-3xl md:text-4xl font-800 tracking-tight text-white mb-4">
            Ready to turn your portfolio
            <br />
            into a sales machine?
          </h2>
          <p className="animate-fade-in-up stagger-1 text-white/60 mb-8 max-w-md mx-auto">
            Join designers and freelancers who close more deals while they sleep.
          </p>
          <Link
            href="/login?signup=true"
            className="animate-fade-in-up stagger-2 inline-flex items-center gap-2 text-base font-semibold bg-[var(--color-brand)] text-white px-8 py-3.5 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-light)] transition-all shadow-lg shadow-[var(--color-brand)]/30 hover:shadow-xl hover:-translate-y-0.5"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-[var(--font-display)] text-lg font-800 tracking-tight text-[var(--color-ink)]">
            digi<span className="text-[var(--color-brand)]">me</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--color-ink-muted)]">
            <a href="#features" className="hover:text-[var(--color-ink)] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[var(--color-ink)] transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
          </div>
          <p className="text-sm text-[var(--color-ink-faint)]">
            Built by{" "}
            <a
              href="https://uxabhi.com"
              target="_blank"
              rel="noopener"
              className="text-[var(--color-brand)] hover:underline"
            >
              @uxabhi
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
