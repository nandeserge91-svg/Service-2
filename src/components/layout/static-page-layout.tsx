import { Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs";

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

export function StaticPageLayout({ title, subtitle, breadcrumbs, children }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
      </header>
      <div className="prose prose-sm prose-gray max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline">
        {children}
      </div>
    </div>
  );
}
