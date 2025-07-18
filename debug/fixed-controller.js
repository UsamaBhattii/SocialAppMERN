// Corrected version of the problematic posts controller

const Posts = require("../models/Post") // Assuming Mongoose model

// Fixed version with proper error handling, pagination, and database-level sorting
async function getSortedPosts(req, res) {
  try {
    // Parse and validate pagination parameters
    const page = Math.max(0, Number.parseInt(req.query.page) || 0)
    const limit = Math.min(Math.max(1, Number.parseInt(req.query.limit) || 20), 100)
    const skip = page * limit

    // Use database-level sorting and pagination
    const posts = await Posts.find()
      .sort({ created: -1 }) // Sort in database, not in memory
      .skip(skip)
      .limit(limit)
      .lean() // Return plain objects for better performance
      .exec()

    // Get total count for pagination metadata
    const total = await Posts.countDocuments()

    // Return structured response with pagination info
    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + limit < total,
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    res.status(500).json({
      error: "Failed to fetch posts",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Simplified router - no need for async wrapper
module.exports = { getSortedPosts }
