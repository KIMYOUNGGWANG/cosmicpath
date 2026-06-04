import { Skeleton } from '@/components/ui/skeleton';

export function StartPageFallback() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto pt-20 px-6 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  );
}
