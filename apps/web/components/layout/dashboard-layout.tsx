import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

