"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DashboardShellProps {
  user: { id: string; email: string; name: string; plan: string };
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/knowledge", label: "Knowledge", icon: "🧠" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-surface-raised)] border-r border-[var(--color-border)] flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-[var(--color-border)]">
          <Link href="/dashboard" className="font-[var(--font-display)] text-xl font-800 tracking-tight text-[var(--color-ink)]">
            digi<span className="text-[var(--color-brand)]">me</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Plan Badge */}
        <div className="p-3 border-t border-[var(--color-border)]">
          {user.plan === "free" && (
            <Link
              href="/dashboard/settings"
              className="block w-full text-center text-xs font-medium bg-[var(--color-brand)]/10 text-[var(--color-brand)] px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-brand)]/20 transition-colors mb-3"
            >
              Upgrade to Pro →
            </Link>
          )}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand)]/10 flex items-center justify-center text-xs font-semibold text-[var(--color-brand)]">
              {(user.name?.[0] || user.email[0]).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-[var(--color-ink-faint)] truncate">
                {user.plan} plan
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] transition-colors"
              title="Sign out"
            >
              ↗
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
