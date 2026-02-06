import { Link } from 'react-router-dom';
import type { Video } from '@/types';

export function ShortCard({ video }: { video: Video }) {
  return (
    <Link to="/shorts" className="block overflow-hidden rounded-xl border">
      <img src={video.coverUrl} alt={video.title} className="aspect-[9/16] w-full object-cover" />
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
      </div>
    </Link>
  );
}
