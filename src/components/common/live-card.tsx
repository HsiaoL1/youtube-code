import { Link } from 'react-router-dom';
import { formatCount } from '@/lib/date';
import type { LiveRoom } from '@/types';

export function LiveCard({ room }: { room: LiveRoom }) {
  return (
    <Link to={`/live/${room.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={room.coverUrl}
          alt={room.title}
          className="aspect-video w-full object-cover transition group-hover:scale-[1.02]"
        />
        {/* LIVE badge */}
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          LIVE
        </span>
        {/* Viewer count overlay */}
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {formatCount(room.viewers)} watching
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        <img
          src={room.author.avatarUrl}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
          alt={room.author.name}
        />
        <div>
          <p className="line-clamp-2 text-sm font-medium leading-snug">{room.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{room.author.name}</p>
        </div>
      </div>
    </Link>
  );
}
