import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  if (!roles.includes("ADMIN") && !roles.includes("SUPPORT")) {
    redirect("/tableau-de-bord");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar role="admin" />
      <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
