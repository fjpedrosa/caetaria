import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Badge variants using class-variance-authority
const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground border-border',
        // New informational variants - differentiate from buttons
        promotional:
          'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 backdrop-blur-sm',
        descriptive:
          'border-muted-foreground/20 bg-muted/40 text-muted-foreground hover:bg-muted/60 backdrop-blur-sm',
        feature:
          'border-border bg-background/60 text-foreground hover:bg-muted/40 backdrop-blur-sm shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// HMR Optimization: Add React.memo and forwardRef for component stability
const Badge = React.memo(React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    // HMR Optimization: Memoize className computation to prevent unnecessary recalculations
    const computedClassName = React.useMemo(
      () => cn(badgeVariants({ variant }), className),
      [variant, className]
    )

    return (
      <div ref={ref} className={computedClassName} {...props} />
    )
  }
))

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
