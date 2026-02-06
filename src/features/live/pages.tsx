import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { HlsPlayer } from '@/components/common/player';
import { LiveCard } from '@/components/common/live-card';
import { Button } from '@/components/ui/button';
import { useLiveChat, useLiveDetail, useLiveList } from './hooks';
import { WatchPage } from '@/features/watch/page';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/date';

const categories = ['All', 'Tech', 'Education', 'Gaming', 'Music'];

export function LiveSquarePage() {
  const [category, setCategory] = useState('All');
  const q = useLiveList(category);

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Live</h1>
      {/* Scrollable category pills */}
      <div className="flex gap-2 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              c === category
                ? 'bg-foreground text-background'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(q.data?.items as any[] | undefined)?.map((room) => (
          <LiveCard key={room.id} room={room} />
        ))}
      </div>
    </section>
  );
}

export function LiveRoomPage() {
  const { id = '' } = useParams();
  const [sp] = useSearchParams();
  const tab = sp.get('tab');
  const detail = useLiveDetail(id);
  const chat = useLiveChat(id);

  if (tab === 'replay') return <WatchPage />;

  const room = detail.data?.room as any;

  if (!room) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
      <section className="space-y-3">
        <div className="overflow-hidden rounded-xl">
          <HlsPlayer src={room.hlsUrl} poster={room.coverUrl} autoPlay />
        </div>
        <h1 className="text-xl font-bold">{room.title}</h1>

        {/* Channel row */}
        <div className="flex items-center gap-3">
          <img
            src={room.author.avatarUrl}
            className="h-10 w-10 rounded-full object-cover"
            alt={room.author.name}
          />
          <div>
            <p className="text-sm font-medium">{room.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCount(room.viewers)} watching now
            </p>
          </div>
          <Button className="ml-auto rounded-full bg-foreground text-background hover:bg-foreground/90">
            Subscribe
          </Button>
        </div>
      </section>

      {/* Live chat */}
      <div className="flex flex-col rounded-xl border" style={{ height: '70vh' }}>
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Live chat</h3>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {(chat.data?.items as any[] | undefined)?.map((msg) => (
            <div key={msg.id} className="flex gap-2 rounded-md px-2 py-1 hover:bg-accent">
              <img
                src={msg.author.avatarUrl}
                className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover"
                alt={msg.author.name}
              />
              <p className="text-sm">
                <span className="mr-1 font-medium text-muted-foreground">{msg.author.name}</span>
                {msg.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
