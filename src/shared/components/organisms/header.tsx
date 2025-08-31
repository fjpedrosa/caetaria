import * as React from 'react'

import { cn } from '@/lib/utils'

import { Avatar } from '../atoms/avatar'
import { Badge } from '../atoms/badge'
import { Button } from '../atoms/button'

export interface HeaderAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'ghost'
  icon?: React.ReactNode
}

export interface HeaderUser {
  name: string
  email?: string
  avatar?: string
  online?: boolean
}

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode
  title?: string
  navigation?: Array<{
    label: string
    href?: string
    onClick?: () => void
    active?: boolean
    badge?: React.ReactNode
  }>
  actions?: HeaderAction[]
  user?: HeaderUser
  onUserMenuClick?: () => void
  sticky?: boolean
  variant?: 'default' | 'transparent' | 'bordered'
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({
    className,
    logo,
    title,
    navigation = [],
    actions = [],
    user,
    onUserMenuClick,
    sticky = false,
    variant = 'default',
    children,
    ...props
  }, ref) => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

    const handleNavigationClick = (item: HeaderProps['navigation'][0]) => {
      if (item.onClick) {
        item.onClick()
      } else if (item.href) {
        window.location.href = item.href
      }
    }

    return (
      <header
        ref={ref}
        className={cn(
          'w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          sticky && 'sticky top-0 z-50',
          variant === 'transparent' && 'bg-transparent border-transparent',
          variant === 'bordered' && 'border-b-2',
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              {logo && (
                <div className="flex-shrink-0">
                  {logo}
                </div>
              )}

              {title && (
                <h1 className="text-xl font-semibold text-foreground">
                  {title}
                </h1>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:items-center md:space-x-8">
              {navigation.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigationClick(item)}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-foreground',
                    item.active
                      ? 'text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {item.label}
                    {item.badge && item.badge}
                  </span>
                </button>
              ))}
            </nav>

            {/* Actions and User */}
            <div className="flex items-center gap-4">
              {/* Action Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={action.onClick}
                    leftIcon={action.icon}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>

              {/* User Menu */}
              {user && (
                <button
                  onClick={onUserMenuClick}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors"
                >
                  <Avatar
                    src={user.avatar}
                    fallback={user.name}
                    size="sm"
                    online={user.online}
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium">{user.name}</div>
                    {user.email && (
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    )}
                  </div>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-2">
                {navigation.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleNavigationClick(item)
                      setMobileMenuOpen(false)
                    }}
                    className={cn(
                      'text-left px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      item.active
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <span className="flex items-center justify-between">
                      {item.label}
                      {item.badge && item.badge}
                    </span>
                  </button>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="mt-4 flex flex-col gap-2 px-4">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => {
                      action.onClick()
                      setMobileMenuOpen(false)
                    }}
                    leftIcon={action.icon}
                    className="w-full"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {children && (
          <div className="border-t">
            {children}
          </div>
        )}
      </header>
    )
  }
)
Header.displayName = 'Header'

export { Header }