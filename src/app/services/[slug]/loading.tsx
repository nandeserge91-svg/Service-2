import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-4 h-4 w-64" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-56 w-full rounded-xl sm:h-72" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <Skeleton className="mb-3 h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-8 w-28" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="mt-5 h-10 w-full rounded-lg" />
            <Skeleton className="mt-2 h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
