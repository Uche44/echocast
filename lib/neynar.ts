export interface NeynarUser {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  follower_count: number
  following_count: number
}

export interface NeynarAuthResponse {
  signer_uuid: string
  public_key: string
  status: string
  signer_approval_url?: string
}

export class NeynarService {
  private static readonly API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || "NEYNAR_API_DOCS"
  private static readonly BASE_URL = "https://api.neynar.com/v2"

  static async getUserByFid(fid: number): Promise<NeynarUser | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/farcaster/user/bulk?fids=${fid}`, {
        headers: {
          accept: "application/json",
          api_key: this.API_KEY,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.users?.[0] || null
    } catch (error) {
      console.error("Failed to fetch user from Neynar:", error)
      return null
    }
  }

  static async createSigner(): Promise<NeynarAuthResponse | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/farcaster/signer`, {
        method: "POST",
        headers: {
          accept: "application/json",
          api_key: this.API_KEY,
          "content-type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to create signer:", error)
      return null
    }
  }

  static async publishCast(
    signerUuid: string,
    text: string,
    retries = 3,
  ): Promise<{ success: boolean; error?: string; castHash?: string }> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${this.BASE_URL}/farcaster/cast`, {
          method: "POST",
          headers: {
            accept: "application/json",
            api_key: this.API_KEY,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            signer_uuid: signerUuid,
            text,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          return {
            success: true,
            castHash: data.cast?.hash,
          }
        } else {
          // Handle specific Neynar API errors
          if (response.status === 401) {
            return { success: false, error: "Invalid API key or signer" }
          } else if (response.status === 429) {
            return { success: false, error: "Rate limit exceeded" }
          } else if (response.status === 400) {
            return { success: false, error: data.message || "Invalid cast content" }
          }

          // Retry on server errors
          if (response.status >= 500 && attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
            continue
          }

          return { success: false, error: `HTTP ${response.status}: ${data.message || "Unknown error"}` }
        }
      } catch (error) {
        console.error(`Neynar API attempt ${attempt} failed:`, error)

        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
          continue
        }

        return {
          success: false,
          error: error instanceof Error ? error.message : "Network error",
        }
      }
    }

    return { success: false, error: "Max retries exceeded" }
  }

  static async autoSignIn(): Promise<{ user: NeynarUser | null; signerUuid?: string; error?: string }> {
    try {
      // Check for existing auth
      const storedFid = localStorage.getItem("farcaster_fid")
      const storedSignerUuid = localStorage.getItem("farcaster_signer_uuid")

      if (storedFid && storedSignerUuid) {
        const user = await this.getUserByFid(Number.parseInt(storedFid))
        if (user) {
          return { user, signerUuid: storedSignerUuid }
        }
      }

      // For demo purposes, create a mock user with signer
      // const mockUser: NeynarUser = {
      //   fid: 12345,
      //   username: "demo_user",
      //   display_name: "Demo User",
      //   pfp_url: "/diverse-user-avatars.png",
      //   follower_count: 150,
      //   following_count: 89,
      // }

      // const mockSignerUuid = "demo-signer-uuid-" + Math.random().toString(36).substring(7)

      // localStorage.setItem("farcaster_fid", mockUser.fid.toString())
      // localStorage.setItem("farcaster_signer_uuid", mockSignerUuid)

      // return { user: mockUser, signerUuid: mockSignerUuid }

      // No existing session found; return a null user to allow UI to prompt sign-in
      return { user: null }
    } catch (error) {
      console.error("Auto sign-in failed:", error)
      return {
        user: null,
        error: error instanceof Error ? error.message : "Authentication failed",
      }
    }
  }

  // static getStoredSignerUuid(): string | null {
  //   if (typeof window === "undefined") return null
  //   return localStorage.getItem("farcaster_signer_uuid")
  // }
}
