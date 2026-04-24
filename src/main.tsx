import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { initializeStore as initializeInventoryStore } from './pages/Inventory/store';
import { initializeStore as initializeConfirmationStore } from './pages/Confirmation/store';
import { initializeStore as initializeSolicitudesStore } from './pages/Solicitudes/store';
import { initializeStore as initializePeopleStore } from './pages/People/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for Web Push notifications
if ('serviceWorker' in navigator && 'Notification' in window) {
  navigator.serviceWorker
    .register('/sw.js')
    .catch(error => console.warn('Service Worker registration failed:', error));
}

// Initialize data stores from backend
Promise.all([
  initializeInventoryStore().catch(() => {
    // fallback to seed data already handled in store
  }),
  initializeConfirmationStore().catch(() => {
    // fallback to empty cache
  }),
  initializeSolicitudesStore().catch(() => {
    // fallback to empty cache
  }),
  initializePeopleStore().catch(() => {
    // fallback to empty cache
  }),
]);
