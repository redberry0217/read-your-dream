import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'min-h-24 w-full resize-y rounded-lg border border-stone-700 bg-stone-900/90 px-3 py-2.5 text-sm text-stone-100 transition-[border-color,box-shadow] outline-none placeholder:text-stone-400 focus-visible:ring-3 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-stone-500',
  {
    variants: {
      color: {
        seokganju: 'focus-visible:border-seokganju-500 focus-visible:ring-seokganju-500/30',
        guncheong: 'focus-visible:border-guncheong-500 focus-visible:ring-guncheong-500/30',
        yangrok: 'focus-visible:border-yangrok-500 focus-visible:ring-yangrok-500/30',
        podo: 'focus-visible:border-podo-500 focus-visible:ring-podo-500/30',
      },
    },
    defaultVariants: {
      color: 'seokganju',
    },
  },
);

function Textarea({
  className,
  color = 'seokganju',
  ...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ color }), className)}
      {...props}
    />
  );
}

export { Textarea };
