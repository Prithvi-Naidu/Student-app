"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Bookmark, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ArticleSidebarProps {
  article: {
    id: string;
    title: string;
    category: string;
    tags?: string[] | null;
  };
}

export function ArticleSidebar({ article }: ArticleSidebarProps) {
  const [tableOfContents, setTableOfContents] = useState<Array<{ id: string; text: string; level: number }>>([]);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    // Extract headings from the article content for TOC
    const headings = Array.from(document.querySelectorAll("article h2, article h3"));
    const toc = headings.map((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      return {
        id,
        text: heading.textContent || "",
        level: heading.tagName === "H2" ? 2 : 3,
      };
    });
    setTableOfContents(toc);

    // Intersection Observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `Check out this article: ${article.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <aside className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="outline" className="w-full">
        <Link href="/banking">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Banking
        </Link>
      </Button>

      {/* Table of Contents */}
      {tableOfContents.length > 0 && (
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="space-y-1">
              {tableOfContents.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`
                    block text-sm transition-colors py-1 px-2 rounded
                    ${item.level === 3 ? "pl-6" : ""}
                    ${
                      activeSection === item.id
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full justify-start"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Article
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="w-full justify-start"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Article
          </Button>
        </CardContent>
      </Card>

      {/* Related Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Related Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link
              href="/banking/building-credit-international-student"
              className="block text-sm hover:text-primary transition-colors p-2 rounded hover:bg-muted"
            >
              Building Credit as an International Student
            </Link>
            <Link
              href="/banking/student-budgeting-101"
              className="block text-sm hover:text-primary transition-colors p-2 rounded hover:bg-muted"
            >
              Student Budgeting 101
            </Link>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
