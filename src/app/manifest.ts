import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Materiales de Tatiana",
    short_name: "Materiales",
    description: "Fichas, tarjetas y guías de psicología clínica y educativa. Descarga inmediata.",
    start_url: "/tienda",
    display: "standalone",
    background_color: "#FBF7EF",
    theme_color: "#783818",
    lang: "es",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
