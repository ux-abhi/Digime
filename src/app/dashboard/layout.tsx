import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <DashboardShell
      user={{ id: user.id, email: user.email || "", name: profile?.name || "", plan: profile?.plan || "free" }}
    >
      {children}
    </DashboardShell>
  );
}
