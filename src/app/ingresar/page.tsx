import AccessCard from "@/components/AccessCard";

export const metadata = { title: "Ingresar" };

export default async function Ingresar({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/tienda";
  return (
    <div className="wrap" style={{ display: "flex", justifyContent: "center", padding: "56px 28px" }}>
      <AccessCard initial="ingresar" next={safe} />
    </div>
  );
}
