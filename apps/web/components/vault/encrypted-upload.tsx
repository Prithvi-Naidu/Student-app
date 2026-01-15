"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Loader2, Shield, Cloud, Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { encryptFile, generateEncryptionKey, uint8ArrayToHex } from "@/lib/encryption-client";
import { apiClient } from "@/lib/api";

interface EncryptedUploadProps {
  onUploadSuccess?: () => void;
}

export function EncryptedUpload({ onUploadSuccess }: EncryptedUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [useEncryption, setUseEncryption] = useState(false);
  const [useCloudStorage, setUseCloudStorage] = useState(true); // Default to cloud storage
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const documentTypes = ["I-20", "Passport", "Visa", "Transcript", "Insurance", "Other"];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleEncryptionToggle = async (checked: boolean) => {
    setUseEncryption(checked);
    if (checked) {
      // Generate encryption key when encryption is enabled
      try {
        const key = await generateEncryptionKey();
        setEncryptionKey(key);
      } catch (err) {
        setError("Failed to generate encryption key");
        setUseEncryption(false);
      }
    } else {
      setEncryptionKey(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      setError("Please select a file and document type");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      
      let fileToUpload = selectedFile;
      
      // Encrypt file if encryption is enabled
      if (useEncryption && encryptionKey) {
        setUploadProgress(25);
        const encrypted = await encryptFile(selectedFile, encryptionKey);
        fileToUpload = encrypted.encryptedFile;
        
        // Store encryption metadata (IV and tag) in metadata field
        // Note: For client-side encryption, the key should be stored client-side
        // The server will receive the encrypted file and metadata
        const encryptionMetadata = {
          iv: uint8ArrayToHex(encrypted.iv),
          tag: uint8ArrayToHex(encrypted.tag),
          encrypted: true,
          originalFileName: selectedFile.name,
          originalMimeType: selectedFile.type,
        };
        
        formData.append("metadata", JSON.stringify(encryptionMetadata));
      }
      
      formData.append("file", fileToUpload);
      formData.append("document_type", documentType);
      formData.append("use_cloud_storage", useCloudStorage ? "true" : "false");
      formData.append("encrypt", useEncryption ? "true" : "false");
      
      if (expirationDate) {
        formData.append("expiration_date", expirationDate);
      }

      setUploadProgress(50);

      // Upload to API (FormData will be handled automatically)
      const response = await apiClient.post<{ status: string; data: { id: string } }>("/api/documents", formData);

      setUploadProgress(100);

      if (response.status === "success") {
        // Reset form
        setSelectedFile(null);
        setDocumentType("");
        setExpirationDate("");
        setUseEncryption(false);
        setEncryptionKey(null);
        setUploadProgress(0);
        
        // Show success message
        if (useEncryption && encryptionKey) {
          // Store encryption key in sessionStorage or prompt user to save it
          const keyToStore = {
            documentId: response.data.id,
            key: encryptionKey,
            timestamp: Date.now(),
          };
          const storedKeys = JSON.parse(sessionStorage.getItem("encryption_keys") || "[]");
          storedKeys.push(keyToStore);
          sessionStorage.setItem("encryption_keys", JSON.stringify(storedKeys));
        }

        onUploadSuccess?.();
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to upload document"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Securely upload and store your important documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration-date">Expiration Date (Optional)</Label>
            <Input
              id="expiration-date"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{selectedFile.name}</span>
              <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cloud-storage"
              checked={useCloudStorage}
              onCheckedChange={(checked) => setUseCloudStorage(checked as boolean)}
            />
            <Label
              htmlFor="cloud-storage"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <Cloud className="h-4 w-4" />
              Store in Cloud (Recommended)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="encryption"
              checked={useEncryption}
              onCheckedChange={handleEncryptionToggle}
            />
            <Label
              htmlFor="encryption"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Encrypt File (Extra Security)
            </Label>
          </div>

          {useEncryption && encryptionKey && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Your encryption key will be stored in your browser session.
                Make sure to save it securely if you want to access this file from another device.
                <div className="mt-2 text-xs font-mono bg-muted p-2 rounded break-all">
                  Key: {encryptionKey.substring(0, 32)}...
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {isUploading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

