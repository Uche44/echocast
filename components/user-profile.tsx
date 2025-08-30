"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Twitter, Wallet, LogOut } from "lucide-react";

export function UserProfile() {
  // const { user, connectTwitter, disconnectTwitter, signOut } = useAuth()
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={user.avatar || "/placeholder.svg"}
              alt={user.displayName}
            />
            <AvatarFallback>
              {user.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              {user.displayName}
            </h3>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            <span className="text-sm">Twitter</span>
          </div>
          {user.twitterConnected ? (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-xs"
              >
                Connected
              </Badge>
              {/* <Button variant="outline" size="sm" onClick={disconnectTwitter}> */}
              <Button
                variant="outline"
                size="sm"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <a href="/api/twitter">
              <Button
                variant="outline"
                size="sm"
              >
                Connect
              </Button>
            </a>
          )}
        </div>

        {user.walletAddress && (
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-mono text-muted-foreground">
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          // onClick={signOut}
          className="w-full bg-transparent"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}
