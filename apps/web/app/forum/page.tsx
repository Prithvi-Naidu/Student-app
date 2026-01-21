"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, ThumbsUp, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

export default function ForumPage() {
  const { data: session } = useSession();
  const categories = ["Housing", "Finance", "General", "Academic"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState(categories[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildUserHeaders = () => {
    const headers: HeadersInit = {};
    if (session?.user?.id) {
      headers["x-user-id"] = session.user.id;
      if (session.user.email) headers["x-user-email"] = session.user.email;
      if (session.user.name) headers["x-user-name"] = session.user.name;
    }
    return headers;
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    return params.toString();
  }, [selectedCategory, searchQuery]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = `/api/forum/posts${queryParams ? `?${queryParams}` : ""}`;
      const response = await apiClient.get<{ status: string; data: any[] }>(endpoint, {
        headers: buildUserHeaders(),
      });
      if (response.status === "success") {
        setPosts(response.data || []);
      } else {
        setError("Failed to fetch posts");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await apiClient.get<{ status: string; data: any[] }>(
        "/api/forum/notifications",
        { headers: buildUserHeaders() }
      );
      if (response.status === "success") {
        setNotifications(response.data || []);
      }
    } catch (err) {
      // Silent fail for notifications
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiClient.post(`/api/forum/notifications/${id}/read`, {}, { headers: buildUserHeaders() });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      // Silent fail
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setError("Title and content are required");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.post<{ status: string; data: any }>(
        "/api/forum/posts",
        {
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          category: newPostCategory,
        },
        { headers: buildUserHeaders() }
      );
      if (response.status === "success") {
        setShowNewPost(false);
        setNewPostTitle("");
        setNewPostContent("");
        fetchPosts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (postId: string, value: 1 | -1) => {
    try {
      await apiClient.post(
        `/api/forum/posts/${postId}/vote`,
        { value },
        { headers: buildUserHeaders() }
      );
      fetchPosts();
    } catch (err: any) {
      setError(err.message || "Failed to vote");
    }
  };

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
          <Button onClick={() => setShowNewPost((prev) => !prev)}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <Card>
            <CardHeader>
              <CardTitle>Create a Post</CardTitle>
              <CardDescription>
                Share a question or experience with the community.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session?.user?.id && (
                <p className="text-sm text-muted-foreground">
                  You must be signed in to post.
                </p>
              )}
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Post title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  disabled={!session?.user?.id || isSubmitting}
                />
                <div className="flex gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={newPostCategory === cat ? "default" : "outline"}
                      onClick={() => setNewPostCategory(cat)}
                      disabled={!session?.user?.id || isSubmitting}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <textarea
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Write your post..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                disabled={!session?.user?.id || isSubmitting}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewPost(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={!session?.user?.id || isSubmitting}
                >
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
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

        {/* Posts List */}
        <div className="space-y-4">
          {isLoading && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Loading posts...
              </CardContent>
            </Card>
          )}
          {!isLoading && posts.map((post) => (
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleVote(post.id, 1)}
                      disabled={!session?.user?.id}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {post.upvotes || 0}
                    </Button>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.comment_count || 0} comments
                    </div>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
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
        {!isLoading && posts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to start a discussion
              </p>
              <Button onClick={() => setShowNewPost(true)}>Create Post</Button>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        {session?.user?.id && notifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Recent replies and mentions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.map((note) => (
                <div key={note.id} className="flex items-center justify-between text-sm">
                  <span>{note.message || "New activity"}</span>
                  <Button variant="ghost" size="sm" onClick={() => markNotificationRead(note.id)}>
                    Mark read
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {error && (
          <Card>
            <CardContent className="py-4 text-center text-destructive">
              {error}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

