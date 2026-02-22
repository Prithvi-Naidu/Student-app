import { cache } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { BankingResourcesList } from "@/components/banking/banking-resources-list";

type BankingResourceListItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  resource_type: string;
  tags: string[] | null;
  summary?: string | null;
  content?: string;
  updated_at: string;
};

const fetchResources = cache(async (): Promise<BankingResourceListItem[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${baseUrl}/api/banking/resources`, { 
      cache: "no-store",
      next: { revalidate: 0 }
    });
    if (!res.ok) {
      console.error('API error:', res.status, res.statusText);
      return [];
    }
    const json = (await res.json()) as { status: string; data: any[] };
    if (json.status === 'success' && json.data) {
      return json.data.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        category: r.category,
        resource_type: r.resource_type,
        tags: r.tags ?? null,
        summary: r.summary ?? null,
        content: r.content,
        updated_at: r.updated_at,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching banking resources:', error);
    return [];
  }
});

export default async function BankingPage() {
  const resources = await fetchResources();

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

        {/* Resources List with Filters */}
        <BankingResourcesList resources={resources} />

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

