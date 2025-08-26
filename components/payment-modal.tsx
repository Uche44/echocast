"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MinikitService } from "@/lib/minikit"
import { Loader2, CreditCard, Zap, MessageSquare, Twitter, CheckCircle, XCircle } from "lucide-react"
import type { PostOptions } from "@/lib/types"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  content: string
  options: PostOptions
}

export function PaymentModal({ isOpen, onClose, onPaymentSuccess, content, options }: PaymentModalProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")

  const postingFee = "0.001" // ETH
  const platformCount = (options.farcaster ? 1 : 0) + (options.twitter ? 1 : 0)
  const totalFee = (Number.parseFloat(postingFee) * platformCount).toFixed(3)

  const handlePayment = async () => {
    try {
      setIsProcessing(true)
      setPaymentStatus("processing")

      const paymentRequest = {
        amount: totalFee,
        currency: "ETH" as const,
        recipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Mock recipient address
        description: `Post to ${options.farcaster && options.twitter ? "Farcaster & Twitter" : options.farcaster ? "Farcaster" : "Twitter"}`,
      }

      const success = await MinikitService.requestPayment(paymentRequest)

      if (success) {
        setPaymentStatus("success")
        toast({
          title: "Payment Successful",
          description: "Your post will be published shortly",
        })

        // Wait a moment to show success state
        setTimeout(() => {
          onPaymentSuccess()
          onClose()
          setPaymentStatus("idle")
        }, 1500)
      } else {
        setPaymentStatus("failed")
        toast({
          title: "Payment Failed",
          description: "Please try again or check your wallet",
          variant: "destructive",
        })
      }
    } catch (error) {
      setPaymentStatus("failed")
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
      setPaymentStatus("idle")
    }
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "processing":
        return <Loader2 className="h-6 w-6 animate-spin text-primary" />
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "failed":
        return <XCircle className="h-6 w-6 text-destructive" />
      default:
        return <CreditCard className="h-6 w-6 text-primary" />
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "processing":
        return "Processing payment..."
      case "success":
        return "Payment successful! Publishing post..."
      case "failed":
        return "Payment failed. Please try again."
      default:
        return "Complete payment to publish your post"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Payment Required
          </DialogTitle>
          <DialogDescription>{getStatusMessage()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Publishing to:</span>
                  <div className="flex gap-1">
                    {options.farcaster && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Farcaster
                      </Badge>
                    )}
                    {options.twitter && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Twitter className="h-3 w-3" />
                        Twitter
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {content.length > 100 ? `${content.substring(0, 100)}...` : content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Base posting fee:</span>
                  <span className="text-sm font-mono">{postingFee} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Platforms ({platformCount}):</span>
                  <span className="text-sm">×{platformCount}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="font-mono font-medium">{totalFee} ETH</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing || paymentStatus === "success"} className="flex-1">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : paymentStatus === "success" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Success
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Pay & Post
                </>
              )}
            </Button>
          </div>

          {/* Base Minikit Info */}
          <div className="text-xs text-muted-foreground text-center">
            <p>Powered by Base Minikit • Secure on-chain payments</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
