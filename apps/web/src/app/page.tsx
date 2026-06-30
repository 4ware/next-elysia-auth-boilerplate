import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">Welcome to MyApp</h1>
      <p className="text-muted-foreground">A modern full-stack starter</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth/register">Create Account</Link>
        </Button>
      </div>
    </main>
  );
}
