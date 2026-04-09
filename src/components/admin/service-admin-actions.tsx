"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishService, archiveService } from "@/lib/admin-actions";

export function ServiceAdminActions({ serviceId, status }: { serviceId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function exec(action: () => Promise<{ success?: boolean }>, key: string) {
    setLoading(key);
    const res = await action();
    setLoading(null);
    if (res.success) router.refresh();
  }

  return (
    <div className="flex gap-1">
      {status !== "PUBLISHED" && (
        <Button
          size="sm"
          variant="ghost"
          loading={loading === "publish"}
          onClick={() => exec(() => publishService(serviceId), "publish")}
        >
          <CheckCircle className="mr-1 h-3.5 w-3.5 text-success-500" /> Publier
        </Button>
      )}
      {status !== "ARCHIVED" && (
        <Button
          size="sm"
          variant="ghost"
          loading={loading === "archive"}
          onClick={() => exec(() => archiveService(serviceId), "archive")}
        >
          <Archive className="mr-1 h-3.5 w-3.5 text-gray-400" /> Archiver
        </Button>
      )}
    </div>
  );
}
