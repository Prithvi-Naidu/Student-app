import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const res = await fetch(`${baseUrl}/api/banking/resources/${encodeURIComponent(slug)}`, {
    // Banking content changes rarely; cache lightly in dev.
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch resource");

  const json = (await res.json()) as { status: string; data: BankingResource };
  return json.data;
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
            <Link href="/banking" className="text-primary hover:underline">
              Back to Banking
            </Link>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <Link href="/banking" className="hover:underline">
              Banking
            </Link>
            <span> / </span>
            <span>Article</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight">{resource.title}</h1>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{resource.category}</Badge>
            {resource.resource_type && <Badge variant="outline">{resource.resource_type}</Badge>}
            {resource.last_verified && (
              <Badge variant="outline">Last verified: {resource.last_verified}</Badge>
            )}
          </div>

          {resource.summary && (
            <p className="text-lg text-muted-foreground">{resource.summary}</p>
          )}
        </div>

        <Card>
          <CardContent className="py-8">
            {/* Content is curated by us and stored as safe HTML for now */}
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: resource.content }}
            />
          </CardContent>
        </Card>

        {Array.isArray(resource.source_urls) && resource.source_urls.length > 0 && (
          <Card>
            <CardContent className="py-6 space-y-3">
              <h2 className="text-xl font-semibold">Official source links</h2>
              <ul className="list-disc pl-5 space-y-1">
                {resource.source_urls.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      className="text-primary hover:underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">
                Policies can vary by bank and branch. Always confirm requirements with the bank
                before visiting.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}


