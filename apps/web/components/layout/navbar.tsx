"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Home, Menu, X } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Home className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            OneStop Student Ecosystem
          </span>
          <span className="font-bold sm:hidden">OSE</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-center space-x-6 text-sm font-medium">
          <Link
            href="/housing"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Housing
          </Link>
          <Link
            href="/forum"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Forum
          </Link>
          <Link
            href="/roommates"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Roommates
          </Link>
          <Link
            href="/banking"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Banking
          </Link>
          <Link
            href="/vault"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Vault
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <UserMenu />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signin">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-4">
            <Link
              href="/housing"
              className="block text-sm font-medium transition-colors hover:text-foreground/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Housing
            </Link>
            <Link
              href="/forum"
              className="block text-sm font-medium transition-colors hover:text-foreground/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Forum
            </Link>
            <Link
              href="/roommates"
              className="block text-sm font-medium transition-colors hover:text-foreground/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Roommates
            </Link>
            <Link
              href="/banking"
              className="block text-sm font-medium transition-colors hover:text-foreground/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Banking
            </Link>
            <Link
              href="/vault"
              className="block text-sm font-medium transition-colors hover:text-foreground/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Document Vault
            </Link>
            <div className="flex flex-col space-y-2 pt-4 border-t">
              {session ? (
                <UserMenu />
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

