// Runnable examples demonstrating MongoDB aggregation pipeline

const { ObjectId } = require("mongodb")
const { getUserFeedPipeline, recommendedIndexes } = require("./aggregation")
const { sampleData } = require("./schemas")

/**
 * Simulate MongoDB aggregation pipeline execution
 */
function simulateAggregation() {
  console.log("=== MongoDB Aggregation Pipeline Demo ===\n")

  // Test with Alice's user ID
  const aliceId = new ObjectId("507f1f77bcf86cd799439011")

  console.log("1. Input Data:")
  console.log("Users:", JSON.stringify(sampleData.users, null, 2))
  console.log("\nFollows:", JSON.stringify(sampleData.follows, null, 2))
  console.log("\nPosts:", JSON.stringify(sampleData.posts, null, 2))

  console.log("\n2. Aggregation Pipeline:")
  const pipeline = getUserFeedPipeline(aliceId)
  console.log(JSON.stringify(pipeline, null, 2))

  console.log("\n3. Expected Output (Alice's feed):")
  // Manually simulate the pipeline result
  const expectedResult = [
    {
      _id: new ObjectId("507f1f77bcf86cd799439023"),
      content: "Working on new features",
      created: new Date("2024-03-11T15:30Z"),
      authorName: "Bob",
    },
    {
      _id: new ObjectId("507f1f77bcf86cd799439022"),
      content: "Beautiful day today!",
      created: new Date("2024-03-11T09:15Z"),
      authorName: "Charlie",
    },
    {
      _id: new ObjectId("507f1f77bcf86cd799439021"),
      content: "Hello!",
      created: new Date("2024-03-10T18:00Z"),
      authorName: "Bob",
    },
  ]

  console.log(JSON.stringify(expectedResult, null, 2))

  console.log("\n4. Recommended Indexes:")
  console.log(JSON.stringify(recommendedIndexes, null, 2))

  console.log("\n5. Performance Notes:")
  console.log("- Compound index {follower: 1, following: 1} enables efficient Stage 1 matching")
  console.log("- Compound index {author: 1, created: -1} optimizes post lookups with sorting")
  console.log("- Pipeline processes only followed users' posts, not entire collection")
}

// Run if called directly
if (require.main === module) {
  simulateAggregation()
}

module.exports = { simulateAggregation }
