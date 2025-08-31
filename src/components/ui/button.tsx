'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AnimatePresence,motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 active:bg-primary/80 hover:shadow-lg hover:scale-105 active:scale-95 focus:bg-primary/90',
        gradient:
          'bg-gradient-to-r from-brand-yellow-300 to-brand-blue-400 text-white shadow-lg hover:shadow-xl active:shadow-md hover:scale-105 active:scale-95 focus:shadow-xl hover:animate-glow',
        destructive:
          'bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 active:bg-destructive/80 hover:shadow-lg hover:scale-105 active:scale-95 focus:bg-destructive/90',
        outline:
          'border-2 border-input bg-background shadow-sm hover:bg-accent active:bg-accent/80 hover:text-accent-foreground hover:border-primary hover:scale-105 active:scale-95 focus:bg-accent',
        secondary:
          'bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 active:bg-secondary/70 hover:shadow-lg hover:scale-105 active:scale-95 focus:bg-secondary/80',
        ghost: 'hover:bg-accent active:bg-accent/80 hover:text-accent-foreground hover:scale-105 active:scale-95 focus:bg-accent',
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/80 hover:scale-105 active:scale-95 focus:underline',
      },
      size: {
        default: 'h-11 min-h-[44px] px-6 py-2',
        sm: 'h-11 min-h-[44px] px-4 text-xs',
        lg: 'h-12 min-h-[48px] px-8 text-base font-semibold',
        xl: 'h-14 min-h-[56px] px-10 text-lg font-bold',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  ripple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, ripple = true, children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
    const Comp = asChild ? Slot : 'button'

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || props.disabled) return;

        if (ripple && !asChild) {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const id = Date.now();

          setRipples(prev => [...prev, { id, x, y }]);

          setTimeout(() => {
            setRipples(prev => prev.filter(ripple => ripple.id !== id));
          }, 600);
        }

        onClick?.(event);
      },
      [loading, props.disabled, ripple, asChild, onClick]
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={loading || props.disabled}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <span className="relative w-full h-full flex items-center justify-center">
            {/* Ripple Effects */}
            {ripple && (
              <AnimatePresence>
                {ripples.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="absolute rounded-full bg-white/30"
                    style={{
                      left: ripple.x - 20,
                      top: ripple.y - 20,
                      width: 40,
                      height: 40,
                    }}
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                ))}
              </AnimatePresence>
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {children}
            </span>
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
