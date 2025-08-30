"use client";

import type React from "react";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  // const { user, isLoading, error, refetch } = useAuth()
  const { user, isLoading, error } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Connecting to Farcaster...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="text-destructive mb-4">Authentication Error</div>
            <p className="text-muted-foreground mb-4 text-center">{error}</p>
            <Button variant="outline">
              {/* <Button onClick={refetch} variant="outline"></Button> */}
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="text-foreground mb-4 font-semibold">
              Welcome to Farcaster Mini-App
            </div>
            <p className="text-muted-foreground mb-4 text-center">
              Please connect your Farcaster account to continue
            </p>
            <Button className="w-full">
              {/* <Button onClick={refetch} className="w-full"></Button> */}
              Connect Farcaster
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
