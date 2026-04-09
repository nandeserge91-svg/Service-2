import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  if (!roles.includes("SELLER")) {
    redirect("/tableau-de-bord/client");
  }

  return (
    <div className="flex flex-1">
      <DashboardSidebar role="vendeur" />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
