"use client"

import { useState, useEffect, useCallback } from "react"
import { NeynarService } from "@/lib/neynar"
// import { TwitterService } from "@/lib/twitter"

import { MinikitService } from "@/lib/minikit"
import type { User } from "@/lib/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signerUuid, setSignerUuid] = useState<string | null>(null)

  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const walletAddress = await MinikitService.initializeWallet()

      const farcasterAuth = await NeynarService.autoSignIn()

      const twitterConnected = false

      if (farcasterAuth.user) {
        setUser({
          fid: farcasterAuth.user.fid,
          username: farcasterAuth.user.username,
          displayName: farcasterAuth.user.display_name,
          avatar: farcasterAuth.user.pfp_url,
          twitterConnected,
          walletAddress: walletAddress || undefined,
        })
        setSignerUuid(farcasterAuth.signerUuid || null)
      } else if (farcasterAuth.error) {
        setError(farcasterAuth.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const connectTwitter = useCallback(async () => {
    try {
      setError(null)
      // const authUrl = await TwitterService.getAuthUrl()

      const popup = window.open("/api/twitter", "twitter-auth", "width=600,height=600,scrollbars=yes,resizable=yes")

      // const checkClosed = setInterval(() => {
      //   if (popup?.closed) {
      //     clearInterval(checkClosed)
      //     if (TwitterService.isConnected()) {
      //       setUser((prev) => (prev ? { ...prev, twitterConnected: true } : null))
      //     }
      //   }

      // }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Twitter connection failed")
    }
  }, [])

  // const disconnectTwitter = useCallback(() => {
  //   TwitterService.disconnect()
  //   setUser((prev) => (prev ? { ...prev, twitterConnected: false } : null))
  // }, [])

  // const signOut = useCallback(() => {
  //   localStorage.removeItem("farcaster_fid")
  //   localStorage.removeItem("farcaster_signer_uuid")
  //   TwitterService.disconnect()
  //   setUser(null)
  //   setSignerUuid(null)
  // }, [])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return {
    user,
    isLoading,
    error,
    signerUuid,
    connectTwitter,
    // disconnectTwitter,
    // signOut,
    refetch: initializeAuth,
  }
}
