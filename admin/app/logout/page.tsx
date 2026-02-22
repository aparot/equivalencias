"use client";

import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "/";

export default function LogoutPage() {
  useEffect(() => {
    async function run() {
      if (supabase) {
        await supabase.auth.signOut();
      }
      if (typeof window !== "undefined") {
        window.location.href = PORTAL_URL;
      }
    }
    void run();
  }, []);

  return <main className="admin-root">Cerrando sesión...</main>;
}
