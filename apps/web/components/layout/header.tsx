import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Home className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            OneStop Student Ecosystem
          </span>
          <span className="font-bold sm:hidden">OSE</span>
        </Link>
        <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
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
            href="/banking"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Banking
          </Link>
          <Link
            href="/vault"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Document Vault
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button size="sm">Get Started</Button>
        </div>
      </div>
    </header>
  );
}

