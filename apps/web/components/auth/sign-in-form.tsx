"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Github, Apple, Building2 } from "lucide-react";

export function SignInForm() {
  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Get Started</CardTitle>
        <CardDescription className="text-center">
          Create your account or sign in using one of the options below. No password needed!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn("google")}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn("github")}
        >
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn("apple")}
        >
          <Apple className="mr-2 h-4 w-4" />
          Continue with Apple
        </Button>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn("azure-ad")}
        >
          <Building2 className="mr-2 h-4 w-4" />
          Continue with Microsoft
        </Button>
      </CardContent>
    </Card>
  );
}

