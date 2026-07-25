import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import { CustomCursor } from './components/custom-cursor'
import { ScrollToTop } from './components/scroll-to-top'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CustomCursor />
      <App />
      <ScrollToTop />
      <Toaster theme="dark" position="bottom-right" />
    </BrowserRouter>
  </React.StrictMode>,
)
