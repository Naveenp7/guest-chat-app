"use client"

import { useState, useEffect } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { auth, signInAnonymouslyUser } from "@/lib/firebase"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInAnonymously = async () => {
    try {
      setLoading(true)
      const result = await signInAnonymouslyUser()
      if (!result) {
        console.warn("Authentication failed: Firebase not configured")
      }
    } catch (error) {
      console.error("Failed to sign in anonymously:", error)
    } finally {
      setLoading(false)
    }
  }

  const getUsername = () => {
    if (!user) return "Anonymous"
    return `User-${user.uid.slice(-6)}`
  }

  return {
    user,
    loading,
    signInAnonymously,
    isAuthenticated: !!user,
    username: getUsername(),
  }
}
