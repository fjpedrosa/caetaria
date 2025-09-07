'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  User} from 'lucide-react'
import * as Avatar from '@radix-ui/react-avatar'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { cn } from '@/lib/utils'

export interface UserMenuProps {
  user: {
    name?: string
    email: string
    avatar?: string
  }
  onSignOut: () => void
  onNavigate: (path: string) => void
  className?: string
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onSignOut,
  onNavigate,
  className
}) => {
  const userInitials = React.useMemo(() => {
    if (user.name) {
      return user.name
        .split(' ')
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
    }
    return user.email.charAt(0).toUpperCase()
  }, [user.name, user.email])

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    }
  ]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'relative inline-flex items-center gap-3 rounded-full p-2 pr-3',
            'bg-background border border-border/50 shadow-sm',
            'hover:bg-accent hover:border-border',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'transition-all duration-200 ease-in-out',
            'touch-manipulation select-none',
            className
          )}
          aria-label={`User menu for ${user.name || user.email}`}
        >
          {/* Avatar */}
          <Avatar.Root className="relative h-8 w-8 shrink-0">
            <Avatar.Image
              src={user.avatar}
              alt={user.name || user.email}
              className="h-8 w-8 rounded-full object-cover"
            />
            <Avatar.Fallback className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {userInitials}
            </Avatar.Fallback>
          </Avatar.Root>

          {/* User Info (Hidden on mobile) */}
          <div className="hidden sm:block text-left min-w-0 flex-1">
            {user.name && (
              <div className="text-sm font-medium text-foreground truncate">
                {user.name}
              </div>
            )}
            <div className="text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          </div>

          {/* Chevron Icon */}
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 min-w-[240px] overflow-hidden rounded-lg border border-border',
            'bg-popover text-popover-foreground shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          align="end"
          sideOffset={8}
        >
          {/* User Info Header */}
          <motion.div
            className="px-4 py-3 border-b border-border/50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <Avatar.Root className="h-10 w-10">
                <Avatar.Image
                  src={user.avatar}
                  alt={user.name || user.email}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <Avatar.Fallback className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {userInitials}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="min-w-0 flex-1">
                {user.name && (
                  <div className="font-medium text-sm text-foreground truncate">
                    {user.name}
                  </div>
                )}
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon
              return (
                <DropdownMenu.Item
                  key={item.id}
                  className={cn(
                    'relative flex items-center gap-3 px-4 py-2.5 text-sm',
                    'text-popover-foreground cursor-pointer select-none outline-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    'transition-colors duration-200'
                  )}
                  onSelect={() => onNavigate(item.path)}
                  asChild
                >
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left">{item.label}</span>
                  </motion.button>
                </DropdownMenu.Item>
              )
            })}
          </div>

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          {/* Sign Out */}
          <div className="py-1">
            <DropdownMenu.Item
              className={cn(
                'relative flex items-center gap-3 px-4 py-2.5 text-sm',
                'text-destructive cursor-pointer select-none outline-none',
                'hover:bg-destructive/10 hover:text-destructive',
                'focus:bg-destructive/10 focus:text-destructive',
                'transition-colors duration-200'
              )}
              onSelect={onSignOut}
              asChild
            >
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="h-4 w-4" />
                <span className="flex-1 text-left">Sign out</span>
              </motion.button>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export { UserMenu }