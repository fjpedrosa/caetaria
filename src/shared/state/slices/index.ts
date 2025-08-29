/**
 * Barrel export for all Redux slices
 * 
 * Import slices from here instead of directly from files.
 * This provides a clean API and makes refactoring easier.
 */

// UI Slice - Global UI state management
export {
  addToast,
  clearToasts,
  closeAllModals,
  closeModal,
  // Actions
  hydrate,
  openModal,
  removeToast,
  resetUI,
  selectFeatureFlag,
  selectGlobalLoading,
  selectIsSidebarOpen,
  selectLayout,
  selectModal,
  // Selectors
  selectSidebar,
  selectTheme,
  selectToasts,
  setFeatureFlag,
  setFeatureFlags,
  setGlobalLoading,
  setLayoutDensity,
  setSidebarOpen,
  setSidebarPinned,
  setSidebarWidth,
  setTheme,
  toggleAnimations,
  toggleSidebar,
  default as uiReducer,
  // Slice and reducer
  uiSlice,
} from './ui-slice'

// Add more slice exports here as you create them
// Example:
// export * from './auth-slice'
// export * from './preferences-slice'