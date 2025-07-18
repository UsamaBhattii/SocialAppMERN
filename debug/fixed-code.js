// Complete corrected implementation with all fixes applied

const Posts = require("../models/Post")
const authenticateUser = require("../middleware/authenticateUser") // Import authenticateUser middleware
const redis = require("redis").createClient() // Import redis client
const isRateLimited = require("../utils/isRateLimited") // Import isRateLimited utility

/**
 * Corrected getSortedPosts function with all issues fixed
 */
async function getSortedPosts(req, res) {
  try {
    // Input validation and sanitization
    const page = Math.max(0, Number.parseInt(req.query.page) || 0)
    const limit = Math.min(Math.max(1, Number.parseInt(req.query.limit) || 20), 100)
    const skip = page * limit

    // Database-level operations for efficiency
    const [posts, total] = await Promise.all([
      Posts.find()
        .sort({ created: -1 }) // Sort in database, not memory
        .skip(skip) // Pagination offset
        .limit(limit) // Limit results
        .lean() // Return plain objects for better performance
        .exec(),
      Posts.countDocuments(), // Get total count for pagination
    ])

    // Structured response with pagination metadata
    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + limit < total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    // Comprehensive error handling
    console.error("Database error:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      query: req.query,
    })

    res.status(500).json({
      error: "Failed to fetch posts",
      // Only expose error details in development
      ...(process.env.NODE_ENV === "development" && {
        details: error.message,
      }),
    })
  }
}

/**
 * Simplified router setup - no unnecessary async wrapper
 */
function setupPostsRoutes(router) {
  // Direct controller usage
  router.get("/posts", getSortedPosts)

  // Alternative with middleware if needed
  router.get("/posts-with-auth", authenticateUser, getSortedPosts)
}

/**
 * Additional improvements for production
 */
async function getSortedPostsProduction(req, res) {
  try {
    // Rate limiting check
    const clientId = req.ip
    if (await isRateLimited(clientId)) {
      return res.status(429).json({ error: "Too many requests" })
    }

    // Cache check
    const cacheKey = `posts:${req.query.page || 0}:${req.query.limit || 20}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return res.json(JSON.parse(cached))
    }

    // Database query with timeout
    const page = Math.max(0, Number.parseInt(req.query.page) || 0)
    const limit = Math.min(Math.max(1, Number.parseInt(req.query.limit) || 20), 100)

    const posts = await Posts.find()
      .sort({ created: -1 })
      .skip(page * limit)
      .limit(limit)
      .lean()
      .maxTimeMS(5000) // 5 second timeout
      .exec()

    const result = { posts, hasMore: posts.length === limit }

    // Cache result
    await redis.setex(cacheKey, 300, JSON.stringify(result)) // 5 min cache

    res.json(result)
  } catch (error) {
    console.error("Posts fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getSortedPosts,
  getSortedPostsProduction,
  setupPostsRoutes,
}
