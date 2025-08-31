/**
 * UI Slice - Global UI State Management
 *
 * This slice manages global UI state that needs to be:
 * - Shared across multiple components
 * - Persisted across sessions (optional)
 * - Complex enough to warrant Redux over useState
 *
 * DON'T put here:
 * - Server state (use RTK Query)
 * - Form state (use react-hook-form)
 * - Local component state (use useState)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '../store'

/**
 * UI State Interface
 *
 * Includes common UI patterns that need global state:
 * - Sidebar open/closed
 * - Active modals
 * - Toast notifications
 * - Theme preference
 * - Layout preferences
 */
interface UIState {
  // Sidebar state
  sidebar: {
    isOpen: boolean
    isPinned: boolean
    width: number
  }

  // Modal management
  modals: {
    [key: string]: {
      isOpen: boolean
      data?: any
    }
  }

  // Toast notifications
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    description?: string
    duration?: number
    createdAt: number
  }>

  // Theme
  theme: 'light' | 'dark' | 'system'

  // Layout preferences
  layout: {
    density: 'compact' | 'normal' | 'comfortable'
    showAnimations: boolean
    reducedMotion: boolean
  }

  // Global loading states
  globalLoading: {
    isLoading: boolean
    message?: string
  }

  // Feature flags (client-side)
  features: {
    [key: string]: boolean
  }
}

/**
 * Initial state with sensible defaults
 *
 * These can be overridden by hydration from localStorage
 */
const initialState: UIState = {
  sidebar: {
    isOpen: true,
    isPinned: false,
    width: 280,
  },
  modals: {},
  toasts: [],
  theme: 'system',
  layout: {
    density: 'normal',
    showAnimations: true,
    reducedMotion: false,
  },
  globalLoading: {
    isLoading: false,
    message: undefined,
  },
  features: {},
}

/**
 * UI Slice Definition
 *
 * Contains all reducers for UI state management
 */
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Hydration from localStorage
    hydrate: (state, action: PayloadAction<Partial<UIState>>) => {
      // Only hydrate specific fields that should persist
      const persistedFields: (keyof UIState)[] = ['theme', 'sidebar', 'layout']

      persistedFields.forEach(field => {
        if (action.payload[field]) {
          (state as any)[field] = action.payload[field]
        }
      })
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload
    },
    setSidebarPinned: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isPinned = action.payload
    },
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebar.width = Math.max(200, Math.min(400, action.payload))
    },

    // Modal actions
    openModal: (state, action: PayloadAction<{ key: string; data?: any }>) => {
      state.modals[action.payload.key] = {
        isOpen: true,
        data: action.payload.data,
      }
    },
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key].isOpen = false
      })
    },

    // Toast actions
    addToast: (state, action: PayloadAction<Omit<UIState['toasts'][0], 'id' | 'createdAt'>>) => {
      const toast = {
        ...action.payload,
        id: `toast-${Date.now()}-${Math.random()}`,
        createdAt: Date.now(),
        duration: action.payload.duration || 5000,
      }
      state.toasts.push(toast)

      // Limit to 5 toasts maximum
      if (state.toasts.length > 5) {
        state.toasts.shift()
      }
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload)
    },
    clearToasts: (state) => {
      state.toasts = []
    },

    // Theme actions
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload

      // Apply theme to document (side effect - consider middleware)
      if (typeof window !== 'undefined') {
        const root = document.documentElement
        root.classList.remove('light', 'dark')

        if (action.payload === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          root.classList.add(prefersDark ? 'dark' : 'light')
        } else {
          root.classList.add(action.payload)
        }
      }
    },

    // Layout actions
    setLayoutDensity: (state, action: PayloadAction<UIState['layout']['density']>) => {
      state.layout.density = action.payload
    },
    toggleAnimations: (state) => {
      state.layout.showAnimations = !state.layout.showAnimations
      state.layout.reducedMotion = !state.layout.showAnimations
    },

    // Global loading
    setGlobalLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.globalLoading = action.payload
    },

    // Feature flags
    setFeatureFlag: (state, action: PayloadAction<{ key: string; enabled: boolean }>) => {
      state.features[action.payload.key] = action.payload.enabled
    },
    setFeatureFlags: (state, action: PayloadAction<UIState['features']>) => {
      state.features = action.payload
    },

    // Reset UI state (useful for logout)
    resetUI: () => initialState,
  },
})

// Export actions
export const {
  hydrate,
  toggleSidebar,
  setSidebarOpen,
  setSidebarPinned,
  setSidebarWidth,
  openModal,
  closeModal,
  closeAllModals,
  addToast,
  removeToast,
  clearToasts,
  setTheme,
  setLayoutDensity,
  toggleAnimations,
  setGlobalLoading,
  setFeatureFlag,
  setFeatureFlags,
  resetUI,
} = uiSlice.actions

// Export selectors (memoized for performance)
export const selectSidebar = (state: RootState) => state.ui.sidebar
export const selectIsSidebarOpen = (state: RootState) => state.ui.sidebar.isOpen
export const selectModal = (key: string) => (state: RootState) => state.ui.modals[key]
export const selectToasts = (state: RootState) => state.ui.toasts
export const selectTheme = (state: RootState) => state.ui.theme
export const selectLayout = (state: RootState) => state.ui.layout
export const selectGlobalLoading = (state: RootState) => state.ui.globalLoading
export const selectFeatureFlag = (key: string) => (state: RootState) => state.ui.features[key] ?? false

// Export reducer
export default uiSlice.reducer

/**
 * USAGE EXAMPLES:
 *
 * In a component:
 * ```tsx
 * import { useAppDispatch, useAppSelector } from '@/shared/state/hooks'
 * import { toggleSidebar, selectIsSidebarOpen, addToast } from '@/shared/state/slices/ui-slice'
 *
 * function MyComponent() {
 *   const dispatch = useAppDispatch()
 *   const isSidebarOpen = useAppSelector(selectIsSidebarOpen)
 *
 *   const handleToggle = () => {
 *     dispatch(toggleSidebar())
 *   }
 *
 *   const showSuccess = () => {
 *     dispatch(addToast({
 *       type: 'success',
 *       title: 'Operation successful!',
 *       description: 'Your changes have been saved.',
 *     }))
 *   }
 *
 *   return (...)
 * }
 * ```
 *
 * PERSISTENCE NOTE:
 * Only theme, sidebar, and layout preferences are persisted to localStorage.
 * Toasts, modals, and loading states are transient by design.
 */