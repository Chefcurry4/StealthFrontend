import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProgramCardSkeleton = () => {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="h-20 sm:h-24 lg:h-28 w-full rounded-none" />
      <CardHeader className="flex-1 p-3 sm:p-4 lg:p-6">
        <Skeleton className="h-4 sm:h-5 lg:h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 lg:p-6 pt-0">
        <Skeleton className="h-8 sm:h-10 lg:h-12 w-full" />
        <Skeleton className="h-7 sm:h-8 lg:h-9 w-full" />
      </CardContent>
    </Card>
  );
};
