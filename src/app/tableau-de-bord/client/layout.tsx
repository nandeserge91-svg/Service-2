import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <DashboardSidebar role="client" />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</div>
      </div>
      <MobileNav />
    </div>
  );
}
