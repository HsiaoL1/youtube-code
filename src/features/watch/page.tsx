import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Share2,
  ThumbsDown,
  ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HlsPlayer } from '@/components/common/player';
import { CommentThread } from '@/components/common/comment-thread';
import { VideoCard } from '@/components/common/video-card';
import { useLikeVideo, useRecommendations, useVideoDetail } from './hooks';
import { formatCount, fromNow } from '@/lib/date';

export function WatchPage() {
  const { id = '' } = useParams();
  const detail = useVideoDetail(id);
  const rec = useRecommendations(id);
  const like = useLikeVideo(id);
  const [descExpanded, setDescExpanded] = useState(false);

  const video = detail.data?.video;
  if (!video) return <div className="text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
      <section className="space-y-3">
        {/* Player */}
        <div className="overflow-hidden rounded-xl">
          <HlsPlayer src={video.hlsUrl ?? ''} poster={video.coverUrl} autoPlay playbackKey={video.id} />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold leading-snug">{video.title}</h1>

        {/* Channel row + action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Channel info */}
          <div className="flex items-center gap-3">
            <img
              src={video.author.avatarUrl}
              className="h-10 w-10 rounded-full object-cover"
              alt={video.author.name}
            />
            <div>
              <p className="text-sm font-medium">{video.author.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatCount(video.author.followersCount)} subscribers
              </p>
            </div>
          </div>
          <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            Subscribe
          </Button>

          {/* Action buttons - pushed right */}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Like/Dislike pill */}
            <div className="flex items-center overflow-hidden rounded-full bg-secondary">
              <button
                onClick={() => like.mutate()}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium hover:bg-secondary/70"
              >
                <ThumbsUp className="h-4 w-4" />
                {formatCount(video.likes)}
              </button>
              <div className="h-6 w-px bg-border" />
              <button className="px-3 py-2 hover:bg-secondary/70">
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>

            <Button variant="secondary" className="gap-2 rounded-full">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button variant="secondary" className="gap-2 rounded-full">
              <Bookmark className="h-4 w-4" /> Save
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description card */}
        <div
          className="cursor-pointer rounded-xl bg-secondary p-3 text-sm transition-colors hover:bg-secondary/80"
          onClick={() => setDescExpanded(!descExpanded)}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>{formatCount(video.views)} views</span>
            <span>{fromNow(video.createdAt)}</span>
          </div>
          <p className={descExpanded ? 'mt-2 whitespace-pre-wrap' : 'mt-2 line-clamp-2'}>
            {video.description}
          </p>

          {/* Chapters */}
          {descExpanded && detail.data?.chapters && detail.data.chapters.length > 0 && (
            <div className="mt-3 space-y-1 border-t border-border pt-3">
              <p className="text-sm font-medium">Chapters</p>
              {detail.data.chapters.map((ch) => (
                <p key={ch.id} className="text-xs text-muted-foreground">
                  <span className="font-medium text-primary">
                    {Math.floor(ch.time / 60)}:{String(ch.time % 60).padStart(2, '0')}
                  </span>{' '}
                  {ch.title}
                </p>
              ))}
            </div>
          )}

          <button className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            {descExpanded ? (
              <>Show less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>...more <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        </div>

        {/* Comments */}
        <CommentThread entityType="video" entityId={id} />
      </section>

      {/* Sidebar recommendations */}
      <aside className="space-y-3">
        {(rec.data?.items ?? []).map((item) => (
          <VideoCard key={item.id} video={item} horizontal />
        ))}
      </aside>
    </div>
  );
}
