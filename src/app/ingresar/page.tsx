import AuthShell from "@/components/AuthShell";

export const metadata = { title: "Ingresar" };

export default async function Ingresar({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/tienda";
  return <AuthShell initial="ingresar" next={safe} />;
}
