import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notes de version",
  description: `Historique des publications et informations de mise en production — ${APP_NAME}.`,
};

function loadReleaseMarkdown(): string {
  try {
    return readFileSync(join(process.cwd(), "docs", "RELEASE_NOTES.md"), "utf8");
  } catch {
    return "# Notes de publication\n\n_Contenu indisponible pour le moment._\n";
  }
}

function renderSimpleMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  function flushList() {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`ul-${key++}`} className="my-3 list-disc space-y-1.5 pl-5 text-gray-700">
        {listItems.map((t, j) => (
          <li key={j}>{t}</li>
        ))}
      </ul>,
    );
    listItems = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={key++} className="text-2xl font-bold tracking-tight text-gray-900">
          {line.slice(2).trim()}
        </h1>,
      );
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={key++} className="mt-10 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-900 first:mt-0">
          {line.slice(3).trim()}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={key++} className="mt-6 text-lg font-medium text-gray-900">
          {line.slice(4).trim()}
        </h3>,
      );
    } else if (line.startsWith("- ")) {
      listItems.push(line.slice(2).trim());
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      elements.push(
        <p key={key++} className="mt-3 text-gray-700 leading-relaxed">
          {line}
        </p>,
      );
    }
  }
  flushList();
  return elements;
}

export default function VersionsPage() {
  const md = loadReleaseMarkdown();
  const label = process.env.NEXT_PUBLIC_APP_RELEASE_LABEL?.trim();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm text-gray-500">
        <Link href="/aide/faq" className="text-primary-600 hover:text-primary-700">
          FAQ
        </Link>
        {" · "}
        <Link href="/statut" className="text-primary-600 hover:text-primary-700">
          État des services
        </Link>
      </p>
      <article className="mt-4">{renderSimpleMarkdown(md)}</article>
      {label ? (
        <p className="mt-8 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <span className="font-medium">Release actuelle (production) :</span>{" "}
          <span className="font-mono">{label}</span>
        </p>
      ) : null}
      <p className="mt-8 text-xs text-gray-500">
        Source : fichier <code className="rounded bg-gray-100 px-1">docs/RELEASE_NOTES.md</code> — à mettre à jour à
        chaque release.
      </p>
    </div>
  );
}
