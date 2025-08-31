import * as React from 'react'

import { cn } from '@/lib/utils'

import { Button } from '../atoms/button'
import { Input, type InputProps } from '../atoms/input'
import { Spinner } from '../atoms/spinner'

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon' | 'type'> {
  onSearch?: (query: string) => void
  onClear?: () => void
  loading?: boolean
  showClearButton?: boolean
  debounceMs?: number
  suggestions?: string[]
  onSuggestionSelect?: (suggestion: string) => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    className,
    onSearch,
    onClear,
    loading = false,
    showClearButton = true,
    debounceMs = 300,
    suggestions = [],
    onSuggestionSelect,
    value,
    defaultValue,
    onChange,
    onKeyDown,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '')
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [activeSuggestion, setActiveSuggestion] = React.useState(-1)
    const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const suggestionsRef = React.useRef<HTMLDivElement>(null)

    // Use provided value or internal state
    const currentValue = value !== undefined ? value : internalValue

    // Debounced search
    React.useEffect(() => {
      if (!onSearch || typeof currentValue !== 'string' || !currentValue.trim()) return

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      searchTimeoutRef.current = setTimeout(() => {
        onSearch(typeof currentValue === 'string' ? currentValue.trim() : String(currentValue))
      }, debounceMs)

      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current)
        }
      }
    }, [currentValue, onSearch, debounceMs])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (value === undefined) {
        setInternalValue(newValue)
      }
      setShowSuggestions(newValue.length > 0 && suggestions.length > 0)
      setActiveSuggestion(-1)
      onChange?.(e)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (suggestions.length > 0 && showSuggestions) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            setActiveSuggestion(prev =>
              prev < suggestions.length - 1 ? prev + 1 : prev
            )
            break
          case 'ArrowUp':
            e.preventDefault()
            setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1)
            break
          case 'Enter':
            e.preventDefault()
            if (activeSuggestion >= 0) {
              handleSuggestionSelect(suggestions[activeSuggestion])
            } else if (typeof currentValue === 'string' && currentValue.trim()) {
              onSearch?.(currentValue.trim())
              setShowSuggestions(false)
            }
            break
          case 'Escape':
            setShowSuggestions(false)
            setActiveSuggestion(-1)
            inputRef.current?.blur()
            break
        }
      }
      onKeyDown?.(e)
    }

    const handleSuggestionSelect = (suggestion: string) => {
      if (value === undefined) {
        setInternalValue(suggestion)
      }
      onSuggestionSelect?.(suggestion)
      setShowSuggestions(false)
      setActiveSuggestion(-1)
      inputRef.current?.focus()
    }

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue('')
      }
      setShowSuggestions(false)
      setActiveSuggestion(-1)
      onClear?.()
      inputRef.current?.focus()
    }

    const handleBlur = () => {
      // Delay hiding suggestions to allow for suggestion clicks
      setTimeout(() => {
        setShowSuggestions(false)
        setActiveSuggestion(-1)
      }, 200)
    }

    const handleFocus = () => {
      const valueLength = typeof currentValue === 'string' ? currentValue.length : String(currentValue).length
      if (valueLength > 0 && suggestions.length > 0) {
        setShowSuggestions(true)
      }
    }

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref || inputRef}
          type="search"
          value={currentValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={className}
          leftIcon={
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
          rightIcon={
            <div className="flex items-center gap-1">
              {loading && <Spinner size="xs" />}
              {showClearButton && currentValue && !loading && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleClear}
                  className="h-6 w-6 p-0 hover:bg-transparent"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              )}
            </div>
          }
        />

        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  index === activeSuggestion && 'bg-accent text-accent-foreground'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'

export { SearchInput }