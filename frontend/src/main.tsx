import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign ResizeObserver loop errors that occur during layout recalculation
if (typeof window !== 'undefined') {
  const isResizeObserverError = (msg: unknown) => {
    const text = String(msg || '');
    return (
      text.includes('ResizeObserver loop completed with undelivered notifications') ||
      text.includes('ResizeObserver loop limit exceeded') ||
      text.includes('ResizeObserver')
    );
  };

  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (isResizeObserverError(message) || isResizeObserverError(error?.message)) {
      return true;
    }
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };

  window.addEventListener(
    'error',
    (e) => {
      if (isResizeObserverError(e.message) || isResizeObserverError(e.error?.message)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (e) => {
      if (isResizeObserverError(e.reason?.message) || isResizeObserverError(e.reason)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
