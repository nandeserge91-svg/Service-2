import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MaintenanceBanner } from "@/components/layout/maintenance-banner";
import { Providers } from "@/components/providers";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  adjustFontFallback: true,
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${APP_NAME} — Services professionnels en Afrique`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Trouvez les meilleurs prestataires de services en Afrique. Paiement sécurisé, livraison suivie, support réactif.",
  applicationName: APP_NAME,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: APP_NAME,
    title: `${APP_NAME} — Le talent africain, à portée de clic`,
    description:
      "Trouvez des professionnels qualifiés pour tous vos projets. Paiement sécurisé, livraison garantie.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Services professionnels en Afrique`,
    description:
      "Trouvez des professionnels qualifiés pour tous vos projets. Paiement sécurisé, livraison garantie.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  alternates: { canonical: siteUrl },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563EB",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const tLayout = await getTranslations("Layout");

  return (
    <html lang={locale} className={inter.variable}>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <a href="#main-content" className="skip-to-content">
              {tLayout("skipToContent")}
            </a>
            <MaintenanceBanner />
            <Header />
            <main id="main-content" className="flex-1 pb-16 sm:pb-0" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
