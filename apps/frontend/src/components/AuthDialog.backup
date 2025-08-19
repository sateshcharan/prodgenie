import { ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from '@prodgenie/libs/ui';
import { cn } from '@prodgenie/libs/utils';

export default function AuthDialog({
  open,
  onOpenChange,
  children,
  imageUrl = '/assets/auth-illustration.jpg', // fallback image
  imageAlt = 'Authentication illustration',
  className,
  modalType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  imageUrl?: string;
  imageAlt?: string;
  className?: string;
  modalType: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-md z-50" />
      <DialogContent
        className={cn(
          'max-w-4xl p-0 overflow-hidden bg-white shadow-xl rounded-lg z-50',
          className
        )}
      >
        <DialogTitle className="hidden">{modalType}</DialogTitle>
        <DialogDescription className="hidden">{modalType}</DialogDescription>

        <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
          {/* Left side: Image */}
          <div className="hidden md:block bg-muted">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Right side: Form */}
          <div className="flex flex-col justify-center items-center p-6 sm:p-8 ">
            <DialogHeader />
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
