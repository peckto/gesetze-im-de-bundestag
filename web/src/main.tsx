import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const root = document.getElementById('root') as HTMLElement

// @mui/x-charts registers a document-wide 'contextmenu' listener that calls
// preventDefault() for touch input, which suppresses the native long-press link menu
// on mobile. Stop the event at the app root for links so it never reaches that listener.
root.addEventListener('contextmenu', (e) => {
  if (e.target instanceof Element && e.target.closest('a[href]')) {
    e.stopPropagation()
  }
})

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
