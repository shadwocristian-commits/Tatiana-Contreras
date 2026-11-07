"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Si inicias o cierras sesión en otra pestaña, esta se actualiza sola.
export default function AuthSync() {
  const router = useRouter();
  useEffect(() => {
    const { data } = createClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") router.refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [router]);
  return null;
}
