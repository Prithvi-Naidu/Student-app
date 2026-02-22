"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Globe,
  Home,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface RentalListing {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  hoa?: { fee: number };
  status: string;
  price: number;
  listedDate?: string;
  daysOnMarket?: number;
  mlsName?: string;
  mlsNumber?: string;
  listingAgent?: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  listingOffice?: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export default function HousingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? decodeURIComponent(params.id) : "";
  const [listing, setListing] = useState<RentalListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = useCallback(
    async (signal?: AbortSignal) => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get<{
          status: string;
          data: RentalListing;
        }>(`/api/housing/rentals/${encodeURIComponent(id)}`, { signal });
        if (response.status === "success") {
          setListing(response.data);
        } else {
          setError("Listing not found");
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load listing");
      } finally {
        setIsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const controller = new AbortController();
    if (id) fetchListing(controller.signal);
    else setIsLoading(false);
    return () => controller.abort();
  }, [id, fetchListing]);

  if (!id) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Invalid listing ID</p>
            <Button asChild className="mt-4">
              <Link href="/housing">Back to Housing</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !listing) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{error ?? "Listing not found"}</p>
            <Button asChild className="mt-4">
              <Link href="/housing">Back to Housing</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const agent = listing.listingAgent;
  const office = listing.listingOffice;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/housing">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Listing Details</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">
                      {listing.formattedAddress}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4" />
                      {listing.addressLine1}
                      {listing.addressLine2 ? `, ${listing.addressLine2}` : ""},{" "}
                      {listing.city}, {listing.state} {listing.zipCode}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    ${listing.price.toLocaleString()}/mo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{listing.propertyType}</Badge>
                  <Badge variant="outline">
                    {listing.bedrooms} bed / {listing.bathrooms} bath
                  </Badge>
                  {listing.squareFootage && (
                    <Badge variant="outline">{listing.squareFootage} sqft</Badge>
                  )}
                  {listing.yearBuilt && (
                    <Badge variant="outline">Built {listing.yearBuilt}</Badge>
                  )}
                  {listing.hoa?.fee && (
                    <Badge variant="outline">HOA ${listing.hoa.fee}/mo</Badge>
                  )}
                </div>
                {listing.lotSize && (
                  <p className="text-sm text-muted-foreground">
                    Lot size: {listing.lotSize.toLocaleString()} sqft
                  </p>
                )}
                {listing.daysOnMarket != null && listing.daysOnMarket > 0 && (
                  <p className="text-sm text-muted-foreground">
                    On market for {listing.daysOnMarket} days
                  </p>
                )}
                {listing.mlsNumber && (
                  <p className="text-sm text-muted-foreground">
                    MLS #{listing.mlsNumber}
                    {listing.mlsName && ` (${listing.mlsName})`}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {(agent || office) && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                  <CardDescription>
                    Reach out to the listing agent or office
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {agent && (
                    <div className="space-y-2">
                      <p className="font-medium">{agent.name}</p>
                      {agent.phone && (
                        <a
                          href={`tel:${agent.phone}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
                        >
                          <Phone className="h-4 w-4" />
                          {agent.phone}
                        </a>
                      )}
                      {agent.email && (
                        <a
                          href={`mailto:${agent.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          {agent.email}
                        </a>
                      )}
                      {agent.website && (
                        <a
                          href={agent.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          Website
                        </a>
                      )}
                    </div>
                  )}
                  {office && agent?.name !== office.name && (
                    <div className="pt-2 border-t space-y-2">
                      <p className="font-medium text-sm">{office.name}</p>
                      {office.phone && (
                        <a
                          href={`tel:${office.phone}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
                        >
                          <Phone className="h-4 w-4" />
                          {office.phone}
                        </a>
                      )}
                      {office.email && (
                        <a
                          href={`mailto:${office.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          {office.email}
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
