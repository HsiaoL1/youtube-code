import { Button } from '@/components/ui/button';

export function EmptyState({ title, description, onRetry }: { title: string; description: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
