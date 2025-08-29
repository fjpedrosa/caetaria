import { useCallback, useEffect, useRef,useState } from "react"

type StorageValue<T> = T | null
type SetStorageValue<T> = T | ((prevValue: StorageValue<T>) => T)

/**
 * Hook for managing localStorage with React state synchronization
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [StorageValue<T>, (value: SetStorageValue<T>) => void, () => void] {
  // Get the value from localStorage or use the initial value
  const [storedValue, setStoredValue] = useState<StorageValue<T>>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Function to set value in both state and localStorage
  const setValue = useCallback(
    (value: SetStorageValue<T>) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        
        setStoredValue(valueToStore)
        
        // Save to localStorage
        if (typeof window !== "undefined") {
          if (valueToStore === null || valueToStore === undefined) {
            window.localStorage.removeItem(key)
          } else {
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
          }
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Function to remove the value
  const removeValue = useCallback(() => {
    try {
      setStoredValue(null)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key])

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== JSON.stringify(storedValue)) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : null)
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [key, storedValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook for managing localStorage with type safety and validation
 */
export function useTypedLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (value: unknown) => value is T
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      const parsed = JSON.parse(item)
      
      // Use validator if provided, otherwise trust the type
      if (validator && !validator(parsed)) {
        console.warn(`Invalid value in localStorage for key "${key}", using initial value`)
        return initialValue
      }
      
      return parsed
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prevValue: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        
        // Validate the value if validator is provided
        if (validator && !validator(valueToStore)) {
          console.error(`Invalid value provided for localStorage key "${key}"`)
          return
        }
        
        setStoredValue(valueToStore)
        
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue, validator]
  )

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook for managing localStorage with automatic serialization/deserialization
 */
export function useStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
): [T, (updates: Partial<T>) => void, (key: keyof T) => void, () => void] {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue)

  const updateValue = useCallback(
    (updates: Partial<T>) => {
      setValue((prev) => ({
        ...(prev || initialValue),
        ...updates,
      }))
    },
    [setValue, initialValue]
  )

  const removeKey = useCallback(
    (keyToRemove: keyof T) => {
      setValue((prev) => {
        if (!prev) return prev
        const { [keyToRemove]: removed, ...rest } = prev
        return rest as T
      })
    },
    [setValue]
  )

  return [value || initialValue, updateValue, removeKey, removeValue]
}

/**
 * Hook for managing localStorage arrays
 */
export function useStorageArray<T>(
  key: string,
  initialValue: T[] = []
): [
  T[],
  {
    add: (item: T) => void
    remove: (index: number) => void
    removeByValue: (item: T) => void
    update: (index: number, item: T) => void
    clear: () => void
    set: (items: T[]) => void
  }
] {
  const [items, setItems, removeStorage] = useLocalStorage(key, initialValue)

  const add = useCallback(
    (item: T) => {
      setItems((prev) => [...(prev || []), item])
    },
    [setItems]
  )

  const remove = useCallback(
    (index: number) => {
      setItems((prev) => {
        if (!prev) return prev
        const newItems = [...prev]
        newItems.splice(index, 1)
        return newItems
      })
    },
    [setItems]
  )

  const removeByValue = useCallback(
    (item: T) => {
      setItems((prev) => {
        if (!prev) return prev
        return prev.filter((existing) => existing !== item)
      })
    },
    [setItems]
  )

  const update = useCallback(
    (index: number, item: T) => {
      setItems((prev) => {
        if (!prev) return prev
        const newItems = [...prev]
        newItems[index] = item
        return newItems
      })
    },
    [setItems]
  )

  const clear = useCallback(() => {
    setItems([])
  }, [setItems])

  const set = useCallback(
    (newItems: T[]) => {
      setItems(newItems)
    },
    [setItems]
  )

  return [
    items || [],
    {
      add,
      remove,
      removeByValue,
      update,
      clear,
      set,
    },
  ]
}

/**
 * Hook for managing localStorage with expiration
 */
export function useExpiringStorage<T>(
  key: string,
  initialValue: T,
  expirationMs: number
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      const { value, expiry } = JSON.parse(item)
      
      if (Date.now() > expiry) {
        // Item has expired, remove it and return initial value
        window.localStorage.removeItem(key)
        return initialValue
      }
      
      return value
    } catch (error) {
      console.error(`Error reading expiring localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value)
        
        if (typeof window !== "undefined") {
          const expiry = Date.now() + expirationMs
          window.localStorage.setItem(key, JSON.stringify({ value, expiry }))
        }
      } catch (error) {
        console.error(`Error setting expiring localStorage key "${key}":`, error)
      }
    },
    [key, expirationMs]
  )

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing expiring localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook for managing localStorage state with automatic sync across components
 */
export function useSharedLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prevValue: T) => T)) => void] {
  const eventKey = `localStorage-${key}`
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading shared localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prevValue: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        
        setStoredValue(valueToStore)
        
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
          
          // Dispatch custom event to sync across components
          const event = new CustomEvent(eventKey, {
            detail: { key, value: valueToStore },
          })
          window.dispatchEvent(event)
        }
      } catch (error) {
        console.error(`Error setting shared localStorage key "${key}":`, error)
      }
    },
    [key, storedValue, eventKey]
  )

  // Listen for custom events to sync state across components
  useEffect(() => {
    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value)
      }
    }

    window.addEventListener(eventKey, handleCustomEvent as EventListener)
    return () => window.removeEventListener(eventKey, handleCustomEvent as EventListener)
  }, [key, eventKey])

  return [storedValue, setValue]
}

/**
 * Hook for managing user preferences in localStorage
 */
export function useUserPreferences<T extends Record<string, any>>(
  defaults: T
): [T, (key: keyof T, value: T[keyof T]) => void, (preferences: Partial<T>) => void, () => void] {
  const [preferences, setPreferences, clearPreferences] = useLocalStorage("userPreferences", defaults)

  const updatePreference = useCallback(
    (key: keyof T, value: T[keyof T]) => {
      setPreferences((prev) => ({
        ...(prev || defaults),
        [key]: value,
      }))
    },
    [setPreferences, defaults]
  )

  const updatePreferences = useCallback(
    (updates: Partial<T>) => {
      setPreferences((prev) => ({
        ...(prev || defaults),
        ...updates,
      }))
    },
    [setPreferences, defaults]
  )

  const resetPreferences = useCallback(() => {
    setPreferences(defaults)
  }, [setPreferences, defaults])

  return [preferences || defaults, updatePreference, updatePreferences, resetPreferences]
}