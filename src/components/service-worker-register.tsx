'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('SW: Service Worker registered successfully:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New version available
                console.log('SW: New version available');
                // Optionally notify user about update
                showUpdateNotification();
              } else {
                // First time install
                console.log('SW: App is cached for offline use');
              }
            }
          });
        }
      });

      // Handle controlling
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('SW: New service worker is controlling the page');
        // Optionally reload the page
        if (confirm('New version available. Reload to update?')) {
          window.location.reload();
        }
      });

    } catch (error) {
      console.error('SW: Service Worker registration failed:', error);
    }
  };

  const showUpdateNotification = () => {
    // Create a subtle notification about update availability
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 300px;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      ">
        <div style="margin-bottom: 8px;">New version available!</div>
        <button 
          onclick="window.location.reload()" 
          style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 8px;
            font-size: 12px;
          "
        >
          Update Now
        </button>
        <button 
          onclick="this.parentElement.parentElement.remove()" 
          style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 12px;
            opacity: 0.8;
          "
        >
          Later
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  };

  // This component renders nothing
  return null;
}