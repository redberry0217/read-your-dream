import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid w-full gap-2', className)}
      {...props}
    />
  );
}

const radioGroupItemVariants = cva(
  'group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-stroke-strong bg-white outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
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

function RadioGroupItem({
  className,
  color = 'seokganju',
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> &
  VariantProps<typeof radioGroupItemVariants>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(radioGroupItemVariants({ color }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
