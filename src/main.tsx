import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './App'
import AppSol from './AppSol'
import { BrowserRouter as Router } from 'react-router-dom'; 


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
    <AppSol />
    </Router>
  </StrictMode>,
)
