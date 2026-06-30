"use client";
import { useState } from "react";
import { signIn, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Fingerprint, Loader2 } from "lucide-react";

export function GoogleButton() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await signIn.social({ provider: "google", callbackURL: "/dashboard" });
        setLoading(false);
      }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      Continue with Google
    </Button>
  );
}

export function AppleButton() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await signIn.social({ provider: "apple", callbackURL: "/dashboard" });
        setLoading(false);
      }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <svg className="h-4 w-4" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.5-57.8-155.5-127.4C46 482.1 1 301.5 1 143.7c0-88.4 30.5-175.8 85.5-240.6C143.8 35.6 233.5 0 325.5 0c95.2 0 162.1 57 219.5 57 54.8 0 132.8-59.7 238.9-59.7zM545.5 40.8c-29.6 12.8-80.5 40.8-80.5 113.1 0 72.6 55.3 139.6 133.2 155.7-11.5 4.9-34.8 12.9-60.7 12.9-89.5 0-163-59.7-215.5-59.7-59.5 0-134.1 37-215.5 37-28.5 0-57-.9-57-.9"/>
        </svg>
      )}
      Continue with Apple
    </Button>
  );
}

export function PasskeyButton({ mode }: { mode: "sign-in" | "register" }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          if (mode === "sign-in") {
            await authClient.signIn.passkey();
          } else {
            await authClient.passkey.addPasskey();
          }
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
      {mode === "sign-in" ? "Sign in with Passkey" : "Add Passkey"}
    </Button>
  );
}
