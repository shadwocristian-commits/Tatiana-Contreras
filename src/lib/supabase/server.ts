import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export async function createClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            /* llamado desde un componente de servidor: el proxy renueva la sesión */
          }
        },
      },
    },
  );
}

/** Usuario de la sesión, verificado localmente (sin viaje a Supabase) y compartido en toda la petición. */
export const getUser = cache(async (): Promise<{ id: string; email: string | undefined } | null> => {
  const sb = await createClient();
  const { data } = await sb.auth.getClaims();
  const c = data?.claims;
  return c?.sub ? { id: c.sub, email: c.email as string | undefined } : null;
});
