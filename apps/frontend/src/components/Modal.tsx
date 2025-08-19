import { ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from '@prodgenie/libs/ui';
import { cn } from '@prodgenie/libs/utils';
import { useModalStore } from '@prodgenie/libs/store';

export default function Modal({
  children,
  title,
  description,
  className,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
}) {
  const { isOpen, closeModal } = useModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-md z-50" />
      <DialogContent
        className={cn(
          'max-w-3xl p-0 overflow-hidden bg-white shadow-xl rounded-lg z-50',
          className
        )}
      >
        <DialogTitle className="hidden">{title}</DialogTitle>
        {description && (
          <DialogDescription className="hidden">
            {description}
          </DialogDescription>
        )}

        {children}
      </DialogContent>
    </Dialog>
  );
}
