// MongoDB Collection Schemas for Social Network Analytics

const { ObjectId } = require("mongodb")

/**
 * Users Collection Schema
 * Stores basic user information and join date
 */
const userSchema = {
  _id: ObjectId, // Primary key
  name: String, // User display name
  joined: Date, // Registration timestamp
}

/**
 * Follows Collection Schema
 * Represents follower relationships between users
 */
const followSchema = {
  follower: ObjectId, // User who is following (references users._id)
  following: ObjectId, // User being followed (references users._id)
}

/**
 * Posts Collection Schema
 * Stores user posts with content and metadata
 */
const postSchema = {
  _id: ObjectId, // Primary key
  author: ObjectId, // Post author (references users._id)
  content: String, // Post text content
  created: Date, // Post creation timestamp
}

// Sample dataset for testing
const sampleData = {
  users: [
    { _id: new ObjectId("507f1f77bcf86cd799439011"), name: "Alice", joined: new Date("2024-01-15T09:00Z") },
    { _id: new ObjectId("507f1f77bcf86cd799439012"), name: "Bob", joined: new Date("2024-02-02T12:30Z") },
    { _id: new ObjectId("507f1f77bcf86cd799439013"), name: "Charlie", joined: new Date("2024-02-15T14:20Z") },
  ],
  follows: [
    { follower: new ObjectId("507f1f77bcf86cd799439011"), following: new ObjectId("507f1f77bcf86cd799439012") },
    { follower: new ObjectId("507f1f77bcf86cd799439011"), following: new ObjectId("507f1f77bcf86cd799439013") },
  ],
  posts: [
    {
      _id: new ObjectId("507f1f77bcf86cd799439021"),
      author: new ObjectId("507f1f77bcf86cd799439012"),
      content: "Hello!",
      created: new Date("2024-03-10T18:00Z"),
    },
    {
      _id: new ObjectId("507f1f77bcf86cd799439022"),
      author: new ObjectId("507f1f77bcf86cd799439013"),
      content: "Beautiful day today!",
      created: new Date("2024-03-11T09:15Z"),
    },
    {
      _id: new ObjectId("507f1f77bcf86cd799439023"),
      author: new ObjectId("507f1f77bcf86cd799439012"),
      content: "Working on new features",
      created: new Date("2024-03-11T15:30Z"),
    },
  ],
}

module.exports = {
  userSchema,
  followSchema,
  postSchema,
  sampleData,
}
