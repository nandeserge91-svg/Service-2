"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./star-rating";
import { submitReview } from "@/lib/review-actions";

interface ReviewFormProps {
  orderId: string;
}

export function ReviewForm({ orderId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-xl border border-success-200 bg-success-50 px-5 py-4 text-center">
        <Star className="mx-auto mb-2 h-8 w-8 text-warning-400" />
        <p className="font-medium text-success-700">Merci pour votre avis !</p>
        <p className="mt-1 text-xs text-success-600">
          Votre retour aide les autres acheteurs et le vendeur.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setError("Veuillez sélectionner une note.");
      return;
    }
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    fd.set("orderId", orderId);
    fd.set("rating", String(rating));

    const result = await submitReview(fd);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setDone(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Votre note
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="mt-1 text-xs text-gray-400">
            {rating === 1 && "Très insatisfait"}
            {rating === 2 && "Insatisfait"}
            {rating === 3 && "Correct"}
            {rating === 4 && "Satisfait"}
            {rating === 5 && "Excellent"}
          </p>
        )}
      </div>

      <Textarea
        name="comment"
        label="Votre commentaire (optionnel)"
        placeholder="Décrivez votre expérience avec ce vendeur…"
        rows={3}
      />

      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}

      <Button
        type="submit"
        loading={loading}
        icon={<Send className="h-4 w-4" />}
        disabled={rating === 0}
      >
        Publier mon avis
      </Button>
    </form>
  );
}
