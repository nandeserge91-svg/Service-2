import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "./star-rating";

interface ReviewCardProps {
  rating: number;
  comment: string | null;
  buyerName: string;
  buyerImage?: string | null;
  createdAt: string;
  sellerResponse?: string | null;
  sellerRespondedAt?: string | null;
  serviceTitle?: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Il y a ${months} mois`;
  return `Il y a ${Math.floor(months / 12)} an(s)`;
}

export function ReviewCard({
  rating,
  comment,
  buyerName,
  buyerImage,
  createdAt,
  sellerResponse,
  sellerRespondedAt,
  serviceTitle,
}: ReviewCardProps) {
  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <Avatar name={buyerName} src={buyerImage} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{buyerName}</span>
            <span className="text-xs text-gray-400">{timeAgo(createdAt)}</span>
          </div>
          <StarRating value={rating} size="sm" />
          {serviceTitle && (
            <p className="mt-0.5 text-xs text-gray-400">{serviceTitle}</p>
          )}
          {comment && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{comment}</p>
          )}

          {sellerResponse && (
            <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium text-gray-500">
                Réponse du vendeur
                {sellerRespondedAt && (
                  <span className="font-normal"> · {timeAgo(sellerRespondedAt)}</span>
                )}
              </p>
              <p className="mt-1 text-sm text-gray-600">{sellerResponse}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
