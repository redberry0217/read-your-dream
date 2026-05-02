import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'cursor-pointer inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap select-none transition-colors disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        filled: '',
        outline: 'border bg-transparent',
      },
      color: {
        seokganju: '',
        guncheong: '',
        yangrok: '',
        podo: '',
      },
      size: {
        sm: 'h-7 px-3 text-xs',
        default: 'h-9 px-4',
        lg: 'h-11 px-6',
        icon: 'size-9',
      },
    },
    compoundVariants: [
      {
        variant: 'filled',
        color: 'seokganju',
        className: 'bg-seokganju-500 text-white hover:bg-seokganju-700 disabled:bg-seokganju-300',
      },
      {
        variant: 'filled',
        color: 'guncheong',
        className: 'bg-guncheong-500 text-white hover:bg-guncheong-700 disabled:bg-guncheong-300',
      },
      {
        variant: 'filled',
        color: 'yangrok',
        className: 'bg-yangrok-500 text-white hover:bg-yangrok-700 disabled:bg-yangrok-300',
      },
      {
        variant: 'filled',
        color: 'podo',
        className: 'bg-podo-500 text-white hover:bg-podo-700 disabled:bg-podo-300',
      },
      {
        variant: 'outline',
        color: 'seokganju',
        className:
          'border-seokganju-500 text-seokganju-500 hover:border-seokganju-700 hover:text-seokganju-700 disabled:border-seokganju-300 disabled:text-seokganju-300',
      },
      {
        variant: 'outline',
        color: 'guncheong',
        className:
          'border-guncheong-500 text-guncheong-500 hover:border-guncheong-700 hover:text-guncheong-700 disabled:border-guncheong-300 disabled:text-guncheong-300',
      },
      {
        variant: 'outline',
        color: 'yangrok',
        className:
          'border-yangrok-500 text-yangrok-500 hover:border-yangrok-700 hover:text-yangrok-700 disabled:border-yangrok-300 disabled:text-yangrok-300',
      },
      {
        variant: 'outline',
        color: 'podo',
        className:
          'border-podo-500 text-podo-500 hover:border-podo-700 hover:text-podo-700 disabled:border-podo-300 disabled:text-podo-300',
      },
    ],
    defaultVariants: {
      variant: 'filled',
      size: 'default',
      color: 'seokganju',
    },
  },
);

function Button({
  className,
  variant = 'filled',
  size = 'default',
  color = 'seokganju',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, color, className }))}
      {...props}
    />
  );
}

export { Button };
