"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BarChart3, Brain, TrendingUp, Settings, LogOut } from "lucide-react";

interface DashboardShellProps {
  user: { id: string; email: string; name: string; plan: string };
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/knowledge", label: "Knowledge", icon: Brain },
  { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const PLAN_COLORS: Record<string, string> = {
  free: "bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]",
  pro: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  agency: "bg-[var(--color-brand)]/10 text-[var(--color-brand)]",
};

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
      <aside className="w-64 bg-gradient-to-b from-[var(--color-surface-raised)] to-[var(--color-surface-raised)]/95 border-r border-[var(--color-border)] flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-[var(--color-border)]">
          <Link href="/dashboard" className="font-[var(--font-display)] text-xl font-800 tracking-tight text-[var(--color-ink)]">
            digi<span className="text-[var(--color-brand)]">me</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all relative ${
                  isActive
                    ? "bg-[var(--color-brand)]/8 text-[var(--color-brand)]"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)] hover:translate-x-0.5"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--color-brand)] rounded-r-full" />
                )}
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-[var(--color-border)] space-y-3">
          {user.plan === "free" && (
            <Link
              href="/dashboard/settings"
              className="block w-full text-center text-xs font-medium bg-[var(--color-brand)]/10 text-[var(--color-brand)] px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-brand)]/20 transition-colors"
            >
              Upgrade to Pro →
            </Link>
          )}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {(user.name?.[0] || user.email[0]).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                {user.name || "User"}
              </p>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                {user.plan}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] transition-colors p-1 rounded-md hover:bg-[var(--color-surface-sunken)]"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-[var(--color-ink-faint)] text-center font-[var(--font-display)] font-600 tracking-wide opacity-40">
            DIGIME
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
