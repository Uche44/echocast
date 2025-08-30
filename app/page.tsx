"use client"

import { useEffect, useState } from "react"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { AuthGuard } from "@/components/auth-guard"
import { PostComposer } from "@/components/post-composer"
import { UserProfile } from "@/components/user-profile"
import { PaymentModal } from "@/components/payment-modal"
import { PostingStatus } from "@/components/posting-status"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ApiClient } from "@/lib/api-client"
import type { PostOptions } from "@/lib/types"


export default function HomePage() {
  const { setFrameReady, isFrameReady } = useMiniKit()
  const { toast } = useToast()
  // const { signerUuid } = useAuth()
   const { user, isLoading, error } = useAuth();
  const [pendingPost, setPendingPost] = useState<{
    content: string
    options: PostOptions
  } | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPostingStatus, setShowPostingStatus] = useState(false)

  useEffect(() => {
    if (!isFrameReady) setFrameReady()
  }, [isFrameReady, setFrameReady])


  if (isLoading || !user) return null;

  const handlePaymentRequired = (content: string, options: PostOptions) => {
    setPendingPost({ content, options })
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async () => {
    if (!pendingPost) return

    try {
      setShowPaymentModal(false)
      setShowPostingStatus(true)

      const { content, options } = pendingPost

      const promises = []
      const platforms = []

      if (options.farcaster) {
        // promises.push(ApiClient.postToFarcaster(content, signerUuid || undefined))
        promises.push(ApiClient.postToFarcaster(content))
        platforms.push("Farcaster")
      }

      if (options.twitter) {
        promises.push(ApiClient.postToTwitter(content))
        platforms.push("Twitter")
      }

      const results = await Promise.allSettled(promises)
      const failures = results.filter(
        (result) => result.status === "rejected" || (result.status === "fulfilled" && !result.value.success),
      )

      // Let PostingStatus component handle the UI feedback
      // The actual success/failure will be shown there
    } catch (error) {
      toast({
        title: "Publishing Error",
        description: "An unexpected error occurred while publishing your post.",
        variant: "destructive",
      })
      setShowPostingStatus(false)
    }
  }

  const handlePostingComplete = () => {
    setShowPostingStatus(false)
    setPendingPost(null)

    toast({
      title: "Publishing Complete",
      description: "Check the results above for details.",
    })
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setPendingPost(null)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">EchoCast</h1>
              <p className="text-muted-foreground">Your voice, echoed</p>
            </div>

            {/* Posting Status */}
            {showPostingStatus && pendingPost && (
              <PostingStatus
                isVisible={showPostingStatus}
                content={pendingPost.content}
                options={pendingPost.options}
                onComplete={handlePostingComplete}
              />
            )}

            {/* Main Content */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Post Composer - Takes up 2 columns on large screens */}
              <div className="lg:col-span-2">
                <PostComposer onPaymentRequired={handlePaymentRequired} />
              </div>

              {/* User Profile - Takes up 1 column on large screens */}
              <div className="lg:col-span-1">
                <UserProfile />
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Built by @uche.dev</p>
            </div>
          </div>
        </div>

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          onPaymentSuccess={handlePaymentSuccess}
          content={pendingPost?.content || ""}
          options={pendingPost?.options || { farcaster: false, twitter: false }}
        />

        <Toaster />
      </div>
    </AuthGuard>
  )
}
