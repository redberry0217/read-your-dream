import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'h-10 w-full min-w-0 rounded-lg border border-stroke-default bg-white px-3 text-sm text-ink-body transition-[border-color,box-shadow] outline-none placeholder:text-ink-light focus-visible:ring-3 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-tertiary',
  {
    variants: {
      color: {
        seokganju: 'focus-visible:border-seokganju-500 focus-visible:ring-seokganju-100/35',
        guncheong: 'focus-visible:border-guncheong-500 focus-visible:ring-guncheong-100/35',
        yangrok: 'focus-visible:border-yangrok-500 focus-visible:ring-yangrok-100/35',
        podo: 'focus-visible:border-podo-500 focus-visible:ring-podo-100/35',
      },
    },
    defaultVariants: {
      color: 'seokganju',
    },
  },
);

function Input({
  className,
  type,
  color = 'seokganju',
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ color }), className)}
      {...props}
    />
  );
}

export { Input };
