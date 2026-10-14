import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import axios from 'axios'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:3333')) {
    config.url = config.url.replace('http://localhost:3333', '')
  }
  return config
})