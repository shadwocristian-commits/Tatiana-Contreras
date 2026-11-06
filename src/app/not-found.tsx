import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "72px 28px", textAlign: "center" }}>
      <h1 style={{ fontSize: 56 }}>Página no encontrada</h1>
      <p style={{ color: "var(--muted)", fontSize: 18 }}>El enlace no existe o cambió de lugar.</p>
      <Link className="btn btn-pri" href="/" style={{ color: "#fff" }}>Volver al inicio</Link>
    </div>
  );
}
