import { useState, useCallback } from "react"

export interface ClipboardState {
  value: string | null
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

/**
 * Hook for clipboard operations
 */
export function useClipboard(timeout: number = 2000): ClipboardState & {
  copy: (text: string) => Promise<void>
  reset: () => void
} {
  const [state, setState] = useState<ClipboardState>({
    value: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  })

  const copy = useCallback(async (text: string) => {
    setState({
      value: null,
      error: null,
      isLoading: true,
      isSuccess: false,
      isError: false,
    })

    try {
      await navigator.clipboard.writeText(text)
      
      setState({
        value: text,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
      })

      // Reset success state after timeout
      if (timeout > 0) {
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            isSuccess: false,
          }))
        }, timeout)
      }
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand("copy")
        textArea.remove()
        
        if (successful) {
          setState({
            value: text,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          })

          if (timeout > 0) {
            setTimeout(() => {
              setState(prev => ({
                ...prev,
                isSuccess: false,
              }))
            }, timeout)
          }
        } else {
          throw new Error("Copy command failed")
        }
      } catch (fallbackError) {
        setState({
          value: null,
          error: fallbackError as Error,
          isLoading: false,
          isSuccess: false,
          isError: true,
        })
      }
    }
  }, [timeout])

  const reset = useCallback(() => {
    setState({
      value: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    })
  }, [])

  return { ...state, copy, reset }
}