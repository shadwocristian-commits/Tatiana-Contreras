"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap" style={{ padding: "72px 28px", textAlign: "center" }}>
      <h1 style={{ fontSize: 48 }}>Algo salió mal</h1>
      <p style={{ color: "var(--muted)", fontSize: 18 }}>Inténtalo de nuevo. Si sigue pasando, vuelve en unos minutos.</p>
      <button className="btn btn-pri" onClick={reset} style={{ color: "#fff" }}>Reintentar</button>
    </div>
  );
}
