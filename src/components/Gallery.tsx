"use client";
import { useRef, useState } from "react";
import { Icon } from "@/components/Icons";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [i, setI] = useState(0);
  const x0 = useRef<number | null>(null);
  const n = images.length;
  const go = (k: number) => setI(((k % n) + n) % n);
  return (
    <div className="gal" role="region" aria-roledescription="carrusel" aria-label={`Imágenes de ${title}`}>
      <div className="gal-main" tabIndex={0}
        onKeyDown={(e) => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); }}
        onTouchStart={(e) => { x0.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { if (x0.current == null) return; const d = e.changedTouches[0].clientX - x0.current; x0.current = null; if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1)); }}>
        <div className="gal-track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {images.map((u, k) => (
            <div className="gal-s" key={u}>
              <img className="bg" src={u} alt="" aria-hidden draggable={false} loading={k === 0 ? "eager" : "lazy"} decoding="async" />
              <img className="fg" src={u} alt={`${title} — imagen ${k + 1} de ${n}`} draggable={false}
                loading={k === 0 ? "eager" : "lazy"} fetchPriority={k === 0 ? "high" : "auto"} decoding="async" />
            </div>
          ))}
        </div>
        {n > 1 && <>
          <button type="button" className="gal-nav l" aria-label="Imagen anterior" onClick={() => go(i - 1)}><Icon n="chevron_left" /></button>
          <button type="button" className="gal-nav r" aria-label="Imagen siguiente" onClick={() => go(i + 1)}><Icon n="chevron_right" /></button>
          <span className="gal-count" aria-live="polite">{i + 1} / {n}</span>
          <div className="gal-dots">{images.map((_, k) => <i key={k} className={k === i ? "on" : ""} />)}</div>
        </>}
      </div>
      {n > 1 && (
        <div className="gal-th">
          {images.map((u, k) => (
            <button type="button" key={u} className={k === i ? "on" : ""} aria-label={`Ver imagen ${k + 1}`} aria-current={k === i} onClick={() => setI(k)}>
              <img src={u} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
