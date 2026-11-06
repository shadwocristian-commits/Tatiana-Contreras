// Íconos de línea redondeados (Material Symbols Rounded). Se ven igual en todos los dispositivos.
export function Icon({ n, size, className = "" }: { n: string; size?: number; className?: string }) {
  return <span className={`ms ${className}`} aria-hidden style={size ? { fontSize: size } : undefined}>{n}</span>;
}

const names: Record<string, string> = {
  "estimulacion-lenguaje": "chat_bubble",
  "atencion-concentracion": "track_changes",
  aprendizaje: "menu_book",
  "modificacion-conducta": "checklist",
  "estimulacion-temprana": "toys",
  "terapia-emocional": "favorite",
};

export function TherapyIcon({ slug }: { slug: string }) {
  return <Icon n={names[slug] ?? "favorite"} size={34} />;
}
