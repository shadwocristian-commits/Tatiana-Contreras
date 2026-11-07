// Solo rutas internas: evita redirecciones a sitios externos (incluye trucos con "\\" o "//").
export function safeNext(next: string | null | undefined, fallback = "/tienda") {
  if (!next || !/^\/(?![\/\\])[^\\\r\n\t]*$/.test(next)) return fallback;
  return next;
}

// Contraseña: mínimo 10 caracteres con al menos una letra y un número.
export const PW_MIN = 10;
export function passwordProblem(pw: string): string | null {
  if (pw.length < PW_MIN) return `Usa al menos ${PW_MIN} caracteres.`;
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Combina letras y números.";
  return null;
}

// Nombres y apellidos: solo letras, espacios, apóstrofe, punto y guion (2 a 60).
export function nameProblem(label: string, v: string): string | null {
  const t = v.trim();
  if (t.length < 2) return `Escribe tus ${label}.`;
  if (t.length > 60 || !/^[\p{L}][\p{L}' .-]*$/u.test(t)) return `Revisa tus ${label}: usa solo letras.`;
  return null;
}
