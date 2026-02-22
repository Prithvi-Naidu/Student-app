"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ThumbsUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  created_at: string;
  status?: string;
  user_id?: string | null;
}

interface ForumComment {
  id: string;
  post_id: string;
  parent_id?: string | null;
  content: string;
  upvotes: number;
  created_at: string;
  user_id?: string | null;
}

interface CommentNode extends ForumComment {
  replies: CommentNode[];
}

export default function ForumPostPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const buildUserHeaders = () => {
    const headers: HeadersInit = {};
    if (session?.user?.id) {
      headers["x-user-id"] = session.user.id;
      if (session.user.email) headers["x-user-email"] = session.user.email;
      if (session.user.name) headers["x-user-name"] = session.user.name;
    }
    return headers;
  };

  const fetchPost = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<{ status: string; data: any }>(`/api/forum/posts/${params.id}`, {
        headers: buildUserHeaders(),
        signal,
      });
      if (response.status === "success") {
        setPost(response.data);
        setComments(response.data.comments || []);
        setEditTitle(response.data.title || "");
        setEditContent(response.data.content || "");
      } else {
        setError("Failed to fetch post");
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to fetch post");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchPost(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleComment = async () => {
    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.post(
        `/api/forum/posts/${params.id}/comments`,
        {
          content: newComment.trim(),
          parent_id: replyTo,
        },
        { headers: buildUserHeaders() }
      );
      setNewComment("");
      setReplyTo(null);
      fetchPost();
    } catch (err: any) {
      setError(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (value: 1 | -1) => {
    try {
      await apiClient.post(
        `/api/forum/posts/${params.id}/vote`,
        { value },
        { headers: buildUserHeaders() }
      );
      fetchPost();
    } catch (err: any) {
      setError(err.message || "Failed to vote");
    }
  };

  const handleUpdatePost = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setError("Title and content are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.put(
        `/api/forum/posts/${params.id}`,
        { title: editTitle.trim(), content: editContent.trim() },
        { headers: buildUserHeaders() }
      );
      setIsEditing(false);
      fetchPost();
    } catch (err: any) {
      setError(err.message || "Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Delete this post?")) return;
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/api/forum/posts/${params.id}`, { headers: buildUserHeaders() });
      window.location.href = "/forum";
    } catch (err: any) {
      setError(err.message || "Failed to delete post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLockToggle = async () => {
    if (!post) return;
    const action = post.status === "locked" ? "unlock" : "lock";
    try {
      await apiClient.post(
        `/api/forum/posts/${params.id}/${action}`,
        {},
        { headers: buildUserHeaders() }
      );
      fetchPost();
    } catch (err: any) {
      setError(err.message || "Failed to update post status");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await apiClient.delete(`/api/forum/comments/${commentId}`, { headers: buildUserHeaders() });
      fetchPost();
    } catch (err: any) {
      setError(err.message || "Failed to delete comment");
    }
  };

  const handleCommentVote = async (commentId: string, value: 1 | -1) => {
    try {
      await apiClient.post(
        `/api/forum/comments/${commentId}/vote`,
        { value },
        { headers: buildUserHeaders() }
      );
      fetchPost();
    } catch (err: any) {
      setError(err.message || "Failed to vote");
    }
  };

  const commentTree = useMemo(() => {
    const map = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];
    comments.forEach((comment) => {
      map.set(comment.id, { ...comment, replies: [] });
    });
    map.forEach((node) => {
      if (node.parent_id) {
        const parent = map.get(node.parent_id);
        if (parent) parent.replies.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [comments]);

  const renderComments = (nodes: CommentNode[], depth = 0) => {
    return nodes.map((comment) => (
      <div key={comment.id} className={`border-l pl-4 ${depth > 0 ? "mt-3" : ""}`}>
        <div className="text-sm text-muted-foreground mb-1">
          {new Date(comment.created_at).toLocaleString()}
        </div>
        <div className="text-sm mb-2">{comment.content}</div>
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCommentVote(comment.id, 1)}
            disabled={!session?.user?.id}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {comment.upvotes || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyTo(comment.id)}
            disabled={!session?.user?.id}
          >
            Reply
          </Button>
          {session?.user?.id && comment.user_id === session.user.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteComment(comment.id)}
            >
              Delete
            </Button>
          )}
        </div>
        {comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">{renderComments(comment.replies, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/forum">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Forum
            </Link>
          </Button>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Loading post...
            </CardContent>
          </Card>
        )}

        {post && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{post.category}</Badge>
                {post.status === "locked" && <Badge variant="outline">Locked</Badge>}
              </div>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                Posted on {new Date(post.created_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdatePost} disabled={isSubmitting}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mb-4">{post.content}</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(1)}
                disabled={!session?.user?.id}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {post.upvotes || 0}
              </Button>
              {session?.user?.id && post.user_id === session.user.id && !isEditing && (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button variant="outline" onClick={handleDeletePost} disabled={isSubmitting}>
                    Delete
                  </Button>
                </div>
              )}
              {session?.user?.id && (
                <div className="mt-4">
                  <Button variant="outline" onClick={handleLockToggle}>
                    {post.status === "locked" ? "Unlock Post" : "Lock Post"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>
              Join the discussion. Replies are threaded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!session?.user?.id && (
              <p className="text-sm text-muted-foreground">
                Sign in to comment or vote.
              </p>
            )}
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!session?.user?.id || isSubmitting}
            />
            {replyTo && (
              <div className="text-xs text-muted-foreground">
                Replying to a comment.
                <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                  Cancel reply
                </Button>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={handleComment} disabled={!session?.user?.id || isSubmitting}>
                <MessageCircle className="h-4 w-4 mr-1" />
                Post Comment
              </Button>
            </div>
            {commentTree.length > 0 ? (
              <div className="space-y-4">{renderComments(commentTree)}</div>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </CardContent>
        </Card>

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
