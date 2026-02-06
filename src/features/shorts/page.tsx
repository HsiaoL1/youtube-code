import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, MoreVertical, Share2, ThumbsDown, Volume2, VolumeX } from 'lucide-react';
import { useLikeShort, useShortsList } from './hooks';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { CommentThread } from '@/components/common/comment-thread';
import { formatCount } from '@/lib/date';

export function ShortsPage() {
  const q = useShortsList();
  const like = useLikeShort();
  const refs = useRef<Array<HTMLVideoElement | null>>([]);
  const [commentOpen, setCommentOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            refs.current.forEach((v) => v?.pause());
            el.play().catch(() => null);
            setActiveId(el.dataset.id ?? '');
          } else {
            el.pause();
          }
        });
      },
      { threshold: 0.7 }
    );
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [q.data]);

  const items = q.data?.items ?? [];

  return (
    <div
      className="mx-auto max-w-[420px]"
      style={{
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        scrollSnapType: 'y mandatory'
      }}
    >
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative flex items-center justify-center"
          style={{
            height: 'calc(100vh - 56px)',
            scrollSnapAlign: 'start'
          }}
        >
          {/* Video */}
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
            <video
              data-id={item.id}
              ref={(el) => (refs.current[idx] = el)}
              src={item.hlsUrl ?? 'https://www.w3schools.com/html/mov_bbb.mp4'}
              poster={item.coverUrl}
              className="h-full w-full object-cover"
              loop
              playsInline
              muted={muted}
              preload="metadata"
            />

            {/* Bottom overlay: author info */}
            <div className="absolute bottom-0 left-0 right-14 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16">
              <div className="flex items-center gap-2">
                <img
                  src={item.author.avatarUrl}
                  className="h-9 w-9 rounded-full border-2 border-white object-cover"
                  alt={item.author.name}
                />
                <span className="text-sm font-semibold text-white">{item.author.name}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-white/90">{item.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                  <span>♪</span> Original audio
                </div>
              </div>
            </div>

            {/* Right side action buttons */}
            <div className="absolute bottom-20 right-3 flex flex-col items-center gap-5">
              <ActionButton
                icon={<Heart className="h-6 w-6" />}
                label={formatCount(item.likes)}
                onClick={() => like.mutate(item.id)}
              />
              <ActionButton
                icon={<ThumbsDown className="h-6 w-6" />}
                label="Dislike"
                onClick={() => {}}
              />
              <ActionButton
                icon={<MessageCircle className="h-6 w-6" />}
                label="Comments"
                onClick={() => {
                  setActiveId(item.id);
                  setCommentOpen(true);
                }}
              />
              <ActionButton
                icon={<Share2 className="h-6 w-6" />}
                label="Share"
                onClick={() => {}}
              />
              <ActionButton
                icon={muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                label={muted ? 'Unmute' : 'Mute'}
                onClick={() => setMuted(!muted)}
              />
              <ActionButton
                icon={<MoreVertical className="h-6 w-6" />}
                label=""
                onClick={() => {}}
              />
            </div>
          </div>
        </div>
      ))}

      <Drawer open={commentOpen} onOpenChange={setCommentOpen}>
        <DrawerContent>
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {activeId ? <CommentThread entityType="short" entityId={activeId} /> : null}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 text-white drop-shadow-lg"
    >
      {icon}
      {label && <span className="text-[11px] font-medium">{label}</span>}
    </button>
  );
}
