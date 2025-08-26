 


// Backend-only service 
export class TwitterBackendService {
  private static readonly API_BASE = "https://api.twitterapi.io/v1"
  
  // This method is only called from backend API routes
  static async publishTweet(
    text: string,
    userToken: string,
    retries = 3,
  ): Promise<{ success: boolean; error?: string; tweetId?: string }> {
    // Get the API key from server-side environment variables
    const apiKey = process.env.TWITTER_API_KEY
    
    if (!apiKey) {
      console.error("Twitter API key not configured")
      return { success: false, error: "Twitter API not configured" }
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Make actual API call to Twitter with the secure API key
        const response = await fetch(`${this.API_BASE}/tweets`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-User-Token": userToken, // User's OAuth token
          },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          
          if (response.status === 429 && attempt < retries) {
            // Rate limit - wait and retry
            const retryAfter = response.headers.get("Retry-After") || "60"
            await new Promise((resolve) => setTimeout(resolve, parseInt(retryAfter) * 1000))
            continue
          }
          
          return { 
            success: false, 
            error: errorData.message || `HTTP ${response.status}` 
          }
        }

        const data = await response.json()
        return {
          success: true,
          tweetId: data.data?.id,
        }
      } catch (error) {
        console.error(`Twitter API attempt ${attempt} failed:`, error)

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

  // Method to validate user tokens (called from backend)
  static async validateUserToken(userToken: string): Promise<{ valid: boolean; user?: TwitterUser }> {
    const apiKey = process.env.TWITTER_API_KEY
    
    if (!apiKey) {
      return { valid: false }
    }

    try {
      const response = await fetch(`${this.API_BASE}/users/me`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "X-User-Token": userToken,
        },
      })

      if (!response.ok) {
        return { valid: false }
      }

      const data = await response.json()
      return {
        valid: true,
        user: {
          id: data.data.id,
          username: data.data.username,
          name: data.data.name,
          profile_image_url: data.data.profile_image_url,
        },
      }
    } catch (error) {
      console.error("Token validation failed:", error)
      return { valid: false }
    }
  }
}
