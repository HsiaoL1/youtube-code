import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, Trash2 } from 'lucide-react';
import { commentApi } from '@/lib/api/client';
import { commentInputSchema, type Comment, type CommentInput } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { fromNow } from '@/lib/date';

export function CommentThread({ entityType, entityId }: { entityType: 'video' | 'short' | 'live'; entityId: string }) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const commentsQuery = useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: () => commentApi.list(entityType, entityId)
  });

  const form = useForm<CommentInput>({
    resolver: zodResolver(commentInputSchema),
    defaultValues: { content: '' }
  });

  const createMut = useMutation({
    mutationFn: (content: string) =>
      commentApi.create({ entityType, entityId, content, currentUserId: user?.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', entityType, entityId] });
      form.reset();
    }
  });

  const likeMut = useMutation({
    mutationFn: (id: string) => commentApi.like(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', entityType, entityId] })
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => commentApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', entityType, entityId] })
  });

  const items = (commentsQuery.data?.items as Comment[] | undefined) ?? [];
  const roots = items.filter((c) => !c.parentId);

  return (
    <section className="space-y-5">
      <h3 className="text-base font-bold">{items.length} Comments</h3>

      {/* Comment input */}
      <form
        onSubmit={form.handleSubmit((v) => createMut.mutate(v.content))}
        className="flex gap-3"
      >
        {user && (
          <img
            src={user.avatarUrl}
            className="mt-1 h-8 w-8 shrink-0 rounded-full object-cover"
            alt={user.name}
          />
        )}
        <div className="flex-1">
          <input
            placeholder="Add a comment..."
            className="w-full border-b bg-transparent pb-1 text-sm outline-none focus:border-foreground"
            {...form.register('content')}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-full"
              disabled={createMut.isPending}
            >
              Comment
            </Button>
          </div>
        </div>
      </form>

      {/* Comment list */}
      {roots.map((item) => (
        <CommentItem
          key={item.id}
          comment={item}
          replies={items.filter((x) => x.parentId === item.id)}
          currentUserId={user?.id}
          onLike={(id) => likeMut.mutate(id)}
          onDelete={(id) => deleteMut.mutate(id)}
        />
      ))}
    </section>
  );
}

function CommentItem({
  comment,
  replies,
  currentUserId,
  onLike,
  onDelete
}: {
  comment: Comment;
  replies: Comment[];
  currentUserId?: string;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="flex gap-3">
      <img
        src={comment.author.avatarUrl}
        className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
        alt={comment.author.name}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">{fromNow(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm">{comment.content}</p>
        <div className="mt-1 flex items-center gap-3">
          <button
            onClick={() => onLike(comment.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {comment.likeCount > 0 && comment.likeCount}
          </button>
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs font-medium text-primary"
            >
              {showReplies ? 'Hide' : `${replies.length}`} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
          {comment.author.id === currentUserId && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <img
                  src={reply.author.avatarUrl}
                  className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover"
                  alt={reply.author.name}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{reply.author.name}</span>
                    <span className="text-xs text-muted-foreground">{fromNow(reply.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-sm">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
