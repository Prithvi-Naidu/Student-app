"use client";

import { useCallback, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, Loader2 } from "lucide-react";
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
  daysOnMarket?: number;
  listingAgent?: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

function formatAmenities(listing: RentalListing): string[] {
  const items: string[] = [];
  if (listing.squareFootage) items.push(`${listing.squareFootage} sqft`);
  if (listing.bedrooms) items.push(`${listing.bedrooms} bed`);
  if (listing.bathrooms) items.push(`${listing.bathrooms} bath`);
  if (listing.yearBuilt) items.push(`Built ${listing.yearBuilt}`);
  if (listing.hoa?.fee) items.push(`HOA $${listing.hoa.fee}/mo`);
  return items;
}

export default function HousingPage() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [listings, setListings] = useState<RentalListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchListings = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (city.trim()) params.set("city", city.trim());
      if (state.trim()) params.set("state", state.trim());
      if (zipCode.trim()) params.set("zipCode", zipCode.trim());
      if (bedrooms.trim()) params.set("bedrooms", bedrooms.trim());
      if (minPrice.trim()) params.set("minPrice", minPrice.trim());
      if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
      params.set("limit", "24");

      const response = await apiClient.get<{ status: string; data: RentalListing[] }>(
        `/api/housing/rentals?${params.toString()}`,
        { signal }
      );

      if (response.status === "success") {
        setListings(response.data ?? []);
      } else {
        setError("Failed to load listings");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load listings");
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [city, state, zipCode, bedrooms, minPrice, maxPrice]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() && !state.trim() && !zipCode.trim()) {
      setError("Please enter at least a city, state, or zip code");
      return;
    }
    setError(null);
    setHasSearched(true);
    fetchListings();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Home</h1>
          <p className="text-muted-foreground text-lg">
            Search real rental listings powered by RentCast
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
            <CardDescription>
              Enter city and state (or zip code) to search. All fields optional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input
                    placeholder="e.g. Austin"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input
                    placeholder="e.g. TX"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zip Code</label>
                  <Input
                    placeholder="e.g. 78701"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bedrooms</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Any"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Price ($/mo)</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Price ($/mo)</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Any"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive">
            <CardContent className="py-6">
              <p className="text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure RENTCAST_API_KEY is set in apps/api/.env. Get a key at{" "}
                <a
                  href="https://app.rentcast.io/app/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  RentCast
                </a>
                .
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && !error && listings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {listing.formattedAddress}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      ${listing.price.toLocaleString()}/mo
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">
                      {listing.addressLine1}
                      {listing.addressLine2 ? `, ${listing.addressLine2}` : ""},{" "}
                      {listing.city}, {listing.state} {listing.zipCode}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{listing.propertyType}</Badge>
                    {formatAmenities(listing).slice(0, 4).map((a, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {a}
                      </Badge>
                    ))}
                  </div>
                  {listing.daysOnMarket != null && listing.daysOnMarket > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Listed {listing.daysOnMarket} days ago
                    </p>
                  )}
                  <Button asChild className="w-full">
                    <Link
                      href={`/housing/${encodeURIComponent(listing.id)}`}
                    >
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !error && listings.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {hasSearched ? "No listings found" : "Enter search criteria"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasSearched
                  ? "Try adjusting your filters or search a different area"
                  : "Enter a city and state (e.g. Austin, TX) and click Search"}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setCity("");
                  setState("");
                  setZipCode("");
                  setBedrooms("");
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
