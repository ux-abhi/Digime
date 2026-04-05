"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(urlError || "");
  const supabase = createClient();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      // Only land here if OAuth initiation itself failed (e.g. provider not enabled)
      setError(error.message);
      setLoading(false);
    }
    // On success the browser navigates to Google — don't clear loading state
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-[var(--color-surface)]" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--color-brand)]/5 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--color-brand)]/3 blur-3xl" />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <div className="w-full max-w-sm relative z-10 animate-fade-in-up">
        {/* Logo */}
        <Link href="/" className="block text-center mb-3">
          <span className="font-[var(--font-display)] text-3xl font-800 tracking-tight text-[var(--color-ink)]">
            digi<span className="text-[var(--color-brand)]">me</span>
          </span>
        </Link>
        <p className="text-sm text-[var(--color-ink-muted)] text-center mb-8">
          Turn your portfolio into a 24/7 AI sales rep
        </p>

        <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-8 shadow-xl shadow-black/4">
          <h1 className="font-[var(--font-display)] text-xl font-700 text-[var(--color-ink)] text-center mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] text-center mb-6">
            Sign in to your DigiMe dashboard
          </p>

          {sent ? (
            <div className="text-center animate-fade-in">
              <div className="text-4xl mb-3">✉️</div>
              <p className="text-sm text-[var(--color-ink-muted)]">
                Check your email for a magic link to sign in.
              </p>
              <p className="text-xs text-[var(--color-ink-faint)] mt-2">
                Sent to <strong className="text-[var(--color-ink)]">{email}</strong>
              </p>
            </div>
          ) : (
            <>
              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border-strong)] text-sm font-medium text-[var(--color-ink)] px-4 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-sunken)] hover:shadow-sm transition-all disabled:opacity-50 mb-4"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {loading ? "Redirecting..." : "Continue with Google"}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-border)]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[var(--color-surface-raised)] px-3 text-[var(--color-ink-faint)]">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Email */}
              <form onSubmit={handleEmailLogin}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-4 py-2.5 rounded-[var(--radius-md)] mb-3 outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10 transition-all placeholder:text-[var(--color-ink-faint)]"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full text-sm font-medium bg-[var(--color-brand)] text-white px-4 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-dark)] transition-all disabled:opacity-50 shadow-sm shadow-[var(--color-brand)]/20"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </form>
            </>
          )}

          {error && (
            <p className="text-xs text-[var(--color-danger)] text-center mt-3 bg-red-50 border border-red-100 rounded-lg p-2">
              {decodeURIComponent(error)}
            </p>
          )}
        </div>

        <p className="text-xs text-[var(--color-ink-faint)] text-center mt-6">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}

// useSearchParams() requires Suspense in Next.js App Router
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
