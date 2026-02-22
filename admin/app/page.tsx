"use client";

import { useEffect } from "react";

export default function PortalFallback() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const target = "/portal/index.html";
      window.location.replace(target);
    }
  }, []);

  return (
    <main className="admin-root">
      Redirigiendo al portal...
    </main>
  );
}
