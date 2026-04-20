import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress ResizeObserver loop limit exceeded error
// This is a common non-breaking error in modern web apps caused by layout shifts
// during animations or complex CSS-in-JS updates.
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('ResizeObserver loop completed with undelivered notifications') || args[0]?.includes?.('ResizeObserver loop limit exceeded')) {
      return;
    }
    originalError.apply(console, args);
  };

  window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications' || e.message === 'ResizeObserver loop limit exceeded') {
      if (e.stopImmediatePropagation) {
        e.stopImmediatePropagation();
      } else {
        e.stopPropagation();
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
