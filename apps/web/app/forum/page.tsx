import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, ThumbsUp, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function ForumPage() {
  const categories = ["Housing", "Finance", "General", "Academic"];
  const selectedCategory = "All";

  // Sample posts - will be replaced with API data
  const samplePosts = [
    {
      id: "1",
      category: "Housing",
      title: "Best areas to live near ASU?",
      content: "I'm starting at ASU in the fall and looking for recommendations...",
      upvotes: 12,
      commentCount: 5,
      createdAt: "2 hours ago",
    },
    {
      id: "2",
      category: "Finance",
      title: "How to open a bank account without SSN?",
      content: "New student here. Can anyone share their experience...",
      upvotes: 8,
      commentCount: 3,
      createdAt: "5 hours ago",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Community Forum</h1>
            <p className="text-muted-foreground text-lg">
              Ask questions, share experiences, and connect with fellow students
            </p>
          </div>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search posts..." className="pl-10" />
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

        {/* Posts List */}
        <div className="space-y-4">
          {samplePosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">
                      <Link href={`/forum/${post.id}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {post.content}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {post.upvotes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.commentCount} comments
                    </div>
                    <span>{post.createdAt}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/forum/${post.id}`}>Read More</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {samplePosts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to start a discussion
              </p>
              <Button>Create Post</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

