import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Redireciona http://localhost:3333/api/... para o proxy do Vite
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:3333')) {
    config.url = config.url.replace('http://localhost:3333', '')
  }
  return config
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)