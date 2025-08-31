import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { Button, type ButtonProps } from '../atoms/button'

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        outline: 'border-2',
        elevated: 'shadow-md',
        ghost: 'border-transparent shadow-none',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
)

export interface CardAction extends Omit<ButtonProps, 'children'> {
  label: string
  icon?: React.ReactNode
}

export interface CardWithActionsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  primaryAction?: CardAction
  secondaryAction?: CardAction
  actions?: CardAction[]
  footer?: React.ReactNode
  badge?: React.ReactNode
  actionsPosition?: 'footer' | 'header' | 'floating'
}

const CardWithActions = React.forwardRef<HTMLDivElement, CardWithActionsProps>(
  ({
    className,
    variant,
    padding,
    title,
    description,
    image,
    imageAlt,
    primaryAction,
    secondaryAction,
    actions = [],
    footer,
    badge,
    actionsPosition = 'footer',
    children,
    ...props
  }, ref) => {
    const allActions = React.useMemo(() => {
      const actionList = [...actions]
      if (secondaryAction) actionList.unshift(secondaryAction)
      if (primaryAction) actionList.unshift(primaryAction)
      return actionList
    }, [actions, primaryAction, secondaryAction])

    const renderActions = (position: string) => {
      if (actionsPosition !== position || allActions.length === 0) return null

      return (
        <div className={cn(
          'flex gap-2',
          position === 'header' && 'mb-4',
          position === 'footer' && 'mt-4',
          position === 'floating' && 'absolute top-4 right-4'
        )}>
          {allActions.map((action, index) => {
            const { label, icon, ...buttonProps } = action
            return (
              <Button
                key={index}
                size="sm"
                variant={index === 0 ? 'default' : 'outline'}
                leftIcon={icon}
                {...buttonProps}
              >
                {label}
              </Button>
            )
          })}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding }),
          actionsPosition === 'floating' && 'relative',
          className
        )}
        {...props}
      >
        {badge && (
          <div className="absolute -top-2 right-4 z-10">
            {badge}
          </div>
        )}

        {image && (
          <div className={cn(
            'rounded-t-lg overflow-hidden',
            padding !== 'none' && '-mx-6 -mt-6 mb-6'
          )}>
            <img
              src={image}
              alt={imageAlt || title || 'Card image'}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {renderActions('header')}
        {renderActions('floating')}

        <div className="space-y-2">
          {title && (
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}

          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}

        {renderActions('footer')}

        {footer && (
          <div className="mt-4 pt-4 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    )
  }
)
CardWithActions.displayName = 'CardWithActions'

export { cardVariants,CardWithActions }