"use client"

import { useState, createContext, useContext } from "react"
import LoginForm from "./components/LoginForm"
import Feed from "./components/Feed"

// Context for JWT token storage in memory
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

function App() {
  const [user, setUser] = useState(null) // Current user ID
  const [token, setToken] = useState(null) // JWT token stored in memory

  const login = (userId, authToken) => {
    setUser(userId)
    setToken(authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <div className="app">
        {!user ? (
          <div className="container">
            <LoginForm onLogin={login} />
          </div>
        ) : (
          <Feed user={user} token={token} onLogout={logout} />
        )}
      </div>
    </AuthContext.Provider>
  )
}

export default App
