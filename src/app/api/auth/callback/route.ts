import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Supabase / Google sends ?error + ?error_description when OAuth fails
  // (e.g. provider not enabled, user cancelled, misconfigured redirect URL)
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");
  if (oauthError) {
    const msg = encodeURIComponent(oauthErrorDescription || oauthError);
    return NextResponse.redirect(`${origin}/login?error=${msg}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=No+authorization+code+received`);
  }

  const supabaseResponse = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options as Record<string, unknown>);
          });
        },
      },
    }
  );

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const msg = encodeURIComponent(exchangeError.message);
    return NextResponse.redirect(`${origin}/login?error=${msg}`);
  }

  // Auto-create profile for new users (e.g. first Google sign-in)
  if (data?.user) {
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );
    const { data: existingProfile } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single();

    if (!existingProfile) {
      await adminSupabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "",
        plan: "free",
      });
    }
  }

  return supabaseResponse;
}

