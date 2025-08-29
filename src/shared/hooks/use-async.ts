import { useCallback, useEffect, useRef,useState } from "react"

export interface AsyncState<T, E = Error> {
  data: T | null
  error: E | null
  isLoading: boolean
  isIdle: boolean
  isSuccess: boolean
  isError: boolean
}

/**
 * Hook for managing async operations
 */
export function useAsync<T, E = Error>(
  asyncFunction?: () => Promise<T>,
  dependencies: React.DependencyList = []
): AsyncState<T, E> & {
  execute: () => Promise<void>
  reset: () => void
} {
  const [state, setState] = useState<AsyncState<T, E>>({
    data: null,
    error: null,
    isLoading: false,
    isIdle: true,
    isSuccess: false,
    isError: false,
  })

  const executeRef = useRef(asyncFunction)
  executeRef.current = asyncFunction

  const execute = useCallback(async () => {
    if (!executeRef.current) return

    setState({
      data: null,
      error: null,
      isLoading: true,
      isIdle: false,
      isSuccess: false,
      isError: false,
    })

    try {
      const data = await executeRef.current()
      setState({
        data,
        error: null,
        isLoading: false,
        isIdle: false,
        isSuccess: true,
        isError: false,
      })
    } catch (error) {
      setState({
        data: null,
        error: error as E,
        isLoading: false,
        isIdle: false,
        isSuccess: false,
        isError: true,
      })
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isIdle: true,
      isSuccess: false,
      isError: false,
    })
  }, [])

  useEffect(() => {
    if (asyncFunction) {
      execute()
    }
  }, dependencies)

  return { ...state, execute, reset }
}

/**
 * Hook for managing async operations with caching
 */
export function useAsyncWithCache<T, E = Error>(
  key: string,
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = [],
  cacheTimeMs: number = 5 * 60 * 1000 // 5 minutes
): AsyncState<T, E> & {
  execute: () => Promise<void>
  reset: () => void
  invalidateCache: () => void
} {
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map())
  
  const [state, setState] = useState<AsyncState<T, E>>({
    data: null,
    error: null,
    isLoading: false,
    isIdle: true,
    isSuccess: false,
    isError: false,
  })

  const executeRef = useRef(asyncFunction)
  executeRef.current = asyncFunction

  const execute = useCallback(async () => {
    // Check cache first
    const cached = cacheRef.current.get(key)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < cacheTimeMs) {
      setState({
        data: cached.data,
        error: null,
        isLoading: false,
        isIdle: false,
        isSuccess: true,
        isError: false,
      })
      return
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      isIdle: false,
      error: null,
    }))

    try {
      const data = await executeRef.current()
      
      // Cache the result
      cacheRef.current.set(key, { data, timestamp: now })
      
      setState({
        data,
        error: null,
        isLoading: false,
        isIdle: false,
        isSuccess: true,
        isError: false,
      })
    } catch (error) {
      setState({
        data: null,
        error: error as E,
        isLoading: false,
        isIdle: false,
        isSuccess: false,
        isError: true,
      })
    }
  }, [key, cacheTimeMs])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isIdle: true,
      isSuccess: false,
      isError: false,
    })
  }, [])

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(key)
  }, [key])

  useEffect(() => {
    execute()
  }, dependencies)

  return { ...state, execute, reset, invalidateCache }
}

/**
 * Hook for managing async form submission
 */
export function useAsyncForm<TData, TResult = any, TError = Error>(
  submitFunction: (data: TData) => Promise<TResult>
) {
  const [state, setState] = useState<AsyncState<TResult, TError> & {
    isSubmitting: boolean
  }>({
    data: null,
    error: null,
    isLoading: false,
    isIdle: true,
    isSuccess: false,
    isError: false,
    isSubmitting: false,
  })

  const submit = useCallback(async (data: TData) => {
    setState({
      data: null,
      error: null,
      isLoading: true,
      isIdle: false,
      isSuccess: false,
      isError: false,
      isSubmitting: true,
    })

    try {
      const result = await submitFunction(data)
      setState({
        data: result,
        error: null,
        isLoading: false,
        isIdle: false,
        isSuccess: true,
        isError: false,
        isSubmitting: false,
      })
      return result
    } catch (error) {
      setState({
        data: null,
        error: error as TError,
        isLoading: false,
        isIdle: false,
        isSuccess: false,
        isError: true,
        isSubmitting: false,
      })
      throw error
    }
  }, [submitFunction])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isIdle: true,
      isSuccess: false,
      isError: false,
      isSubmitting: false,
    })
  }, [])

  return { ...state, submit, reset }
}

/**
 * Hook for managing async operations with retry logic
 */
export function useAsyncWithRetry<T, E = Error>(
  asyncFunction: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000,
  dependencies: React.DependencyList = []
): AsyncState<T, E> & {
  execute: () => Promise<void>
  reset: () => void
  retryCount: number
} {
  const [retryCount, setRetryCount] = useState(0)
  const [state, setState] = useState<AsyncState<T, E>>({
    data: null,
    error: null,
    isLoading: false,
    isIdle: true,
    isSuccess: false,
    isError: false,
  })

  const executeRef = useRef(asyncFunction)
  executeRef.current = asyncFunction

  const execute = useCallback(async (currentRetry: number = 0) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      isIdle: false,
      error: null,
    }))

    try {
      const data = await executeRef.current()
      setState({
        data,
        error: null,
        isLoading: false,
        isIdle: false,
        isSuccess: true,
        isError: false,
      })
      setRetryCount(0)
    } catch (error) {
      if (currentRetry < maxRetries) {
        setRetryCount(currentRetry + 1)
        setTimeout(() => {
          execute(currentRetry + 1)
        }, retryDelay * Math.pow(2, currentRetry)) // Exponential backoff
      } else {
        setState({
          data: null,
          error: error as E,
          isLoading: false,
          isIdle: false,
          isSuccess: false,
          isError: true,
        })
      }
    }
  }, [maxRetries, retryDelay])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isIdle: true,
      isSuccess: false,
      isError: false,
    })
    setRetryCount(0)
  }, [])

  useEffect(() => {
    execute()
  }, dependencies)

  return { ...state, execute, reset, retryCount }
}

/**
 * Hook for managing multiple async operations
 */
export function useAsyncBatch<T extends Record<string, () => Promise<any>>>(
  asyncFunctions: T,
  dependencies: React.DependencyList = []
): {
  [K in keyof T]: AsyncState<Awaited<ReturnType<T[K]>>, Error>
} & {
  executeAll: () => Promise<void>
  reset: () => void
  isAnyLoading: boolean
  isAllSuccess: boolean
  isAnyError: boolean
} {
  const [states, setStates] = useState<Record<string, AsyncState<any, Error>>>(() =>
    Object.keys(asyncFunctions).reduce((acc, key) => {
      acc[key] = {
        data: null,
        error: null,
        isLoading: false,
        isIdle: true,
        isSuccess: false,
        isError: false,
      }
      return acc
    }, {} as Record<string, AsyncState<any, Error>>)
  )

  const executeAll = useCallback(async () => {
    // Set all to loading
    setStates(prev =>
      Object.keys(asyncFunctions).reduce((acc, key) => {
        acc[key] = {
          ...prev[key],
          isLoading: true,
          isIdle: false,
          error: null,
        }
        return acc
      }, {} as Record<string, AsyncState<any, Error>>)
    )

    // Execute all functions in parallel
    const promises = Object.entries(asyncFunctions).map(async ([key, fn]) => {
      try {
        const data = await fn()
        setStates(prev => ({
          ...prev,
          [key]: {
            data,
            error: null,
            isLoading: false,
            isIdle: false,
            isSuccess: true,
            isError: false,
          },
        }))
      } catch (error) {
        setStates(prev => ({
          ...prev,
          [key]: {
            data: null,
            error: error as Error,
            isLoading: false,
            isIdle: false,
            isSuccess: false,
            isError: true,
          },
        }))
      }
    })

    await Promise.allSettled(promises)
  }, [asyncFunctions])

  const reset = useCallback(() => {
    setStates(
      Object.keys(asyncFunctions).reduce((acc, key) => {
        acc[key] = {
          data: null,
          error: null,
          isLoading: false,
          isIdle: true,
          isSuccess: false,
          isError: false,
        }
        return acc
      }, {} as Record<string, AsyncState<any, Error>>)
    )
  }, [asyncFunctions])

  useEffect(() => {
    executeAll()
  }, dependencies)

  const isAnyLoading = Object.values(states).some(state => state.isLoading)
  const isAllSuccess = Object.values(states).every(state => state.isSuccess)
  const isAnyError = Object.values(states).some(state => state.isError)

  return {
    ...(states as any),
    executeAll,
    reset,
    isAnyLoading,
    isAllSuccess,
    isAnyError,
  }
}