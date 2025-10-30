import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Disabled service worker for development to avoid MIME type issues
// import { registerServiceWorker } from './services/serviceWorkerRegistration'
// registerServiceWorker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
