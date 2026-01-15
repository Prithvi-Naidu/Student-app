import { SignInForm } from "@/components/auth/sign-in-form";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to OneStop</h1>
          <p className="text-muted-foreground">
            Sign in or create your account using one of the options below
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}

