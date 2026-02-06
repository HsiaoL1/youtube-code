import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;

export function DrawerContent({ className, ...props }: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
      <DialogPrimitive.Content
        className={cn('fixed bottom-0 right-0 top-0 z-50 w-full max-w-md border-l bg-background p-4 shadow-xl', className)}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
}
