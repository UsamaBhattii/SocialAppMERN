const express = require("express")
const jwt = require("jsonwebtoken")

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || "assessment-secret-key"

// Middleware
app.use(express.json())

// Hard-coded users as specified
const users = {
  u1: { id: "u1", role: "user" },
  u2: { id: "u2", role: "admin" },
}

// Mock posts storage
const posts = [
  { id: "p1", content: "First post", author: "u1" },
  { id: "p2", content: "Second post", author: "u2" },
  { id: "p3", content: "Third post", author: "u1" },
]

/**
 * Custom middleware authorize(roles: string[])
 * - Reads JWT from Authorization: Bearer ...
 * - Verifies it, extracts role
 * - Blocks request with 403 if role not in roles[], otherwise calls next()
 */
function authorize(roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization

    // Check for Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ error: "Access denied" })
    }

    const token = authHeader.substring(7)

    try {
      // Verify JWT and extract payload
      const decoded = jwt.verify(token, JWT_SECRET)

      // Check if user role is authorized
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Insufficient permissions" })
      }

      // Attach user info to request
      req.user = decoded
      next()
    } catch (error) {
      return res.status(403).json({ error: "Invalid token" })
    }
  }
}

/**
 * POST /login - Returns signed JWT
 * No DB required, hard-coded users
 */
app.post("/login", (req, res) => {
  const { userId } = req.body

  const user = users[userId]
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  // Sign JWT with user info
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  })

  res.json({ token })
})

/**
 * Protected DELETE /posts/:id endpoint
 * Only accessible by admin role
 */
app.delete("/posts/:id", authorize(["admin"]), (req, res) => {
  const { id } = req.params

  const postIndex = posts.findIndex((post) => post.id === id)
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found" })
  }

  // Remove post
  posts.splice(postIndex, 1)
  res.json({ message: "Post deleted successfully" })
})

// Additional endpoints for frontend
app.get("/feed", (req, res) => {
  const page = Number.parseInt(req.query.page) || 0
  const limit = 10 // Always 10 items as specified
  const skip = page * limit

  const paginatedPosts = posts.slice(skip, skip + limit)

  res.json({
    posts: paginatedPosts,
    hasMore: skip + limit < posts.length,
    total: posts.length,
  })
})

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

module.exports = { app, authorize }
