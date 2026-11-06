import Link from "next/link";

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <span>© {new Date().getFullYear()} Tatiana Contreras Jacovi · Psicóloga</span>
        <span style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Link href="/info/terminos">Términos y condiciones</Link>
          <Link href="/info/privacidad">Privacidad</Link>
        </span>
      </div>
    </footer>
  );
}
