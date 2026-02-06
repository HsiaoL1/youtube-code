import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { channelApi } from '@/lib/api/client';
import { VideoCard } from '@/components/common/video-card';
import { Button } from '@/components/ui/button';
import { formatCount } from '@/lib/date';
import { cn } from '@/lib/utils';

const tabs = ['Home', 'Videos', 'Shorts', 'Replay', 'About'];

export function ChannelPage() {
  const { id = '' } = useParams();
  const [activeTab, setActiveTab] = useState('Videos');
  const q = useQuery({ queryKey: ['channel', id], queryFn: () => channelApi.detail(id) });
  const channel = q.data?.channel as any;
  const content = q.data?.content ?? [];

  if (!channel) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <section className="space-y-4">
      {/* Banner */}
      <div
        className="h-28 rounded-xl bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 sm:h-36 lg:h-44"
        style={{
          backgroundImage: `url(https://picsum.photos/seed/${id}/1200/300)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Channel info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={channel.avatarUrl}
            className="h-20 w-20 rounded-full object-cover"
            alt={channel.name}
          />
          <div>
            <h1 className="text-2xl font-bold">{channel.name}</h1>
            <p className="text-sm text-muted-foreground">
              {channel.handle} · {formatCount(channel.followersCount)} subscribers
            </p>
          </div>
        </div>
        <Button className="w-fit rounded-full bg-foreground text-background hover:bg-foreground/90">
          Subscribe
        </Button>
      </div>

      {/* Tabs - underlined style */}
      <div className="border-b">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                tab === activeTab
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content grid */}
      {activeTab === 'About' ? (
        <div className="max-w-xl space-y-2 text-sm text-muted-foreground">
          <p>Channel created by {channel.name}</p>
          <p>{formatCount(channel.followersCount)} subscribers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {content.map((item) => (
            <VideoCard key={item.id} video={item} />
          ))}
        </div>
      )}
    </section>
  );
}
