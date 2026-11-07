// Adapted from shadcn/ui's New York Badge.
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      outline: 'border-border text-foreground',
    },
  },
  defaultVariants: { variant: 'secondary' },
});
export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props}/>;
}
