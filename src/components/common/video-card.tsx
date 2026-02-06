import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { formatCount, formatDuration, fromNow } from '@/lib/date';
import type { Video } from '@/types';

export function VideoCard({ video, horizontal }: { video: Video; horizontal?: boolean }) {
  const href =
    video.type === 'short'
      ? '/shorts'
      : video.type === 'live'
        ? `/live/${video.id}`
        : `/watch/${video.id}`;

  if (horizontal) {
    return (
      <Link to={href} className="group flex gap-2">
        <div className="relative w-40 shrink-0">
          <img
            src={video.coverUrl}
            className="aspect-video w-full rounded-lg object-cover"
            alt={video.title}
          />
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-medium text-white">
            {formatDuration(video.duration)}
          </span>
        </div>
        <div className="flex-1 pt-0.5">
          <p className="line-clamp-2 text-sm font-medium leading-snug">{video.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{video.author.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatCount(video.views)} views · {fromNow(video.createdAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={href} className="group block">
      <div className="relative">
        <img
          src={video.coverUrl}
          className="aspect-video w-full rounded-xl object-cover"
          alt={video.title}
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        <img
          src={video.author.avatarUrl}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
          alt={video.author.name}
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <p className="line-clamp-2 text-sm font-medium leading-snug">{video.title}</p>
            <button className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{video.author.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatCount(video.views)} views · {fromNow(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
