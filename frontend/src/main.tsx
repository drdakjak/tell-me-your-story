import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './components/AppContext';
import Home from './components/Home.tsx'

import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <Home></Home>
    </AppProvider>
  </StrictMode>,
)
