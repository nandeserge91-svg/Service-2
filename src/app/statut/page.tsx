import type { Metadata } from "next";
import Link from "next/link";
import { StatusPanel } from "./status-panel";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "État des services",
  description: `État opérationnel de ${APP_NAME} : application et base de données.`,
};

export default function StatutPage() {
  const externalStatusUrl = process.env.NEXT_PUBLIC_EXTERNAL_STATUS_URL?.trim();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">État des services</h1>
      <p className="mt-2 text-sm text-gray-600">
        Vue synthétique pour les utilisateurs. Les incidents majeurs peuvent aussi être annoncés sur la page{" "}
        <Link href="/aide/versions" className="font-medium text-primary-600 hover:text-primary-700">
          Notes de version
        </Link>
        .
      </p>
      <div className="mt-8">
        <StatusPanel externalStatusUrl={externalStatusUrl} />
      </div>
    </div>
  );
}
