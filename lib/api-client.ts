export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  error?: string
  platform?: string
  data?: T
  timestamp?: string
}

export class ApiClient {
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          platform: data.platform,
        }
      }

      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  static async postToFarcaster(content: string, signerUuid?: string): Promise<ApiResponse> {
    return this.makeRequest("/api/farcaster/post", {
      method: "POST",
      body: JSON.stringify({ content }),
      headers: signerUuid ? { "x-signer-uuid": signerUuid } : {},
    })
  }

  static async postToTwitter(content: string): Promise<ApiResponse> {
    // Get the stored Twitter user token from localStorage
    const twitterUser = JSON.parse(localStorage.getItem("twitter_user") || "null")
    const userToken = twitterUser?.access_token
    
    if (!userToken) {
      return {
        success: false,
        error: "Twitter account not connected",
        platform: "twitter",
      }
    }

    return this.makeRequest("/api/twitter/post", {
      method: "POST",
      body: JSON.stringify({ content }),
      headers: { "x-twitter-token": userToken },
    })
  }

  static async checkHealth(): Promise<ApiResponse> {
    return this.makeRequest("/api/health")
  }
}
