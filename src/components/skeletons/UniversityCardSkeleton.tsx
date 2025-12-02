import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const UniversityCardSkeleton = () => {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <CardHeader className="flex-1">
        <Skeleton className="h-6 w-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  );
};
