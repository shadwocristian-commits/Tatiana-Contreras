const P = { width: 30, height: 30, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const icons: Record<string, React.ReactNode> = {
  "estimulacion-lenguaje": <svg {...P}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg>,
  "atencion-concentracion": <svg {...P}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></svg>,
  aprendizaje: <svg {...P}><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" /><path d="M9 8h6M9 12h6" /></svg>,
  "modificacion-conducta": <svg {...P}><path d="m4 6 2 2 3-3M4 13l2 2 3-3M13 7h7M13 14h7M4 20h5M13 20h7" /></svg>,
  "estimulacion-temprana": <svg {...P}><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /><rect x="8" y="3" width="8" height="8" rx="1" /></svg>,
  "terapia-emocional": <svg {...P}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>,
};

export function TherapyIcon({ slug }: { slug: string }) {
  return <>{icons[slug] ?? icons["terapia-emocional"]}</>;
}
