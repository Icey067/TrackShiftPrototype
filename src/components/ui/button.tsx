import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    const variantStyles = {
      default: 'bg-zinc-100 text-zinc-900 shadow hover:bg-zinc-100/90 font-semibold',
      destructive: 'bg-rose-600 text-zinc-100 shadow-sm hover:bg-rose-600/90',
      outline: 'border border-zinc-800 bg-transparent text-zinc-200 shadow-sm hover:bg-zinc-900 hover:text-zinc-100',
      secondary: 'bg-zinc-800 text-zinc-100 shadow-sm hover:bg-zinc-800/80',
      ghost: 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
      link: 'text-zinc-100 underline-offset-4 hover:underline',
    };

    const sizeStyles = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-9 w-9',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
