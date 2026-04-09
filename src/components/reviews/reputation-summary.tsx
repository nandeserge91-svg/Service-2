import { StarRating } from "./star-rating";

interface ReputationSummaryProps {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export function ReputationSummary({
  averageRating,
  totalReviews,
  distribution,
}: ReputationSummaryProps) {
  if (totalReviews === 0) {
    return (
      <div className="text-center text-sm text-gray-400">
        Aucun avis pour le moment
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="text-center">
        <p className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
        <StarRating value={averageRating} size="sm" />
        <p className="mt-1 text-xs text-gray-400">
          {totalReviews} avis
        </p>
      </div>

      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] ?? 0;
          const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-right text-gray-500">{star}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-warning-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-right text-gray-400">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
