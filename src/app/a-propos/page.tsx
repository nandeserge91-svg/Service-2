import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, Globe, Heart, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "À propos",
  description: `Découvrez ${APP_NAME}, la marketplace de services pensée pour l'Afrique.`,
};

export default async function AboutPage() {
  const t = await getTranslations("About");

  const values = [
    { icon: Globe, title: t("valueAfricaTitle"), desc: t("valueAfricaDesc"), color: "bg-primary-50 text-primary-600" },
    { icon: ShieldCheck, title: t("valueTrustTitle"), desc: t("valueTrustDesc"), color: "bg-success-50 text-success-600" },
    { icon: Heart, title: t("valueSimpleTitle"), desc: t("valueSimpleDesc"), color: "bg-warning-50 text-warning-600" },
    { icon: Zap, title: t("valuePerfTitle"), desc: t("valuePerfDesc"), color: "bg-indigo-50 text-indigo-600" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: t("title", { appName: APP_NAME }).split(APP_NAME)[0] + APP_NAME }]} />
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {t("title", { appName: APP_NAME })}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-500">
          {t("subtitle")}
        </p>
      </header>

      <section className="prose prose-sm prose-gray mx-auto mb-12 max-w-2xl">
        <h2>{t("missionTitle")}</h2>
        <p>{t("missionP1", { appName: APP_NAME })}</p>
        <p>{t("missionP2")}</p>

        <h2>{t("forWhoTitle")}</h2>
        <p><strong>{t("forClients")}</strong></p>
        <p><strong>{t("forSellers")}</strong></p>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-center text-xl font-bold text-gray-900">{t("valuesTitle")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <Card key={v.title} className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${v.color}`}
              >
                <v.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{v.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{v.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-primary-50 p-8 text-center">
        <h2 className="text-lg font-bold text-primary-900">{t("joinTitle")}</h2>
        <p className="mt-2 text-sm text-primary-700">
          {t("joinDesc", { appName: APP_NAME })}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href="/auth/inscription"
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            {t("joinRegister")}
          </a>
          <a
            href="/contact"
            className="rounded-lg border border-primary-200 bg-white px-5 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-50"
          >
            {t("joinContact")}
          </a>
        </div>
      </section>
    </div>
  );
}
