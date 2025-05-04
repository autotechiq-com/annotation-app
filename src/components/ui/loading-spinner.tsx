'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const spinnerVariants = 'w-4 h-4 border-2 border-t-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>((props, ref) => {
  const { className, ...rest } = props;
  return <div ref={ref} className={cn(spinnerVariants, className)} {...rest} />;
});

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };
