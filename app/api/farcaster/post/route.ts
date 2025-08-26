import { type NextRequest, NextResponse } from "next/server"
import { NeynarService } from "@/lib/neynar"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required and must be a string" }, { status: 400 })
    }

    if (content.length > 320) {
      return NextResponse.json({ error: "Content exceeds maximum length of 320 characters" }, { status: 400 })
    }

    // Get signer UUID from headers or session (mock for now)
    const signerUuid = request.headers.get("x-signer-uuid") || "mock-signer-uuid"

    // Publish cast using Neynar service
    const success = await NeynarService.publishCast(signerUuid, content)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Cast published successfully",
        platform: "farcaster",
        content,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to publish cast",
          platform: "farcaster",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Farcaster post error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        platform: "farcaster",
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
