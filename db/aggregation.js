// MongoDB Aggregation Pipeline for User Feed

/**
 * Single aggregation pipeline that returns:
 * - 10 most recent posts from user's followings
 * - Sorted newest → oldest
 * - Each with content, created, and author's name
 */
function getUserFeedPipeline(userId) {
  return [
    // Stage 1: Match follows where current user is the follower
    {
      $match: {
        follower: userId,
      },
    },

    // Stage 2: Lookup posts from followed users
    {
      $lookup: {
        from: "posts",
        localField: "following",
        foreignField: "author",
        as: "followingPosts",
      },
    },

    // Stage 3: Unwind posts array to get individual post documents
    {
      $unwind: "$followingPosts",
    },

    // Stage 4: Lookup author information for each post
    {
      $lookup: {
        from: "users",
        localField: "followingPosts.author",
        foreignField: "_id",
        as: "authorInfo",
      },
    },

    // Stage 5: Project only required fields with author's name
    {
      $project: {
        _id: "$followingPosts._id",
        content: "$followingPosts.content",
        created: "$followingPosts.created",
        authorName: { $arrayElemAt: ["$authorInfo.name", 0] },
      },
    },

    // Stage 6: Sort by creation date (newest → oldest)
    {
      $sort: {
        created: -1,
      },
    },

    // Stage 7: Limit to 10 most recent posts
    {
      $limit: 10,
    },
  ]
}

/**
 * Index recommendations for maximum read performance:
 *
 * 1. follows collection needs compound index {follower: 1, following: 1}
 *    for efficient relationship lookups in Stage 1
 *
 * 2. posts collection needs compound index {author: 1, created: -1}
 *    for efficient author-based queries with date sorting
 *
 * 3. users collection uses default {_id: 1} index for author lookups
 */
const recommendedIndexes = {
  follows: [
    { follower: 1, following: 1 }, // Compound for relationship queries
    { follower: 1 }, // For finding who user follows
    { following: 1 }, // For finding user's followers
  ],
  posts: [
    { author: 1, created: -1 }, // Compound for user timeline queries
    { created: -1 }, // For global feed sorting
  ],
  users: [
    { _id: 1 }, // Default primary key index
  ],
}

module.exports = {
  getUserFeedPipeline,
  recommendedIndexes,
}
