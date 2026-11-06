import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// Datos públicos que casi no cambian: se guardan 5 min para no consultar la base en cada clic.
const anon = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });

export const getCategorias = unstable_cache(
  async () => {
    const { data } = await anon().from("categories").select("id,slug,name,area").order("sort");
    return data ?? [];
  },
  ["categorias"],
  { revalidate: 300, tags: ["catalogo"] },
);

export const getPagosActivos = unstable_cache(
  async () => {
    const { data } = await anon().from("site_settings").select("value").eq("key", "payments_enabled").maybeSingle();
    return data?.value === true;
  },
  ["pagos-activos"],
  { revalidate: 300, tags: ["catalogo"] },
);
