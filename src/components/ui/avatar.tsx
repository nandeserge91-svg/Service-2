import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const sizePx: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  verified?: boolean;
  className?: string;
  /** Si true, charge l’image en priorité (ex. hero, premier résultat) */
  priority?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const FALLBACK_COLORS = [
  "bg-primary-100 text-primary-700",
  "bg-success-100 text-success-700",
  "bg-warning-100 text-warning-600",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
];

function pickColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

/** Hôtes couverts par `images.remotePatterns` dans next.config.ts */
function shouldUseNextImage(src: string): boolean {
  try {
    const { protocol, hostname } = new URL(src);
    if (protocol !== "https:") return false;
    if (
      hostname === "lh3.googleusercontent.com" ||
      hostname.endsWith(".googleusercontent.com") ||
      hostname === "avatars.githubusercontent.com" ||
      hostname === "secure.gravatar.com" ||
      hostname === "graph.facebook.com"
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function Avatar({
  src,
  name,
  size = "md",
  verified = false,
  className,
  priority = false,
}: AvatarProps) {
  const dim = sizePx[size];

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        shouldUseNextImage(src) ? (
          <Image
            src={src}
            alt={name}
            width={dim}
            height={dim}
            priority={priority}
            sizes={`${dim}px`}
            className={cn("rounded-full object-cover", sizeStyles[size])}
          />
        ) : (
          // CDN / S3 / domaines non listés dans next.config — pas d’optimisation Next
          <img
            src={src}
            alt={name}
            width={dim}
            height={dim}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "low"}
            className={cn("rounded-full object-cover", sizeStyles[size])}
          />
        )
      ) : (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full font-medium",
            sizeStyles[size],
            pickColor(name),
          )}
          aria-label={name}
        >
          {getInitials(name)}
        </span>
      )}
      {verified && (
        <span
          className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-success-500 text-[10px] text-white"
          title="Vérifié"
          aria-hidden
        >
          ✓
        </span>
      )}
    </span>
  );
}
