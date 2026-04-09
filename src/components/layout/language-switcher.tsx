"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setUserLocale } from "@/lib/locale-actions";
import type { AppLocale } from "@/i18n/request";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const t = useTranslations("Header");

  function pick(next: AppLocale) {
    if (next === locale) return;
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      className={cn("flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5 text-xs", className)}
      role="group"
      aria-label={t("langLabel")}
    >
      <button
        type="button"
        disabled={pending}
        onClick={() => pick("fr")}
        className={cn(
          "rounded px-2 py-1 font-medium transition-colors",
          locale === "fr" ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-50",
        )}
      >
        {t("langFr")}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => pick("en")}
        className={cn(
          "rounded px-2 py-1 font-medium transition-colors",
          locale === "en" ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-50",
        )}
      >
        {t("langEn")}
      </button>
    </div>
  );
}
