"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Si inicias o cierras sesión en otra pestaña, esta se actualiza sola.
// Solo refresca cuando CAMBIA la persona (no cada vez que vuelves a la pestaña), para no borrar lo que escribes.
export default function AuthSync() {
  const router = useRouter();
  const uid = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const sb = createClient();
    const { data } = sb.auth.onAuthStateChange((event, session) => {
      const now = session?.user?.id ?? null;
      if (uid.current === undefined) { uid.current = now; return; }
      if (event === "SIGNED_OUT") navigator.serviceWorker?.controller?.postMessage("clear-pages");
      if (event === "SIGNED_OUT" || (event === "SIGNED_IN" && now !== uid.current)) { uid.current = now; router.refresh(); }
    });
    return () => data.subscription.unsubscribe();
  }, [router]);
  return null;
}
