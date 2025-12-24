import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreditCard, BookOpen, Video, Search, ExternalLink } from "lucide-react";
import Link from "next/link";

type BankingResourceListItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  resource_type: string;
  tags: string[] | null;
  summary: string | null;
  updated_at: string;
};

async function fetchResources(): Promise<BankingResourceListItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const res = await fetch(`${baseUrl}/api/banking/resources`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = (await res.json()) as { status: string; data: any[] };
  return (json.data || []).map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    category: r.category,
    resource_type: r.resource_type,
    tags: r.tags ?? null,
    summary: r.summary ?? null,
    updated_at: r.updated_at,
  }));
}

export default async function BankingPage() {
  const categories = ["Banking", "Credit", "Budgeting", "Financial Planning"];
  const selectedCategory = "All";
  const resources = await fetchResources();

  // Sample resources - will be replaced with API data
  const sampleResources: BankingResourceListItem[] = resources;

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "guide":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Banking & Financial Guidance</h1>
          <p className="text-muted-foreground text-lg">
            Expert resources to help you navigate U.S. banking and finances
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search resources..." className="pl-10" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant={selectedCategory === "All" ? "default" : "outline"}>
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-primary">
                    {getResourceIcon(resource.resource_type)}
                  </div>
                  <Badge variant="secondary">{resource.category}</Badge>
                </div>
                <CardTitle className="text-xl">{resource.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {resource.summary ?? "Open this resource to read the full guide."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(resource.tags ?? []).slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/banking/${resource.slug}`}>
                    Read More
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Partner Banks Section */}
        <Card>
          <CardHeader>
            <CardTitle>Partner Banks</CardTitle>
            <CardDescription>
              Banks that offer special accounts for international students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Chase College Checking</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No monthly service fee for college students
                </p>
                <Button asChild variant="outline" size="sm">
                  <a
                    href="https://www.chase.com/personal/checking/student-checking"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn More <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Bank of America Advantage</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Student-friendly accounts with easy requirements
                </p>
                <Button asChild variant="outline" size="sm">
                  <a
                    href="https://www.bankofamerica.com/deposits/checking/advantage-banking/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn More <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

