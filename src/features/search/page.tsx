import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useDebounce } from '@/lib/utils/use-debounce';
import { VideoCard } from '@/components/common/video-card';
import { Button } from '@/components/ui/button';
import { useSearch } from './hooks';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/date';

const tabOptions = [
  { value: 'video', label: 'Videos' },
  { value: 'channel', label: 'Channels' },
  { value: 'live', label: 'Live' },
  { value: 'short', label: 'Shorts' }
];

export function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const qFromUrl = sp.get('q') ?? '';
  const tab = sp.get('tab') ?? 'video';
  const sort = sp.get('sort') ?? 'relevance';
  const [q, setQ] = useState(qFromUrl);
  const debounced = useDebounce(q, 350);

  useEffect(() => {
    setSp((prev) => {
      prev.set('q', debounced);
      prev.set('tab', tab);
      prev.set('sort', sort);
      return prev;
    });
  }, [debounced, tab, sort, setSp]);

  const query = useSearch(debounced, tab, sort);

  const list = useMemo(() => {
    if (!query.data) return [];
    if (tab === 'short') return query.data.shorts;
    if (tab === 'live') return query.data.lives as any[];
    if (tab === 'channel') return query.data.channels as any[];
    return query.data.videos;
  }, [query.data, tab]);

  return (
    <section className="mx-auto max-w-4xl space-y-4">
      {/* Search input */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search videos, channels, live..."
            className="h-10 w-full rounded-l-full border border-r-0 bg-background px-4 text-sm outline-none focus:border-primary"
          />
          <button className="flex h-10 w-14 items-center justify-center rounded-r-full border bg-secondary">
            <Search className="h-4 w-4" />
          </button>
        </div>
        <select
          className="h-10 rounded-full border bg-background px-3 text-sm"
          value={sort}
          onChange={(e) => setSp({ q: debounced, tab, sort: e.target.value })}
        >
          <option value="relevance">Relevance</option>
          <option value="latest">Latest</option>
          <option value="views">Most viewed</option>
        </select>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto">
        {tabOptions.map((t) => (
          <button
            key={t.value}
            onClick={() => setSp({ q: debounced, tab: t.value, sort })}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              t.value === tab
                ? 'bg-foreground text-background'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {list.map((item: any) =>
          tab === 'channel' ? (
            <Link
              key={item.id}
              to={`/channel/${item.id}`}
              className="flex items-center gap-4 rounded-xl p-3 hover:bg-accent"
            >
              <img
                src={item.avatarUrl}
                className="h-16 w-16 rounded-full object-cover"
                alt={item.name}
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.handle} · {formatCount(item.followersCount)} subscribers
                </p>
              </div>
              <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                Subscribe
              </Button>
            </Link>
          ) : tab === 'live' ? (
            <Link
              key={item.id}
              to={`/live/${item.id}`}
              className="flex gap-4 rounded-xl p-2 hover:bg-accent"
            >
              <div className="relative w-64 shrink-0">
                <img
                  src={item.coverUrl}
                  className="aspect-video w-full rounded-lg object-cover"
                  alt={item.title}
                />
                <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
                </span>
              </div>
              <div className="pt-1">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.author?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCount(item.viewers)} watching · {item.category}
                </p>
              </div>
            </Link>
          ) : (
            <VideoCard key={item.id} video={item} horizontal />
          )
        )}
      </div>
    </section>
  );
}
