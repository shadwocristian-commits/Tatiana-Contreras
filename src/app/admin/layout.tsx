import { notFound, redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import AdminNav from "@/components/AdminNav";

export const metadata = { title: "Panel" };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = await createClient();
  const user = await getUser();
  if (!user) redirect("/ingresar?next=/admin");
  const { data: prof } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role !== "admin") notFound();
  const { count } = await sb.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending");
  return (
    <div className="adm">
      <AdminNav pending={count ?? 0} />
      <div className="adm-m">{children}</div>
    </div>
  );
}
