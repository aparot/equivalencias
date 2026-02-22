"use client";

import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:8081";

export default function LogoutPage() {
  useEffect(() => {
    async function run() {
      if (supabase) {
        await supabase.auth.signOut();
      }
      if (typeof window !== "undefined") {
        const url = new URL(PORTAL_URL);
        url.searchParams.set("logout", "1");
        window.location.href = url.toString();
      }
    }
    void run();
  }, []);

  return <main className="admin-root">Cerrando sesión...</main>;
}
