import { redirect } from "next/navigation";
import { getServerSupabase } from "../lib/supabaseServer";
import PortalClient from "./portal/PortalClient";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const supabase = getServerSupabase();
  if (supabase) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin") {
        redirect("/admin");
      }
    }
  }

  return <PortalClient />;
}
