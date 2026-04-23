import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for Web Push notifications
if ('serviceWorker' in navigator && 'Notification' in window) {
  navigator.serviceWorker
    .register('/sw.js')
    .catch((error) => console.warn('Service Worker registration failed:', error));
}
