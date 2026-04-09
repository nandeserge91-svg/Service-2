"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  onChange?: (value: number) => void;
  showValue?: boolean;
  count?: number;
}

const sizes = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  value,
  max = 5,
  size = "md",
  onChange,
  showValue = false,
  count,
}: StarRatingProps) {
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          const filled = starValue <= value;
          const half = !filled && starValue - 0.5 <= value;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => onChange?.(starValue)}
              onMouseEnter={undefined}
              className={cn(
                "transition-colors",
                interactive && "cursor-pointer hover:scale-110",
                !interactive && "cursor-default",
              )}
              aria-label={`${starValue} étoile${starValue > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  sizes[size],
                  filled
                    ? "fill-warning-400 text-warning-400"
                    : half
                      ? "fill-warning-400/50 text-warning-400"
                      : "fill-gray-200 text-gray-200",
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && value > 0 && (
        <span className="ml-1 text-sm font-semibold text-gray-700">{value.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="ml-0.5 text-sm text-gray-400">({count})</span>
      )}
    </div>
  );
}
