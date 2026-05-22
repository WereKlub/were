import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col overflow-hidden border border-border/40 bg-background">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2.5 border-t border-border/40 p-3 md:p-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
};
