"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { respondToReview } from "@/lib/review-actions";

interface Props {
  reviewId: string;
}

export function SellerResponseForm({ reviewId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <MessageSquare className="mr-1 h-3.5 w-3.5" /> Répondre à cet avis
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("reviewId", reviewId);
    const result = await respondToReview(fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <Textarea
        name="response"
        placeholder="Répondez de manière professionnelle…"
        rows={2}
        required
      />
      {error && <p className="text-xs text-danger-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={loading}>Publier</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
      </div>
    </form>
  );
}
