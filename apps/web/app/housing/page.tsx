import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, DollarSign, Home } from "lucide-react";
import Link from "next/link";

export default function HousingPage() {
  // This will be replaced with actual data from API
  const sampleListings = [
    {
      id: "1",
      title: "Cozy Studio Near Campus",
      description: "Bright and modern studio apartment just 5 minutes walk from university campus.",
      address: "123 Main St",
      city: "Tempe",
      state: "AZ",
      price: 850,
      amenities: ["Furnished", "Parking", "Laundry"],
      images: [],
    },
    {
      id: "2",
      title: "Shared Room in Student Housing",
      description: "Large shared room in a friendly student house. Perfect for making friends!",
      address: "456 College Ave",
      city: "Tempe",
      state: "AZ",
      price: 600,
      amenities: ["Furnished", "WiFi", "Utilities Included"],
      images: [],
    },
  ];

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
                <Input placeholder="City or State" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Price</label>
                <Input type="number" placeholder="$0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Price</label>
                <Input type="number" placeholder="$2000" />
              </div>
              <div className="flex items-end">
                <Button className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleListings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{listing.title}</CardTitle>
                  <Badge variant="secondary">${listing.price}/mo</Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {listing.address}, {listing.city}, {listing.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {listing.description}
                </p>
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
                <Button asChild className="w-full">
                  <Link href={`/housing/${listing.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sampleListings.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No listings found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search filters
              </p>
              <Button variant="outline">Clear Filters</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

