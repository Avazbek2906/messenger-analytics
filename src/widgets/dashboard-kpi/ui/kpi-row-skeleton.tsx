import { Skeleton } from '@/shared/ui/primitives/skeleton'

/** A size-matched skeleton for the KPI row — the layout never shifts. */
export function KpiRowSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="rounded-xl bg-surface p-5 shadow-card ring-1 ring-line ring-inset"
        >
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <Skeleton className="mt-4 h-8 w-20" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  )
}
