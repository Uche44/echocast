"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Twitter, Zap, Loader2 } from "lucide-react"
import type { PostOptions } from "@/lib/types"

interface PostComposerProps {
  onPaymentRequired: (content: string, options: PostOptions) => void
}

export function PostComposer({ onPaymentRequired }: PostComposerProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [content, setContent] = useState("")
  const [postOption, setPostOption] = useState<"farcaster" | "twitter" | "both">("farcaster")
  const [isPosting, setIsPosting] = useState(false)

  const maxLength = 280
  const remainingChars = maxLength - content.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to post",
        variant: "destructive",
      })
      return
    }

    if (content.length > maxLength) {
      toast({
        title: "Error",
        description: `Post is too long. Maximum ${maxLength} characters allowed.`,
        variant: "destructive",
      })
      return
    }

    if (postOption === "twitter" && !user?.twitterConnected) {
      toast({
        title: "Twitter Not Connected",
        description: "Please connect your Twitter account first",
        variant: "destructive",
      })
      return
    }

    const options: PostOptions = {
      farcaster: postOption === "farcaster" || postOption === "both",
      twitter: postOption === "twitter" || postOption === "both",
    }

    // Trigger payment flow
    onPaymentRequired(content, options)
  }

  const getPostOptionLabel = () => {
    switch (postOption) {
      case "farcaster":
        return "Farcaster only"
      case "twitter":
        return "Twitter only"
      case "both":
        return "Both platforms"
      default:
        return ""
    }
  }

  const getPostOptionIcon = () => {
    switch (postOption) {
      case "farcaster":
        return <MessageSquare className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      case "both":
        return <Zap className="h-4 w-4" />
      default:
        return null
    }
  }

  if (!user) return null

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
            <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{user.displayName}</h3>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {getPostOptionIcon()}
            {getPostOptionLabel()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isPosting}
            />
            <div className="flex justify-between items-center text-sm">
              <span className={`${remainingChars < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {remainingChars} characters remaining
              </span>
              <span className="text-muted-foreground">
                {content.length}/{maxLength}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Where would you like to post?</Label>
            <RadioGroup value={postOption} onValueChange={(value) => setPostOption(value as typeof postOption)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="farcaster" id="farcaster" />
                <Label htmlFor="farcaster" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Farcaster only
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="twitter" id="twitter" disabled={!user.twitterConnected} />
                <Label
                  htmlFor="twitter"
                  className={`flex items-center gap-2 cursor-pointer ${!user.twitterConnected ? "opacity-50" : ""}`}
                >
                  <Twitter className="h-4 w-4 text-blue-500" />
                  Twitter only
                  {!user.twitterConnected && (
                    <Badge variant="outline" className="text-xs">
                      Not connected
                    </Badge>
                  )}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" disabled={!user.twitterConnected} />
                <Label
                  htmlFor="both"
                  className={`flex items-center gap-2 cursor-pointer ${!user.twitterConnected ? "opacity-50" : ""}`}
                >
                  <Zap className="h-4 w-4 text-secondary" />
                  Both Farcaster + Twitter
                  {!user.twitterConnected && (
                    <Badge variant="outline" className="text-xs">
                      Twitter required
                    </Badge>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <Zap className="h-4 w-4 inline mr-1" />
              Small fee required per post
            </div>
            <Button
              type="submit"
              disabled={isPosting || !content.trim() || remainingChars < 0}
              className="min-w-[120px]"
            >
              {isPosting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                "Post & Pay"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
