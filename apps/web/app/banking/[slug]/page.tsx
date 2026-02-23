import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Share2, ExternalLink, ArrowLeft, CheckCircle2, AlertCircle, Info, BookOpen } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ArticleContent } from "@/components/banking/enhanced-article-content";
import { ArticleSidebar } from "@/components/banking/article-sidebar-enhanced";
import { ArticleFooter } from "@/components/banking/article-footer-enhanced";
import { RequiredDocumentsChecklist } from "@/components/banking/required-documents-checklist";

type BankingResource = {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  resource_type: string;
  tags: string[] | null;
  video_url: string | null;
  summary: string | null;
  source_urls: string[] | null;
  last_verified: string | null;
  created_at: string;
  updated_at: string;
};

async function fetchResource(slug: string): Promise<BankingResource | null> {
  const baseUrl = typeof process.env.NEXT_PUBLIC_API_URL === "string" ? process.env.NEXT_PUBLIC_API_URL : "http://localhost:4000";
  const res = await fetch(`${baseUrl}/api/banking/resources/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch resource");

  const json = (await res.json()) as { status: string; data: BankingResource };
  return json.data;
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export default async function BankingArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await fetchResource(slug);

  if (!resource) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <h1 className="text-2xl font-semibold mb-2">Article not found</h1>
            <p className="text-muted-foreground mb-6">
              This banking resource doesn&apos;t exist (or is no longer published).
            </p>
            <Button asChild>
              <Link href="/banking">Back to Banking</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const readingTime = calculateReadingTime(resource.content);
  const sourceUrls = resource.source_urls || [
    'https://www.chase.com/personal/banking/checking/college-checking-account',
    'https://www.bankofamerica.com/deposits/checking/advantage-banking/',
    'https://www.wellsfargo.com/checking/',
    'https://i94.cbp.gov'
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Link href="/banking" className="hover:text-foreground transition-colors">
              Banking
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{resource.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Article Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">{resource.category}</Badge>
                {resource.resource_type && (
                  <Badge variant="outline" className="text-sm capitalize">
                    {resource.resource_type}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                {resource.title}
              </h1>

              {resource.summary && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {resource.summary}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {resource.updated_at 
                      ? `Updated ${format(new Date(resource.updated_at), "MMMM d, yyyy")}`
                      : `Published ${format(new Date(resource.created_at), "MMMM d, yyyy")}`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
                {resource.last_verified && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Verified {format(new Date(resource.last_verified), "MMM yyyy")}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {resource.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="space-y-6">
              {/* Show introduction paragraph first */}
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed text-foreground">
                  As an international student arriving in the United States, opening a bank account is one of your first priorities. However, many students worry about not having a Social Security Number (SSN). The good news is that you can absolutely open a bank account without an SSN! This comprehensive guide will walk you through everything you need to know.
                </p>
              </div>

              {/* Rest of Article Content */}
              <ArticleContent 
                content={resource.content} 
                showChecklist={resource.slug === 'how-to-open-bank-account-without-ssn'}
              />
            </div>

            {/* Article Footer */}
            <ArticleFooter 
              article={resource}
              sourceUrls={sourceUrls}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ArticleSidebar article={resource} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await fetchResource(slug);
  
  if (!resource) {
    return {
      title: "Article Not Found | OneStop Student Ecosystem",
    };
  }

  return {
    title: `${resource.title} | OneStop Student Ecosystem`,
    description: resource.summary || resource.content.substring(0, 160).replace(/<[^>]*>/g, '') + "...",
  };
}
