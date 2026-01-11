import { Skeleton } from "@/components/ui/skeleton";

export const DiaryPageSkeleton = () => {
  return (
    <div className="h-full flex flex-col animate-pulse">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between p-3 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      </div>

      {/* Notebook content skeleton */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          {/* Page content area */}
          <div className="bg-muted/20 rounded-xl p-6 min-h-[400px] space-y-4">
            {/* Simulated content blocks */}
            <div className="flex gap-4">
              <Skeleton className="h-20 w-40 rounded-lg" />
              <Skeleton className="h-20 w-48 rounded-lg" />
            </div>
            <Skeleton className="h-24 w-64 rounded-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-16 w-36 rounded-lg" />
              <Skeleton className="h-16 w-52 rounded-lg" />
              <Skeleton className="h-16 w-44 rounded-lg" />
            </div>
            <Skeleton className="h-32 w-80 rounded-lg" />
          </div>

          {/* Page navigation skeleton */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="flex gap-1">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DiarySidebarSkeleton = () => {
  return (
    <div className="w-72 sm:w-80 lg:w-96 xl:w-[420px] border-r border-border/30 p-2.5 sm:p-3 lg:p-4 space-y-4">
      {/* Search skeleton */}
      <Skeleton className="h-9 w-full rounded-lg" />
      
      {/* Tabs skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>

      {/* Items list skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 p-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const DiaryFullSkeleton = () => {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      <DiarySidebarSkeleton />
      <div className="flex-1">
        <DiaryPageSkeleton />
      </div>
    </div>
  );
};
