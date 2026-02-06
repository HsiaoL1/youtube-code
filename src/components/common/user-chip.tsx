import type { User } from '@/types';

export function UserChip({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-2">
      <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full" />
      <div>
        <p className="text-sm font-medium leading-none">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.handle}</p>
      </div>
    </div>
  );
}
