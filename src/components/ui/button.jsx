// Adapted from shadcn/ui's New York Button for this JavaScript/Preact project.
import { forwardRef } from 'preact/compat';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

export const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-[#105039] hover:shadow-md aria-pressed:bg-[#0d4733]',
        outline: 'border border-input bg-background shadow-sm hover:border-brand/50 hover:bg-accent hover:text-accent-foreground aria-pressed:border-brand aria-pressed:bg-soft aria-pressed:text-brand aria-pressed:shadow-[inset_0_-2px_0_var(--color-brand)]',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground aria-pressed:bg-soft aria-pressed:text-brand',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground aria-pressed:bg-soft aria-pressed:text-brand',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-3 py-2',
        sm: 'px-3 py-2 text-xs',
        lg: 'min-h-12 px-4 py-3',
        icon: 'size-11 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Component = asChild ? Slot : 'button';
  return <Component ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}/>;
});
Button.displayName = 'Button';
