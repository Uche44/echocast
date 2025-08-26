"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Loader2, MessageSquare, Twitter, ExternalLink } from "lucide-react"
import type { PostOptions } from "@/lib/types"

interface PostingStatusProps {
  isVisible: boolean
  content: string
  options: PostOptions
  onComplete: () => void
}

interface PlatformStatus {
  platform: "farcaster" | "twitter"
  status: "pending" | "posting" | "success" | "failed"
  error?: string
  link?: string
}

export function PostingStatus({ isVisible, content, options, onComplete }: PostingStatusProps) {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    // Initialize platform statuses
    const initialPlatforms: PlatformStatus[] = []
    if (options.farcaster) {
      initialPlatforms.push({ platform: "farcaster", status: "pending" })
    }
    if (options.twitter) {
      initialPlatforms.push({ platform: "twitter", status: "pending" })
    }
    setPlatforms(initialPlatforms)
    setProgress(0)

    // Simulate posting process
    const postToPlatforms = async () => {
      let completedCount = 0
      const totalPlatforms = initialPlatforms.length

      for (let i = 0; i < initialPlatforms.length; i++) {
        const platform = initialPlatforms[i]

        // Update status to posting
        setPlatforms((prev) => prev.map((p) => (p.platform === platform.platform ? { ...p, status: "posting" } : p)))

        // Simulate posting delay
        await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

        // Simulate success/failure
        const success = Math.random() > 0.15 // 85% success rate

        setPlatforms((prev) =>
          prev.map((p) =>
            p.platform === platform.platform
              ? {
                  ...p,
                  status: success ? "success" : "failed",
                  error: success ? undefined : "Failed to publish post",
                  link: success ? `https://${platform.platform}.com/post/mock-id` : undefined,
                }
              : p,
          ),
        )

        completedCount++
        setProgress((completedCount / totalPlatforms) * 100)
      }

      // Complete after a short delay
      setTimeout(onComplete, 2000)
    }

    postToPlatforms()
  }, [isVisible, options, onComplete])

  if (!isVisible) return null

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "farcaster":
        return <MessageSquare className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "posting":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Waiting..."
      case "posting":
        return "Publishing..."
      case "success":
        return "Published"
      case "failed":
        return "Failed"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-2">Publishing Your Post</h3>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
        </div>

        <div className="space-y-3">
          {platforms.map((platform) => (
            <div key={platform.platform} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                {getPlatformIcon(platform.platform)}
                <span className="font-medium capitalize">{platform.platform}</span>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(platform.status)}
                <Badge
                  variant={
                    platform.status === "success"
                      ? "default"
                      : platform.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {getStatusText(platform.status)}
                </Badge>

                {platform.link && platform.status === "success" && (
                  <a
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {platforms.some((p) => p.status === "failed") && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            Some posts failed to publish. You can try again or check the platform status.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
