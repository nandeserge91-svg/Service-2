import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardRedirect() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  if (roles.includes("ADMIN")) redirect("/tableau-de-bord/admin");
  if (roles.includes("SELLER")) redirect("/tableau-de-bord/vendeur");
  redirect("/tableau-de-bord/client");
}
