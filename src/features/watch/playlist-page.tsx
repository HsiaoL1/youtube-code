import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { playlistApi } from '@/lib/api/client';
import { VideoCard } from '@/components/common/video-card';

export function PlaylistPage() {
  const { id = '' } = useParams();
  const q = useQuery({ queryKey: ['playlist', id], queryFn: () => playlistApi.detail(id) });
  const playlist = q.data?.playlist as any;
  if (!playlist) return <p>Loading...</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">{playlist.title}</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {playlist.items.map((item: any) => <VideoCard key={item.id} video={item} />)}
      </div>
    </section>
  );
}
