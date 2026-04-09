"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { suspendUser, activateUser } from "@/lib/admin-actions";

export function UserAdminActions({ userId, isSuspended }: { userId: string; isSuspended: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const res = isSuspended ? await activateUser(userId) : await suspendUser(userId);
    setLoading(false);
    if (res.success) router.refresh();
  }

  return isSuspended ? (
    <Button size="sm" variant="ghost" loading={loading} onClick={handleToggle}>
      <CheckCircle className="mr-1 h-3.5 w-3.5 text-success-500" /> Activer
    </Button>
  ) : (
    <Button size="sm" variant="ghost" loading={loading} onClick={handleToggle}>
      <Ban className="mr-1 h-3.5 w-3.5 text-danger-500" /> Suspendre
    </Button>
  );
}
