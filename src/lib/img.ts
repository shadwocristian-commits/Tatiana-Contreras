// Compresión de imágenes en el navegador: reduce el peso antes de subir.
export const MAX_IMGS = 5;
const MAX_SIDE = 1600;
const MAX_ORIGINAL = 15 * 1024 * 1024;
const OK = ["image/jpeg", "image/png", "image/webp"];

export async function compressImage(file: File): Promise<{ blob: Blob; ext: string; w: number; h: number }> {
  if (!OK.includes(file.type)) throw new Error(`"${file.name}": usa JPG, PNG o WebP.`);
  if (file.size > MAX_ORIGINAL) throw new Error(`"${file.name}" pesa más de 15 MB.`);
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch { throw new Error(`"${file.name}" no se pudo leer como imagen.`); }
  const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, w, h); bmp.close?.();
  const toBlob = (t: string, q: number) => new Promise<Blob | null>((r) => c.toBlob(r, t, q));
  let blob = await toBlob("image/webp", 0.82), ext = "webp";
  if (!blob || blob.type !== "image/webp") { blob = await toBlob("image/jpeg", 0.85); ext = "jpg"; }
  if (!blob) throw new Error(`"${file.name}" no se pudo comprimir.`);
  if (blob.size > 4.5 * 1024 * 1024) throw new Error(`"${file.name}" sigue siendo muy pesada.`);
  return { blob, ext, w, h };
}

export const pathFromUrl = (u: string) => { const i = u.indexOf("/portadas/"); return i < 0 ? null : decodeURIComponent(u.slice(i + 10).split("?")[0]); };
