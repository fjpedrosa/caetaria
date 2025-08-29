import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin rounded-full border-2", {
  variants: {
    size: {
      xs: "h-3 w-3 border-[1px]",
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8 border-[3px]",
      xl: "h-12 w-12 border-[3px]",
    },
    variant: {
      default: "border-gray-300 border-t-gray-900",
      primary: "border-primary/20 border-t-primary",
      secondary: "border-secondary/20 border-t-secondary",
      success: "border-green-200 border-t-green-600",
      warning: "border-yellow-200 border-t-yellow-600",
      destructive: "border-red-200 border-t-red-600",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
})

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label || "Loading"}
        className={cn(spinnerVariants({ size, variant }), className)}
        {...props}
      >
        <span className="sr-only">{label || "Loading..."}</span>
      </div>
    )
  }
)
Spinner.displayName = "Spinner"

export { Spinner, spinnerVariants }