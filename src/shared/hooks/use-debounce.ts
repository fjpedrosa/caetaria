import { useEffect, useRef,useState } from "react"

/**
 * Hook that debounces a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook that debounces a callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [T, () => void] {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useRef(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T
  ).current

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [debouncedCallback, cancel]
}

/**
 * Hook that provides debounced search functionality
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  delay: number = 300,
  minQueryLength: number = 2
) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<T[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, delay)

  useEffect(() => {
    if (debouncedQuery.length < minQueryLength) {
      setResults([])
      setIsSearching(false)
      setError(null)
      return
    }

    setIsSearching(true)
    setError(null)

    searchFunction(debouncedQuery)
      .then((searchResults) => {
        setResults(searchResults)
        setIsSearching(false)
      })
      .catch((err) => {
        setError(err.message || "Search failed")
        setResults([])
        setIsSearching(false)
      })
  }, [debouncedQuery, minQueryLength, searchFunction])

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setError(null)
    setIsSearching(false)
  }

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearSearch,
  }
}

/**
 * Hook that provides debounced state with loading indicator
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number,
  onChange?: (value: T) => void
) {
  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (value !== debouncedValue) {
      setIsPending(true)
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value)
      setIsPending(false)
      onChange?.(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay, onChange, debouncedValue])

  return {
    value,
    setValue,
    debouncedValue,
    isPending,
  }
}

/**
 * Hook that debounces multiple values simultaneously
 */
export function useMultiDebounce<T extends Record<string, any>>(
  values: T,
  delay: number
): T {
  const [debouncedValues, setDebouncedValues] = useState<T>(values)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValues(values)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [values, delay])

  return debouncedValues
}

/**
 * Hook for debouncing form input changes
 */
export function useDebouncedFormInput(
  initialValue: string = "",
  delay: number = 300,
  onValidation?: (value: string) => string | null
) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    if (onValidation && debouncedValue !== initialValue) {
      setIsValidating(true)
      const validationError = onValidation(debouncedValue)
      setError(validationError)
      setIsValidating(false)
    }
  }, [debouncedValue, onValidation, initialValue])

  return {
    value,
    setValue,
    debouncedValue,
    error,
    isValidating,
    isValid: !error && !isValidating,
  }
}

/**
 * Hook for debouncing API calls
 */
export function useDebouncedApi<TData, TError = Error>(
  apiCall: () => Promise<TData>,
  dependencies: React.DependencyList,
  delay: number = 500
) {
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<TError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const debouncedDependencies = useDebounce(dependencies, delay)

  useEffect(() => {
    let isCancelled = false

    setIsLoading(true)
    setError(null)

    apiCall()
      .then((result) => {
        if (!isCancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err)
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, debouncedDependencies)

  return { data, error, isLoading }
}