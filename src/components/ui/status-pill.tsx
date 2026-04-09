import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";

interface StatusPillProps {
  status: string;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const label = ORDER_STATUS_LABELS[status] ?? status;
  const colors = ORDER_STATUS_COLORS[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        colors.bg,
        colors.text,
        className
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", colors.dot)}
        aria-hidden
      />
      {label}
    </span>
  );
}
