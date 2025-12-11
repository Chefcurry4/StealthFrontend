import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CourseCardSkeleton = () => {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="h-20 sm:h-24 lg:h-28 w-full rounded-none" />
      <CardHeader className="flex-1 space-y-1 sm:space-y-2 p-3 sm:p-4 lg:p-6">
        <Skeleton className="h-4 sm:h-5 lg:h-6 w-3/4" />
        <Skeleton className="h-3 sm:h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 lg:p-6 pt-0">
        <div className="flex gap-1 sm:gap-2">
          <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
          <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 sm:h-8 lg:h-9 flex-1" />
          <Skeleton className="h-7 sm:h-8 lg:h-9 w-7 sm:w-8 lg:w-9" />
        </div>
      </CardContent>
    </Card>
  );
};
