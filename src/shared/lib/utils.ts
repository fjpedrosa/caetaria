import { type ClassValue,clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with proper localization
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions & {
    locale?: string
  }
) {
  const { locale = "en-US", ...formatOptions } = options || {}
  return new Intl.NumberFormat(locale, formatOptions).format(value)
}

/**
 * Format currency with proper localization
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value)
}

/**
 * Format date with proper localization
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions & {
    locale?: string
  }
) {
  const { locale = "en-US", ...formatOptions } = options || {}
  const dateObj = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = "en-US"
) {
  const now = new Date()
  const past = date instanceof Date ? date : new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, "second")
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, "minute")
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, "hour")
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return rtf.format(-diffInDays, "day")
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return rtf.format(-diffInWeeks, "week")
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, "month")
  }
  
  const diffInYears = Math.floor(diffInDays / 365)
  return rtf.format(-diffInYears, "year")
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + "..."
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string) {
  return name
    .split(" ")
    .map(part => part.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase()
}

/**
 * Generate a random ID
 */
export function generateId(prefix?: string) {
  const id = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}-${id}` : id
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func.apply(null, args)
    }, delay)
  }
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(null, args)
    }
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand("copy")
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error("Failed to copy text:", error)
    return false
  }
}

/**
 * Check if a value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "object") return Object.keys(value).length === 0
  return false
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === "object") {
    const copy = {} as T
    Object.keys(obj).forEach(key => {
      (copy as any)[key] = deepClone((obj as any)[key])
    })
    return copy
  }
  return obj
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert string to title case
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => capitalize(word))
    .join(" ")
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get contrast color (black or white) for a given background color
 */
export function getContrastColor(hexColor: string): "black" | "white" {
  // Remove # if present
  const color = hexColor.replace("#", "")
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? "black" : "white"
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Create a URL-friendly slug from a string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}