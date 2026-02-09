"use client";

import { useCallback, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Home } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

type Listing = {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  price: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFootage?: number | null;
  propertyType?: string;
  status?: string;
  listedDate?: string | null;
  daysOnMarket?: number | null;
  amenities: string[];
  images: string[];
  source?: string;
};

type ListingResponse = {
  status: string;
  data: {
    listings: Listing[];
    cached?: boolean;
  };
};

const parseLocation = (location: string) => {
  const trimmed = location.trim();
  if (!trimmed) return { city: "", state: "" };
  if (trimmed.includes(",")) {
    const [city, state] = trimmed.split(",").map((part) => part.trim());
    return { city: city || "", state: state || "" };
  }
  if (trimmed.length === 2) {
    return { city: "", state: trimmed.toUpperCase() };
  }
  return { city: trimmed, state: "" };
};

export default function HousingPage() {
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = useMemo(
    () => location.trim() || minPrice.trim() || maxPrice.trim(),
    [location, minPrice, maxPrice]
  );

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const { city, state } = parseLocation(location);
      if (city) params.set("city", city);
      if (state) params.set("state", state);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      const response = await apiClient.get<ListingResponse>(
        `/api/housing/search${params.toString() ? `?${params.toString()}` : ""}`
      );
      setListings(response.data.listings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch listings");
    } finally {
      setIsLoading(false);
    }
  }, [location, minPrice, maxPrice]);

  const handleClear = () => {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setListings([]);
    setError(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Home</h1>
          <p className="text-muted-foreground text-lg">
            Discover verified student accommodations near your campus
          </p>
        </div>

        {/* Search Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
            <CardDescription>Filter listings by your preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="City or State"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Price</label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Price</label>
                <Input
                  type="number"
                  placeholder="$2000"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={fetchListings} disabled={isLoading}>
                  <Search className="mr-2 h-4 w-4" />
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card>
            <CardContent className="py-4 text-center text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Listings Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">{listing.title}</CardTitle>
                  <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                    ${listing.price.toLocaleString()}/mo
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {listing.address}
                    {listing.city && `, ${listing.city}`}
                    {listing.state && `, ${listing.state}`}
                    {listing.zipCode && ` ${listing.zipCode}`}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property details row */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {listing.bedrooms != null && (
                    <span>{listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}</span>
                  )}
                  {listing.bathrooms != null && (
                    <span>{listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}</span>
                  )}
                  {listing.squareFootage && (
                    <span>{listing.squareFootage.toLocaleString()} sqft</span>
                  )}
                  {listing.propertyType && (
                    <Badge variant="outline" className="text-xs">{listing.propertyType}</Badge>
                  )}
                </div>

                {listing.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {listing.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {listing.amenities.slice(0, 3).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {listing.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{listing.amenities.length - 3} more
                    </Badge>
                  )}
                </div>

                {listing.status && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge
                      variant={listing.status === 'Active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {listing.status}
                    </Badge>
                    {listing.daysOnMarket != null && (
                      <span>{listing.daysOnMarket} day{listing.daysOnMarket !== 1 ? 's' : ''} on market</span>
                    )}
                  </div>
                )}

                <Button asChild className="w-full">
                  <Link href={`/housing/${listing.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && listings.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {hasFilters ? "No listings found" : "Start a search"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasFilters
                  ? "Try adjusting your search filters"
                  : "Enter a location and price range to see listings"}
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={handleClear}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

