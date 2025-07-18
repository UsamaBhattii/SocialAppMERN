const request = require("supertest")
const { app } = require("./server")

describe("Social Network API - RBAC Tests", () => {
  let adminToken
  let userToken

  beforeAll(async () => {
    // Get admin token (u2)
    const adminResponse = await request(app).post("/login").send({ userId: "u2" })
    adminToken = adminResponse.body.token

    // Get user token (u1)
    const userResponse = await request(app).post("/login").send({ userId: "u1" })
    userToken = userResponse.body.token
  })

  /**
   * Test 1: Successful delete by admin
   */
  test("should allow admin to delete post", async () => {
    const response = await request(app).delete("/posts/p1").set("Authorization", `Bearer ${adminToken}`)

    expect(response.status).toBe(200)
    expect(response.body.message).toBe("Post deleted successfully")
  })

  /**
   * Test 2: Forbidden delete by normal user
   */
  test("should forbid normal user from deleting post", async () => {
    const response = await request(app).delete("/posts/p2").set("Authorization", `Bearer ${userToken}`)

    expect(response.status).toBe(403)
    expect(response.body.error).toBe("Insufficient permissions")
  })

  /**
   * Test 3: Missing/invalid token
   */
  test("should reject missing or invalid token", async () => {
    // Test missing token
    const noTokenResponse = await request(app).delete("/posts/p3")
    expect(noTokenResponse.status).toBe(403)
    expect(noTokenResponse.body.error).toBe("Access denied")

    // Test invalid token
    const invalidTokenResponse = await request(app).delete("/posts/p3").set("Authorization", "Bearer invalid-jwt")
    expect(invalidTokenResponse.status).toBe(403)
    expect(invalidTokenResponse.body.error).toBe("Invalid token")
  })
})
