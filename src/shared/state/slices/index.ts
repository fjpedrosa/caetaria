/**
 * Barrel export for all Redux slices
 * 
 * Import slices from here instead of directly from files.
 * This provides a clean API and makes refactoring easier.
 */

// UI Slice - Global UI state management
export {
  // Slice and reducer
  uiSlice,
  default as uiReducer,
  
  // Actions
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
  
  // Selectors
  selectSidebar,
  selectIsSidebarOpen,
  selectModal,
  selectToasts,
  selectTheme,
  selectLayout,
  selectGlobalLoading,
  selectFeatureFlag,
} from './ui-slice'

// Add more slice exports here as you create them
// Example:
// export * from './auth-slice'
// export * from './preferences-slice'