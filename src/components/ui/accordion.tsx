'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'

import { cn } from '@/lib/utils'

// HMR Optimization: Stabilize client boundary by memoizing the root component
const Accordion = React.memo(AccordionPrimitive.Root)
Accordion.displayName = 'Accordion'

// HMR Optimization: Memoize AccordionItem with optimized forwardRef pattern
const AccordionItem = React.memo(React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  // HMR Optimization: Memoize className computation
  const computedClassName = React.useMemo(
    () => cn('border-b', className),
    [className]
  )

  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={computedClassName}
      {...props}
    />
  )
}))
AccordionItem.displayName = 'AccordionItem'

// HMR Optimization: Memoize AccordionTrigger with stable className computation
const AccordionTrigger = React.memo(React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  // HMR Optimization: Memoize className computation to prevent unnecessary re-calculations
  const computedClassName = React.useMemo(
    () => cn(
      'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180',
      className
    ),
    [className]
  )

  // HMR Optimization: Memoize ChevronDown component to prevent re-creation
  const chevronIcon = React.useMemo(
    () => <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />,
    []
  )

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={computedClassName}
        {...props}
      >
        {children}
        {chevronIcon}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

// HMR Optimization: Memoize AccordionContent with stable className and content wrapper
const AccordionContent = React.memo(React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // HMR Optimization: Memoize content wrapper className computation
  const contentWrapperClassName = React.useMemo(
    () => cn('pb-4 pt-0', className),
    [className]
  )

  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={contentWrapperClassName}>{children}</div>
    </AccordionPrimitive.Content>
  )
}))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
