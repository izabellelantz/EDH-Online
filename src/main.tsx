import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ProvideAuth } from './Auth/useAuth.tsx'
import { FriendsProvider } from './Friends/FriendsContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProvideAuth>
      <FriendsProvider>
        <App/>
      </FriendsProvider>
    </ProvideAuth>
  </React.StrictMode>,
)
