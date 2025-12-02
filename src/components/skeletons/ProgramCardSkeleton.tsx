import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProgramCardSkeleton = () => {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="h-32 w-full rounded-none" />
      <CardHeader className="flex-1">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
};
