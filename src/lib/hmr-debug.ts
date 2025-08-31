/**
 * HMR Debug Utilities for jsx-dev-runtime issues
 * Usage: Import in development components that experience HMR issues
 */

if (process.env.NODE_ENV === 'development') {
  // Monitor jsx-dev-runtime availability
  const checkJsxRuntime = () => {
    try {
      const jsxRuntime = require('react/jsx-dev-runtime');
      console.log('✅ jsx-dev-runtime is available:', !!jsxRuntime);
      return true;
    } catch (error) {
      console.error('❌ jsx-dev-runtime error:', error);
      return false;
    }
  };

  // Check on module load
  checkJsxRuntime();

  // Monitor HMR updates
  if (typeof window !== 'undefined' && (window as any).webpackHotUpdate) {
    const originalUpdate = (window as any).webpackHotUpdate;
    (window as any).webpackHotUpdate = function(chunkId: string, moreModules: any) {
      console.log('🔄 HMR Update detected:', chunkId);
      
      // Check jsx-dev-runtime after HMR
      setTimeout(() => {
        checkJsxRuntime();
      }, 100);
      
      return originalUpdate.call(this, chunkId, moreModules);
    };
  }

  // Turbopack HMR monitoring
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      console.log('🔄 Page unloading - HMR triggered');
    });
    
    // Monitor for Turbopack specific events
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          const hasScript = addedNodes.some(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node as Element).tagName === 'SCRIPT'
          );
          
          if (hasScript) {
            console.log('📦 New script injected - checking jsx-dev-runtime');
            setTimeout(checkJsxRuntime, 50);
          }
        }
      });
    });
    
    observer.observe(document.head, {
      childList: true,
      subtree: true
    });
  }
}

// Export debugging function for manual checks
export const debugJsxRuntime = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔍 jsx-dev-runtime Debug Info');
    
    try {
      const jsxRuntime = require('react/jsx-dev-runtime');
      console.log('jsx-dev-runtime module:', jsxRuntime);
      console.log('Available exports:', Object.keys(jsxRuntime));
      
      const react = require('react');
      console.log('React version:', react.version);
      console.log('React location:', require.resolve('react'));
      console.log('jsx-dev-runtime location:', require.resolve('react/jsx-dev-runtime'));
      
    } catch (error) {
      console.error('Error loading modules:', error);
    }
    
    console.groupEnd();
  }
};

// Auto-debug in development
if (process.env.NODE_ENV === 'development') {
  // Run debug after a short delay to ensure modules are loaded
  setTimeout(debugJsxRuntime, 1000);
}