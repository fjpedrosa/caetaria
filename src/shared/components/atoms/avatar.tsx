import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        default: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
        "2xl": "h-20 w-20",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const avatarImageVariants = cva("aspect-square h-full w-full object-cover")

const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center bg-muted font-medium text-muted-foreground",
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  online?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, online, ...props }, ref) => {
    const [imageFailed, setImageFailed] = React.useState(false)
    
    const handleImageError = () => {
      setImageFailed(true)
    }

    // Generate initials from fallback text
    const initials = React.useMemo(() => {
      if (!fallback) return "?"
      return fallback
        .split(" ")
        .map(name => name.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase()
    }, [fallback])

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, className }))}
        {...props}
      >
        {src && !imageFailed ? (
          <img
            src={src}
            alt={alt || fallback || "Avatar"}
            onError={handleImageError}
            className={cn(avatarImageVariants())}
          />
        ) : (
          <div className={cn(avatarFallbackVariants({ size }))}>
            {initials}
          </div>
        )}
        
        {online !== undefined && (
          <span
            className={cn(
              "absolute bottom-0 right-0 block rounded-full border-2 border-background",
              online ? "bg-green-500" : "bg-gray-400",
              size === "xs" && "h-2 w-2",
              size === "sm" && "h-2.5 w-2.5",
              size === "default" && "h-3 w-3",
              size === "lg" && "h-3.5 w-3.5",
              size === "xl" && "h-4 w-4",
              size === "2xl" && "h-5 w-5"
            )}
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar, avatarVariants }