"use client"

import { useState } from "react"

function LoginForm({ onLogin }) {
  const [selectedUser, setSelectedUser] = useState("u1")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUser }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      // Store JWT in memory (context)
      onLogin(selectedUser, data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Login to Social Network</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Select User:</label>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="u1">User (u1)</option>
            <option value="u2">Admin (u2)</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
    </div>
  )
}

export default LoginForm
