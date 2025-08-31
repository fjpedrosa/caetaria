import * as React from 'react'

import { cn } from '@/lib/utils'

export interface FooterLink {
  label: string
  href?: string
  onClick?: () => void
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode
  description?: string
  sections?: FooterSection[]
  socialLinks?: Array<{
    platform: string
    href: string
    icon: React.ReactNode
  }>
  bottomText?: string
  variant?: 'default' | 'minimal' | 'centered'
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({
    className,
    logo,
    description,
    sections = [],
    socialLinks = [],
    bottomText,
    variant = 'default',
    children,
    ...props
  }, ref) => {
    const handleLinkClick = (link: FooterLink) => {
      if (link.onClick) {
        link.onClick()
      } else if (link.href) {
        window.open(link.href, '_blank', 'noopener noreferrer')
      }
    }

    if (variant === 'minimal') {
      return (
        <footer
          ref={ref}
          className={cn(
            'border-t bg-background py-8',
            className
          )}
          {...props}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-4">
                {logo}
                {bottomText && (
                  <p className="text-sm text-muted-foreground">
                    {bottomText}
                  </p>
                )}
              </div>

              {socialLinks.length > 0 && (
                <div className="flex items-center gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={social.platform}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {children}
          </div>
        </footer>
      )
    }

    if (variant === 'centered') {
      return (
        <footer
          ref={ref}
          className={cn(
            'border-t bg-background py-12',
            className
          )}
          {...props}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {logo && (
                <div className="mb-6 flex justify-center">
                  {logo}
                </div>
              )}

              {description && (
                <p className="mb-8 text-muted-foreground max-w-md mx-auto">
                  {description}
                </p>
              )}

              {sections.length > 0 && (
                <div className="mb-8 flex flex-wrap justify-center gap-6">
                  {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="text-center">
                      <h3 className="mb-3 text-sm font-semibold text-foreground">
                        {section.title}
                      </h3>
                      <ul className="space-y-2">
                        {section.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            <button
                              onClick={() => handleLinkClick(link)}
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {link.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {socialLinks.length > 0 && (
                <div className="mb-6 flex justify-center gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={social.platform}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              )}

              {bottomText && (
                <p className="text-sm text-muted-foreground">
                  {bottomText}
                </p>
              )}
            </div>
            {children}
          </div>
        </footer>
      )
    }

    // Default variant
    return (
      <footer
        ref={ref}
        className={cn(
          'border-t bg-background py-12 lg:py-16',
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-12">
            {/* Logo and Description */}
            <div className="lg:col-span-2">
              {logo && (
                <div className="mb-4">
                  {logo}
                </div>
              )}

              {description && (
                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                  {description}
                </p>
              )}

              {socialLinks.length > 0 && (
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={social.platform}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Sections */}
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <button
                        onClick={() => handleLinkClick(link)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors block text-left"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {children && (
            <div className="mt-12 pt-8 border-t">
              {children}
            </div>
          )}

          {bottomText && (
            <div className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground text-center">
                {bottomText}
              </p>
            </div>
          )}
        </div>
      </footer>
    )
  }
)
Footer.displayName = 'Footer'

export { Footer }