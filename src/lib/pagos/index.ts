// Estructura de pagos lista, pero DESACTIVADA por ahora (todo es gratis).
// Para activarla: cambiar `payments_enabled` a true en la tabla site_settings
// y completar un proveedor de abajo.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "@/lib/types";

export type PaymentProvider = { id: "yape" | "plin" | "tarjeta"; label: string; enabled: boolean };

export const PROVIDERS: PaymentProvider[] = [
  { id: "yape", label: "Yape", enabled: false },
  { id: "plin", label: "Plin", enabled: false },
  { id: "tarjeta", label: "Tarjeta", enabled: false },
];

export async function paymentsEnabled(sb: SupabaseClient): Promise<boolean> {
  const { data } = await sb.from("site_settings").select("value").eq("key", "payments_enabled").maybeSingle();
  return data?.value === true;
}

export function priceLabel(p: Pick<Product, "price_cents" | "is_free">, payments: boolean): string {
  if (!payments || p.is_free || p.price_cents === 0) return "Gratis";
  return `S/ ${(p.price_cents / 100).toFixed(2)}`;
}
