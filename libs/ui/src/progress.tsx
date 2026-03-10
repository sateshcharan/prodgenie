import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@prodgenie/libs/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = 0, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      // transparent background + outline only
      'relative h-4 w-full rounded-full border border-2 border-green-500 bg-transparent overflow-hidden',
      className
    )}
    {...props}
  >
    {value && (
      <ProgressPrimitive.Indicator
        className="h-full bg-green-500 transition-all"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    )}
  </ProgressPrimitive.Root>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
