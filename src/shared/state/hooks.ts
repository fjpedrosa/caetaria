/**
 * Typed Redux Hooks
 * 
 * These hooks provide type-safe access to Redux store.
 * Always use these instead of plain useSelector/useDispatch.
 * 
 * Benefits:
 * - Full TypeScript support
 * - Autocomplete for state and actions
 * - Type errors at compile time
 * - No need to type assertions
 */

import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector, useStore } from 'react-redux'

import type { AppDispatch, AppStore,RootState } from './store'

/**
 * Typed version of useDispatch
 * 
 * Use this instead of plain useDispatch() for type safety.
 * 
 * @example
 * ```tsx
 * import { useAppDispatch } from '@/shared/state/hooks'
 * import { setTheme } from '@/shared/state/slices/ui-slice'
 * 
 * function ThemeToggle() {
 *   const dispatch = useAppDispatch()
 *   
 *   const handleToggle = () => {
 *     dispatch(setTheme('dark')) // Type-safe!
 *   }
 *   
 *   return <button onClick={handleToggle}>Toggle Theme</button>
 * }
 * ```
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()

/**
 * Typed version of useSelector
 * 
 * Use this instead of plain useSelector() for type safety.
 * 
 * @example
 * ```tsx
 * import { useAppSelector } from '@/shared/state/hooks'
 * 
 * function UserProfile() {
 *   const theme = useAppSelector(state => state.ui.theme) // Type-safe!
 *   const user = useAppSelector(state => state.auth?.user) // Autocomplete works!
 *   
 *   return <div className={theme}>...</div>
 * }
 * ```
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

/**
 * Typed version of useStore
 * 
 * Use this when you need direct access to the store (rare).
 * 
 * @example
 * ```tsx
 * import { useAppStore } from '@/shared/state/hooks'
 * 
 * function StoreInspector() {
 *   const store = useAppStore()
 *   
 *   useEffect(() => {
 *     // Subscribe to store changes
 *     const unsubscribe = store.subscribe(() => {
 *       console.log('State changed:', store.getState())
 *     })
 *     
 *     return unsubscribe
 *   }, [store])
 *   
 *   return null
 * }
 * ```
 */
export const useAppStore = () => useStore<AppStore>()

/**
 * Custom hook for selecting multiple values efficiently
 * 
 * Prevents unnecessary re-renders by using shallow equality check.
 * 
 * @example
 * ```tsx
 * import { useAppSelectorMultiple } from '@/shared/state/hooks'
 * 
 * function Dashboard() {
 *   const { theme, sidebar, toasts } = useAppSelectorMultiple(state => ({
 *     theme: state.ui.theme,
 *     sidebar: state.ui.sidebar,
 *     toasts: state.ui.toasts,
 *   }))
 *   
 *   return (...)
 * }
 * ```
 */
export function useAppSelectorMultiple<T>(
  selector: (state: RootState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  return useAppSelector(selector, equalityFn)
}

/**
 * Hook for dispatching multiple actions
 * 
 * Useful for complex operations that require multiple dispatches.
 * 
 * @example
 * ```tsx
 * import { useAppDispatchMultiple } from '@/shared/state/hooks'
 * import { setTheme, toggleSidebar, addToast } from '@/shared/state/slices/ui-slice'
 * 
 * function ComplexAction() {
 *   const dispatchMultiple = useAppDispatchMultiple()
 *   
 *   const handleComplexAction = () => {
 *     dispatchMultiple([
 *       setTheme('dark'),
 *       toggleSidebar(),
 *       addToast({ type: 'success', title: 'All done!' })
 *     ])
 *   }
 *   
 *   return <button onClick={handleComplexAction}>Do Multiple Things</button>
 * }
 * ```
 */
export function useAppDispatchMultiple() {
  const dispatch = useAppDispatch()
  
  return (actions: any[]) => {
    actions.forEach(action => dispatch(action))
  }
}

/**
 * Hook for conditional dispatching
 * 
 * Only dispatches if a condition is met.
 * 
 * @example
 * ```tsx
 * import { useConditionalDispatch } from '@/shared/state/hooks'
 * import { addToast } from '@/shared/state/slices/ui-slice'
 * 
 * function ConditionalToast() {
 *   const conditionalDispatch = useConditionalDispatch()
 *   
 *   const showToastIfNeeded = (success: boolean) => {
 *     conditionalDispatch(
 *       success,
 *       addToast({ type: 'success', title: 'Operation successful!' })
 *     )
 *   }
 *   
 *   return (...)
 * }
 * ```
 */
export function useConditionalDispatch() {
  const dispatch = useAppDispatch()
  
  return (condition: boolean, action: any) => {
    if (condition) {
      dispatch(action)
    }
  }
}

/**
 * BEST PRACTICES:
 * 
 * 1. Always use typed hooks:
 *    ✅ useAppDispatch() instead of useDispatch()
 *    ✅ useAppSelector() instead of useSelector()
 * 
 * 2. Create selector functions for complex state:
 *    ```typescript
 *    // In your slice file
 *    export const selectUserWithPosts = createSelector(
 *      [selectUser, selectPosts],
 *      (user, posts) => ({ ...user, posts })
 *    )
 *    
 *    // In your component
 *    const userWithPosts = useAppSelector(selectUserWithPosts)
 *    ```
 * 
 * 3. Avoid selecting entire state:
 *    ❌ const state = useAppSelector(state => state)
 *    ✅ const theme = useAppSelector(state => state.ui.theme)
 * 
 * 4. Use RTK Query hooks for server state:
 *    ❌ const users = useAppSelector(state => state.users)
 *    ✅ const { data: users } = useGetUsersQuery()
 * 
 * 5. Memoize selectors that create new objects:
 *    ```typescript
 *    const selectFilteredItems = useMemo(
 *      () => createSelector(
 *        [selectItems, selectFilter],
 *        (items, filter) => items.filter(item => item.type === filter)
 *      ),
 *      []
 *    )
 *    ```
 */