import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// ── Auto cache clearer ────────────────────────────────────────────────────────
// Bump APP_VERSION whenever you deploy breaking changes to force a full wipe.
const APP_VERSION = '1.0.0';
const VERSION_KEY = 'aura_app_version';

const storedVersion = localStorage.getItem(VERSION_KEY);
if (storedVersion !== APP_VERSION) {
  // Clear all localStorage & sessionStorage (except the new version key)
  localStorage.clear();
  sessionStorage.clear();
  // Clear all service-worker caches
  if ('caches' in window) {
    caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
  }
  localStorage.setItem(VERSION_KEY, APP_VERSION);
}
// ─────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)