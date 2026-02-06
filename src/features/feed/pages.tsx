import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { VideoCard } from '@/components/common/video-card';
import { useHomeFeed, useSubscriptionsFeed, useTrendingFeed } from './hooks';
import { cn } from '@/lib/utils';

const categories = [
  'All',
  'Music',
  'Gaming',
  'Tech',
  'Design',
  'Education',
  'News',
  'Sports',
  'Entertainment'
];

function CategoryChips({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="absolute -left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background p-1 shadow md:block"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-2 overflow-x-auto px-1 py-1"
      >
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              c === value
                ? 'bg-foreground text-background'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute -right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background p-1 shadow md:block"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

function FeedGrid({ loading, items }: { loading: boolean; items: any[] }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!items.length) return <EmptyState title="No content" description="Try again later" />;
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}

export function HomePage() {
  const [category, setCategory] = useState('All');
  const q = useHomeFeed(category);

  return (
    <section className="space-y-5">
      <CategoryChips value={category} onChange={setCategory} />
      <FeedGrid loading={q.isLoading} items={q.data?.items ?? []} />
    </section>
  );
}

export function TrendingPage() {
  const q = useTrendingFeed();
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Trending</h1>
      <FeedGrid loading={q.isLoading} items={q.data?.items ?? []} />
    </section>
  );
}

export function SubscriptionsPage() {
  const q = useSubscriptionsFeed();
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      <FeedGrid loading={q.isLoading} items={q.data?.items ?? []} />
    </section>
  );
}
