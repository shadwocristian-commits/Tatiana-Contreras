export type Area = "clinica" | "educativa";

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  includes: string[];
  how_to_use: string[];
  area: Area;
  age_range: string | null;
  format: string;
  price_cents: number;
  currency: string;
  is_free: boolean;
  is_sample: boolean;
  cover_url: string | null;
  rating_avg: number;
  rating_count: number;
  file_path: string | null;
};

export type Review = {
  id: string;
  author_name: string | null;
  rating: number;
  comment: string;
  admin_reply: string | null;
  created_at: string;
};

export type Category = { slug: string; name: string; area?: Area | null };

export const AREA_LABEL: Record<Area, string> = { clinica: "Clínica", educativa: "Educativa" };
