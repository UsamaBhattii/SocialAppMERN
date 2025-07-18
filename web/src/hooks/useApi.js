"use client"

import { useState, useEffect, useRef } from "react"

// In-memory cache for GET requests
const cache = new Map()

/**
 * Custom hook useApi(resource: string, options?)
 * Manages fetch, JSON-parsing, loading, error, and caching
 * Re-rendering same resource doesn't re-fetch (cached)
 */
export function useApi(resource, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  const { method = "GET", body = null, headers = {}, cache: useCache = true, dependencies = [] } = options

  useEffect(() => {
    if (!resource) return

    const cacheKey = `${method}:${resource}:${JSON.stringify(body)}`

    // Check cache first (only for GET requests)
    if (useCache && method === "GET" && cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey)
      setData(cachedData)
      setLoading(false)
      setError(null)
      return
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        const response = await fetch(`/api${resource}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: body ? JSON.stringify(body) : null,
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        // Cache successful GET requests
        if (useCache && method === "GET") {
          cache.set(cacheKey, result)
        }

        setData(result)
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [resource, method, JSON.stringify(body), JSON.stringify(headers), useCache, ...dependencies])

  const refetch = () => {
    const cacheKey = `${method}:${resource}:${JSON.stringify(body)}`
    cache.delete(cacheKey)
    setData(null)
    setError(null)
  }

  return { data, loading, error, refetch }
}
