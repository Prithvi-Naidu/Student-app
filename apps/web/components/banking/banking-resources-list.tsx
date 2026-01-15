"use client";

import { useState, useMemo } from "react";
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
  summary?: string | null;
  content?: string;
  updated_at: string;
};

interface BankingResourcesListProps {
  resources: BankingResourceListItem[];
}

// Utility function to strip HTML tags and get plain text
function stripHtmlTags(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export function BankingResourcesList({ resources }: BankingResourcesListProps) {
  const categories = ["Banking", "Credit", "Budgeting", "Financial Planning"];
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Filter resources based on selected category and search query
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Category filter
      const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
      
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        resource.title.toLowerCase().includes(searchLower) ||
        stripHtmlTags(resource.summary).toLowerCase().includes(searchLower) ||
        stripHtmlTags(resource.content).toLowerCase().includes(searchLower) ||
        (resource.tags || []).some(tag => tag.toLowerCase().includes(searchLower));

      return matchesCategory && matchesSearch;
    });
  }, [resources, selectedCategory, searchQuery]);

  return (
    <>
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                onClick={() => setSelectedCategory("All")}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
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
                  {resource.summary
                    ? stripHtmlTags(resource.summary)
                    : resource.content
                      ? stripHtmlTags(resource.content).substring(0, 150) + "..."
                      : "Open this resource to read the full guide."}
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
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchQuery || selectedCategory !== "All"
                ? "No resources found matching your criteria. Try adjusting your filters."
                : "No resources available at the moment. Please check back later."}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
