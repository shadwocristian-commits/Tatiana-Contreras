// Servicio de la tienda: muestra una pantalla propia cuando no hay internet
// y guarda las páginas públicas ya vistas para poder mirarlas sin conexión.
const V = "v2";
const STATIC = "tc-static-" + V, PAGES = "tc-pages-" + V, FONTS = "tc-fonts-" + V, IMGS = "tc-img-" + V;
const KEEP = [STATIC, PAGES, FONTS, IMGS];
const PRECACHE = ["/offline.html", "/vendor/three.min.js", "/icons/icon-192.png"];
const MAX_PAGES = 30, MAX_IMGS = 80;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith("tc-") && !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("message", (e) => {
  if (e.data === "clear-pages") e.waitUntil(caches.delete(PAGES));
});

// Solo páginas públicas. Nada de cuenta, admin, carrito ni pagos.
function pagePublica(u) {
  const p = u.pathname;
  if (/^\/(admin|cuenta|auth|api|ingresar|registro)(\/|$)/.test(p)) return false;
  if (/^\/tienda\/(carrito|checkout)(\/|$)/.test(p)) return false;
  return p === "/" || /^\/(tienda|info|libro-de-reclamaciones)(\/|$)/.test(p);
}
async function recortar(cache, max) {
  const ks = await cache.keys();
  for (let i = 0; i < ks.length - max; i++) await cache.delete(ks[i]);
}
function conTiempo(p, ms) {
  return new Promise((ok, no) => { const t = setTimeout(() => no(new Error("tiempo")), ms); p.then((r) => { clearTimeout(t); ok(r); }, (e) => { clearTimeout(t); no(e); }); });
}

async function navegar(req) {
  const url = new URL(req.url);
  try {
    const res = await conTiempo(fetch(req), 15000);
    const tipo = res.headers.get("content-type") || "";
    if (res.ok && res.type === "basic" && !res.redirected && tipo.includes("text/html") && pagePublica(url)) {
      const c = await caches.open(PAGES);
      await c.delete(req.url);
      await c.put(req.url, res.clone());
      recortar(c, MAX_PAGES);
    }
    return res;
  } catch {
    const guardada = pagePublica(url) ? await caches.match(req.url, { cacheName: PAGES }) : null;
    return guardada || (await caches.match("/offline.html", { cacheName: STATIC })) || Response.error();
  }
}
async function cacheFirst(req, name) {
  const hit = await caches.match(req, { cacheName: name });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) (await caches.open(name)).put(req, res.clone());
  return res;
}
async function revalidar(req, name, max) {
  const c = await caches.open(name);
  const hit = await c.match(req);
  const red = fetch(req).then((res) => { if (res.ok || res.type === "opaque") { c.put(req, res.clone()); if (max) recortar(c, max); } return res; }).catch(() => null);
  return hit || (await red) || fetch(req);
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") { e.respondWith(navegar(req)); return; }
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/vendor/")) { e.respondWith(cacheFirst(req, STATIC)); return; }
    if (req.destination === "image" && /^\/(images|icons)\//.test(url.pathname)) { e.respondWith(revalidar(req, IMGS, MAX_IMGS)); return; }
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") { e.respondWith(revalidar(req, FONTS)); return; }
  if (req.destination === "image" && url.pathname.includes("/storage/v1/object/public/")) { e.respondWith(revalidar(req, IMGS, MAX_IMGS)); }
});
