export interface MinikitConfig {
  appName: string
  appIcon: string
  appUrl: string
}

export const MINIKIT_CONFIG: MinikitConfig = {
  appName: "EchoCast",
  appIcon: "/icon-192x192.png",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
}

export interface PaymentRequest {
  amount: string
  currency: "ETH" | "USDC"
  recipient: string
  description: string
}

export class MinikitService {
  static async initializeWallet() {
    if (typeof window === "undefined") return null

    try {
      // Initialize Base Minikit wallet connection
      const { ethereum } = window as any
      if (!ethereum) {
        throw new Error("Base wallet not found")
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
      return accounts[0]
    } catch (error) {
      console.error("Failed to initialize wallet:", error)
      return null
    }
  }

  static async requestPayment(paymentRequest: PaymentRequest): Promise<boolean> {
    try {
      // Mock payment implementation - replace with actual Base Minikit payment flow
      console.log("Processing payment:", paymentRequest)

      // Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For now, randomly succeed/fail for demo purposes
      return Math.random() > 0.2 // 80% success rate
    } catch (error) {
      console.error("Payment failed:", error)
      return false
    }
  }

  static async signMessage(message: string): Promise<string | null> {
    try {
      const { ethereum } = window as any
      if (!ethereum) return null

      const accounts = await ethereum.request({ method: "eth_accounts" })
      if (accounts.length === 0) return null

      const signature = await ethereum.request({
        method: "personal_sign",
        params: [message, accounts[0]],
      })

      return signature
    } catch (error) {
      console.error("Failed to sign message:", error)
      return null
    }
  }
}
