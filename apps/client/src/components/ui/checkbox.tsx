import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-stroke-strong bg-white transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      color: {
        seokganju:
          'hover:border-seokganju-500 focus-visible:border-seokganju-500 focus-visible:ring-seokganju-100/35 data-checked:border-seokganju-500 data-checked:bg-seokganju-500',
        guncheong:
          'hover:border-guncheong-500 focus-visible:border-guncheong-500 focus-visible:ring-guncheong-100/35 data-checked:border-guncheong-500 data-checked:bg-guncheong-500',
        yangrok:
          'hover:border-yangrok-500 focus-visible:border-yangrok-500 focus-visible:ring-yangrok-100/35 data-checked:border-yangrok-500 data-checked:bg-yangrok-500',
        podo: 'hover:border-podo-500 focus-visible:border-podo-500 focus-visible:ring-podo-100/35 data-checked:border-podo-500 data-checked:bg-podo-500',
      },
    },
    defaultVariants: {
      color: 'seokganju',
    },
  },
);

function Checkbox({
  className,
  color = 'seokganju',
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ color }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-white transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
