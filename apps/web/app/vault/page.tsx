"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, AlertCircle, Calendar, Cloud, Lock, Shield } from "lucide-react";
import { EncryptedUpload } from "@/components/vault/encrypted-upload";
import { DigiLockerIntegration } from "@/components/vault/digilocker-integration";
import { apiClient } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "next-auth/react";

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  expiration_date?: string;
  created_at: string;
  storage_type?: "local" | "cloud_r2" | "digilocker";
  encrypted?: boolean;
  cloud_provider?: string;
}

export default function VaultPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string>("IN"); // Default to India for DigiLocker
  const backgroundFetchRef = useRef(false);

  const buildUserHeaders = () => {
    const headers: HeadersInit = {};
    if (session?.user?.id) {
      headers["x-user-id"] = session.user.id;
      if (session.user.email) headers["x-user-email"] = session.user.email;
      if (session.user.name) headers["x-user-name"] = session.user.name;
    }
    return headers;
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDocuments = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cacheKey = 'vault_documents_cache';
        const cacheData = sessionStorage.getItem(cacheKey);
        
        if (cacheData) {
          try {
            const { documents: cachedDocs, timestamp } = JSON.parse(cacheData);
            const cacheAge = Date.now() - timestamp;
            const CACHE_TTL = 30000; // 30 seconds
            
            // Use cached data if it's fresh
            if (cacheAge < CACHE_TTL) {
              setDocuments(cachedDocs);
              setIsLoading(false);
              
              // Only fetch in background if cache is older than 15 seconds (half of TTL)
              // This prevents unnecessary API calls when cache is very fresh
              if (cacheAge > 15000) {
                fetchDocumentsInBackground();
              }
              return;
            }
          } catch (e) {
            // Cache parse error, continue with API call
            console.warn("Cache parse error:", e);
          }
        }
      }

      // Fetch from API
      const response = await apiClient.get<{ status: string; data: Document[] }>("/api/documents", {
        headers: buildUserHeaders(),
      });
      if (response.status === "success") {
        const docs = response.data || [];
        setDocuments(docs);
        
        // Update cache
        const cacheKey = 'vault_documents_cache';
        sessionStorage.setItem(cacheKey, JSON.stringify({
          documents: docs,
          timestamp: Date.now(),
        }));
      } else {
        setError(response.message || "Failed to fetch documents");
      }
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      setError(err.message || "Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };

  // Background fetch to update cache without showing loading state
  const fetchDocumentsInBackground = async () => {
    // Prevent multiple simultaneous background fetches
    if (backgroundFetchRef.current) {
      return;
    }
    
    backgroundFetchRef.current = true;
    
    try {
      const response = await apiClient.get<{ status: string; data: Document[] }>("/api/documents", {
        headers: buildUserHeaders(),
      });
      if (response.status === "success") {
        const docs = response.data || [];
        setDocuments(docs);
        
        // Update cache
        const cacheKey = 'vault_documents_cache';
        sessionStorage.setItem(cacheKey, JSON.stringify({
          documents: docs,
          timestamp: Date.now(),
        }));
      }
    } catch (err) {
      // Silent fail for background fetch
      console.warn("Background fetch failed:", err);
    } finally {
      backgroundFetchRef.current = false;
    }
  };

      const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this document?")) {
          return;
        }

        try {
          await apiClient.delete(`/api/documents/${id}`, { headers: buildUserHeaders() });
          const updatedDocs = documents.filter((doc) => doc.id !== id);
          setDocuments(updatedDocs);
          
          // Update cache
          const cacheKey = 'vault_documents_cache';
          sessionStorage.setItem(cacheKey, JSON.stringify({
            documents: updatedDocs,
            timestamp: Date.now(),
          }));
        } catch (err: any) {
          console.error("Error deleting document:", err);
          alert(err.message || "Failed to delete document");
        }
      };

  const handleDownload = async (document: Document) => {
    try {
      // Check if document is encrypted
      if (document.encrypted) {
        // For encrypted documents, we need to get the encryption key
        const storedKeys = JSON.parse(sessionStorage.getItem("encryption_keys") || "[]");
        const keyData = storedKeys.find((k: any) => k.documentId === document.id);
        
        if (!keyData) {
          const key = prompt(
            "This document is encrypted. Please enter your encryption key:"
          );
          if (!key) {
            return;
          }
          
          // Use the provided key - fetch as blob
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const response = await fetch(
            `${baseUrl}/api/documents/${document.id}/download?encryption_key=${encodeURIComponent(key)}`,
            { headers: buildUserHeaders() }
          );
          
          if (!response.ok) {
            throw new Error("Failed to download file");
          }
          
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", document.file_name);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } else {
          // Use stored key
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const response = await fetch(
            `${baseUrl}/api/documents/${document.id}/download?encryption_key=${encodeURIComponent(keyData.key)}`,
            { headers: buildUserHeaders() }
          );
          
          if (!response.ok) {
            throw new Error("Failed to download file");
          }
          
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", document.file_name);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        }
      } else {
        // Regular download
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(
          `${baseUrl}/api/documents/${document.id}/download`,
          { headers: buildUserHeaders() }
        );
        
        if (!response.ok) {
          throw new Error("Failed to download file");
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", document.file_name);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error("Error downloading document:", err);
      alert(err.response?.data?.message || "Failed to download document");
    }
  };

  const isExpiringSoon = (expirationDate: string) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const getStorageBadge = (document: Document) => {
    if (document.storage_type === "cloud_r2") {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Cloud className="h-3 w-3" />
          Cloud
        </Badge>
      );
    }
    if (document.storage_type === "digilocker") {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          DigiLocker
        </Badge>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Document Vault</h1>
          <p className="text-muted-foreground text-lg">
            Securely store and manage your important documents with encryption and cloud storage
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        <EncryptedUpload onUploadSuccess={() => fetchDocuments(true)} />

        {/* DigiLocker Integration (for Indian students) - Collapsible Card */}
        {countryCode === "IN" && <DigiLockerIntegration />}

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              Manage your stored documents and track expiration dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading documents...</p>
              </div>
            ) : documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold">{doc.file_name}</h3>
                          <Badge variant="secondary">{doc.document_type}</Badge>
                          {getStorageBadge(doc)}
                          {doc.encrypted && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Encrypted
                            </Badge>
                          )}
                          {doc.expiration_date && isExpiringSoon(doc.expiration_date) && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          {doc.expiration_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Expires: {new Date(doc.expiration_date).toLocaleDateString()}
                            </span>
                          )}
                          <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                          {doc.cloud_provider && (
                            <span className="flex items-center gap-1">
                              <Cloud className="h-4 w-4" />
                              {doc.cloud_provider}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
                <p className="text-muted-foreground">
                  Upload your first document to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
