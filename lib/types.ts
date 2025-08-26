export interface User {
  fid?: number
  username?: string
  displayName?: string
  avatar?: string
  twitterConnected: boolean
  walletAddress?: string
}

export interface PostOptions {
  farcaster: boolean
  twitter: boolean
}

export interface PostData {
  content: string
  options: PostOptions
}

export interface AppState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  amount: string
}
