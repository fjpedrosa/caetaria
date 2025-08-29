import * as React from "react"
import { cn } from "@/lib/utils"
import { Header, type HeaderProps } from "./header"
import { Footer, type FooterProps } from "./footer"

export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: HeaderProps | false
  footer?: FooterProps | false
  sidebar?: React.ReactNode
  sidebarPosition?: "left" | "right"
  sidebarWidth?: "sm" | "md" | "lg"
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: "none" | "sm" | "default" | "lg"
  variant?: "default" | "dashboard" | "landing" | "minimal"
}

const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ 
    className,
    header,
    footer,
    sidebar,
    sidebarPosition = "left",
    sidebarWidth = "md",
    maxWidth = "full",
    padding = "default",
    variant = "default",
    children,
    ...props
  }, ref) => {
    const containerClasses = cn(
      "min-h-screen flex flex-col",
      variant === "dashboard" && "bg-gray-50/50 dark:bg-gray-950/50",
      className
    )

    const mainClasses = cn(
      "flex-1",
      maxWidth === "sm" && "container mx-auto max-w-screen-sm px-4",
      maxWidth === "md" && "container mx-auto max-w-screen-md px-4",
      maxWidth === "lg" && "container mx-auto max-w-screen-lg px-4",
      maxWidth === "xl" && "container mx-auto max-w-screen-xl px-4",
      maxWidth === "2xl" && "container mx-auto max-w-screen-2xl px-4",
      maxWidth === "full" && "w-full",
      padding === "none" && "p-0",
      padding === "sm" && "p-4",
      padding === "default" && "px-4 py-6 sm:px-6 lg:px-8",
      padding === "lg" && "px-6 py-8 sm:px-8 lg:px-12"
    )

    const sidebarClasses = cn(
      "flex-shrink-0 bg-background border-r",
      sidebarWidth === "sm" && "w-64",
      sidebarWidth === "md" && "w-72",
      sidebarWidth === "lg" && "w-80"
    )

    // Minimal layout - just content
    if (variant === "minimal") {
      return (
        <div ref={ref} className={containerClasses} {...props}>
          <main className={mainClasses}>
            {children}
          </main>
        </div>
      )
    }

    // Landing page layout
    if (variant === "landing") {
      return (
        <div ref={ref} className={containerClasses} {...props}>
          {header !== false && (
            <Header 
              sticky 
              variant="transparent"
              {...(typeof header === "object" ? header : {})} 
            />
          )}
          
          <main className="flex-1">
            {children}
          </main>
          
          {footer !== false && (
            <Footer 
              variant="default"
              {...(typeof footer === "object" ? footer : {})} 
            />
          )}
        </div>
      )
    }

    // Dashboard layout with sidebar
    if (variant === "dashboard" && sidebar) {
      return (
        <div ref={ref} className={containerClasses} {...props}>
          {header !== false && (
            <Header 
              sticky 
              {...(typeof header === "object" ? header : {})} 
            />
          )}
          
          <div className="flex flex-1">
            {sidebarPosition === "left" && (
              <aside className={sidebarClasses}>
                {sidebar}
              </aside>
            )}
            
            <main className="flex-1 overflow-hidden">
              <div className={mainClasses}>
                {children}
              </div>
            </main>
            
            {sidebarPosition === "right" && (
              <aside className={sidebarClasses}>
                {sidebar}
              </aside>
            )}
          </div>
          
          {footer !== false && (
            <Footer 
              variant="minimal"
              {...(typeof footer === "object" ? footer : {})} 
            />
          )}
        </div>
      )
    }

    // Default layout
    return (
      <div ref={ref} className={containerClasses} {...props}>
        {header !== false && (
          <Header 
            {...(typeof header === "object" ? header : {})} 
          />
        )}
        
        <main className={mainClasses}>
          {children}
        </main>
        
        {footer !== false && (
          <Footer 
            {...(typeof footer === "object" ? footer : {})} 
          />
        )}
      </div>
    )
  }
)
Layout.displayName = "Layout"

export { Layout }