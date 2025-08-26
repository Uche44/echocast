import { type NextRequest, NextResponse } from "next/server"
import { TwitterBackendService } from "@/lib/twitter"

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required and must be a string" }, { status: 400 })
    }

    if (content.length > 280) {
      return NextResponse.json({ error: "Content exceeds maximum length of 280 characters" }, { status: 400 })
    }

    // Get user token from headers
    const userToken = request.headers.get("x-twitter-token")
    
    if (!userToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Twitter authentication required",
          platform: "twitter",
        },
        { status: 401 },
      )
    }

    // Validate the user token first
    const tokenValidation = await TwitterBackendService.validateUserToken(userToken)
    if (!tokenValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Twitter authentication token",
          platform: "twitter",
        },
        { status: 401 },
      )
    }

    // Rate limiting based on user ID
    const userId = tokenValidation.user?.id || "unknown"
    if (!checkRateLimit(userId, 10, 60000)) { // 10 tweets per minute
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please wait before posting again.",
          platform: "twitter",
        },
        { status: 429 },
      )
    }

    // Publish tweet using secure backend service
    const result = await TwitterBackendService.publishTweet(content, userToken)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Tweet published successfully",
        platform: "twitter",
        content,
        tweetId: result.tweetId,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to publish tweet",
          platform: "twitter",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Twitter post error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        platform: "twitter",
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
