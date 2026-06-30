"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasskeyButton } from "@/components/auth/social-buttons";
import { toast } from "sonner";
import { LogOut, User } from "lucide-react";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  async function handleSignOut() {
    await signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
  }

  async function listPasskeys() {
    const keys = await authClient.passkey.listUserPasskeys();
    toast.info(`You have ${keys.data?.length ?? 0} passkey(s) registered`);
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
            <CardDescription>Signed in account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {session.user.name}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {session.user.email}
            </p>
            <p>
              <span className="font-medium">Email verified:</span>{" "}
              {session.user.emailVerified ? "✅ Yes" : "❌ No"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passkeys</CardTitle>
            <CardDescription>
              Manage passwordless sign-in with biometrics or hardware keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <PasskeyButton mode="register" />
            <Button variant="ghost" className="w-full" onClick={listPasskeys}>
              Check registered passkeys
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
