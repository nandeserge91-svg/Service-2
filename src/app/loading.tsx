import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-600 to-primary-900 px-4 py-16 text-center sm:py-24">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="mx-auto h-6 w-48 rounded-full bg-white/10" />
          <Skeleton className="mx-auto h-12 w-full max-w-xl bg-white/10" />
          <Skeleton className="mx-auto h-5 w-80 bg-white/10" />
          <Skeleton className="mx-auto mt-4 h-14 w-full max-w-xl rounded-2xl bg-white/20" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Skeleton className="mx-auto mb-8 h-8 w-56" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    </>
  );
}
