"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useApi } from "../hooks/useApi"

function Feed({ user, token, onLogout }) {
  const [page, setPage] = useState(0)
  const [allPosts, setAllPosts] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Use custom useApi hook to fetch feed data
  const { data, loading, error } = useApi(`/feed?page=${page}&limit=10`, {
    dependencies: [page],
  })

  // Update posts when new data arrives
  useEffect(() => {
    if (data) {
      if (page === 0) {
        // First load - replace all posts
        setAllPosts(data.posts)
      } else {
        // Subsequent loads - append new posts (avoid duplicates)
        setAllPosts((prev) => {
          const existingIds = new Set(prev.map((post) => post.id))
          const newPosts = data.posts.filter((post) => !existingIds.has(post.id))
          return [...prev, ...newPosts]
        })
      }
      setHasMore(data.hasMore)
      setLoadingMore(false)
    }
  }, [data, page])

  // Infinite scroll: load 10 items at a time
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true)
      setPage((prev) => prev + 1)
    }
  }, [loadingMore, hasMore, loading])

  // Scroll event handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMore()
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loadMore])

  // Optimized rendering: only new items mount/unmount
  const PostList = useMemo(() => {
    return allPosts.map((post, index) => <PostItem key={post.id} post={post} isAdmin={user === "u2"} token={token} />)
  }, [allPosts, user, token])

  if (error) {
    return (
      <div className="card" style={{ color: "red" }}>
        Error: {error}
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Feed ({user === "u2" ? "Admin" : "User"})</h2>
          <button onClick={onLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        {loading && page === 0 && <div className="loading">Loading feed...</div>}

        {PostList}

        {loadingMore && <div className="loading">Loading more posts...</div>}

        {!hasMore && allPosts.length > 0 && <div className="loading">No more posts</div>}

        {!loading && allPosts.length === 0 && <div className="loading">No posts found</div>}
      </div>
    </div>
  )
}

// Optimized PostItem: only new items mount/unmount, not whole list
const PostItem = React.memo(({ post, isAdmin, token }) => {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert("Post deleted!")
        window.location.reload() // Simple refresh
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (err) {
      alert("Delete failed")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="post-item">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>Post {post.id}</p>
          <p style={{ margin: "0 0 10px 0" }}>{post.content}</p>
          <small style={{ color: "#666" }}>by {post.author}</small>
        </div>
        {isAdmin && (
          <button onClick={handleDelete} className="btn btn-danger" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </div>
  )
})

export default Feed
