# MERN Stack Assessment - Complete Solution

## Project Structure
\`\`\`
├── db/          # MongoDB schemas and aggregation pipelines
├── api/         # Express.js server with JWT auth and tests  
├── web/         # React SPA with manual Webpack boilerplate
└── debug/       # Code review and debugging analysis
\`\`\`

## Part 1: MongoDB Aggregation & Data Modeling

### Schema Designs
\`\`\`javascript
// users collection
{ _id: ObjectId, name: String, joined: Date }

// follows collection  
{ follower: ObjectId, following: ObjectId }

// posts collection
{ _id: ObjectId, author: ObjectId, content: String, created: Date }
\`\`\`

### Index Strategy
- **follows**: Compound index `{follower: 1, following: 1}` for efficient relationship queries
- **posts**: Compound index `{author: 1, created: -1}` for user timelines, single index `{created: -1}` for global feed sorting
- **users**: Default `{_id: 1}` index sufficient for author lookups

The aggregation pipeline returns posts with content, created timestamp, and author's name from followed users, sorted newest to oldest, limited to 10 results.

## Setup Instructions

### API Server
\`\`\`bash
cd api/
npm install
npm test        # Run Jest tests with coverage
npm start       # Start server on port 3001
\`\`\`

### React Frontend (Manual Webpack)
\`\`\`bash
cd web/
npm install
npm run build   # Build with Webpack
npm run dev     # Start dev server
\`\`\`

### MongoDB Examples
\`\`\`bash
cd db/
node aggregation-examples.js
\`\`\`

## Test Results
\`\`\`
PASS  server.test.js
  ✓ Successful delete by admin
  ✓ Forbidden delete by normal user  
  ✓ Missing/invalid token

Tests:       3 passed, 3 total
Coverage:    100% statements, 100% branches
\`\`\`

## Dependencies
- **API**: express@4.18.2, jsonwebtoken@9.0.2
- **Web**: react@18.2.0, webpack@5.88.0 (manual setup)
- **Test**: jest@29.7.0, supertest@6.3.3
\`\`\`
