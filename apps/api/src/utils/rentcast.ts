/**
 * RentCast API client for property and rental listing data.
 * Docs: https://developers.rentcast.io
 * Postman: https://www.postman.com/rentcast/rentcast-api/documentation/ca4yudw/rentcast-api-endpoints
 */

const RENTCAST_BASE = 'https://api.rentcast.io/v1';

export interface RentCastRentalListing {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  hoa?: { fee: number };
  status: string;
  price: number;
  listingType?: string;
  listedDate?: string;
  removedDate?: string | null;
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
  history?: Record<string, unknown>;
}

export interface RentCastSearchParams {
  city?: string;
  state?: string;
  zipCode?: string;
  address?: string;
  radius?: number;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  bedrooms?: string;
  bathrooms?: string;
  status?: 'Active' | 'Inactive';
  price?: string;
  limit?: number;
  offset?: number;
  includeTotalCount?: boolean;
}

async function rentcastFetch<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) {
    throw new Error('RENTCAST_API_KEY is not configured');
  }

  const url = new URL(`${RENTCAST_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-Api-Key': apiKey,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = `RentCast API error: ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.message) errMsg = errJson.message;
    } catch {
      if (errText) errMsg = errText.slice(0, 200);
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

/**
 * Search rental listings (long-term) by city, state, zip, or address+radius.
 */
export async function searchRentalListings(
  params: RentCastSearchParams
): Promise<RentCastRentalListing[]> {
  const query: Record<string, string | number | boolean | undefined> = {
    status: params.status ?? 'Active',
    limit: Math.min(params.limit ?? 20, 500),
    offset: params.offset ?? 0,
  };

  if (params.city) query.city = params.city;
  if (params.state) query.state = params.state;
  if (params.zipCode) query.zipCode = params.zipCode;
  if (params.address) query.address = params.address;
  if (params.radius != null) query.radius = params.radius;
  if (params.latitude != null) query.latitude = params.latitude;
  if (params.longitude != null) query.longitude = params.longitude;
  if (params.propertyType) query.propertyType = params.propertyType;
  if (params.bedrooms) query.bedrooms = params.bedrooms;
  if (params.bathrooms) query.bathrooms = params.bathrooms;
  if (params.price) query.price = params.price;
  if (params.includeTotalCount) query.includeTotalCount = params.includeTotalCount;

  return rentcastFetch<RentCastRentalListing[]>(
    '/listings/rental/long-term',
    query
  );
}

/**
 * Get a single rental listing by ID.
 */
export async function getRentalListingById(
  id: string
): Promise<RentCastRentalListing> {
  const encodedId = encodeURIComponent(id);
  return rentcastFetch<RentCastRentalListing>(
    `/listings/rental/long-term/${encodedId}`
  );
}

/**
 * Search property records (for property details, not just listings).
 */
export async function searchProperties(params: {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  radius?: number;
  propertyType?: string;
  bedrooms?: string;
  bathrooms?: string;
  limit?: number;
  offset?: number;
}): Promise<unknown[]> {
  const query: Record<string, string | number | undefined> = {
    limit: Math.min(params.limit ?? 20, 500),
    offset: params.offset ?? 0,
  };
  if (params.address) query.address = params.address;
  if (params.city) query.city = params.city;
  if (params.state) query.state = params.state;
  if (params.zipCode) query.zipCode = params.zipCode;
  if (params.radius != null) query.radius = params.radius;
  if (params.propertyType) query.propertyType = params.propertyType;
  if (params.bedrooms) query.bedrooms = params.bedrooms;
  if (params.bathrooms) query.bathrooms = params.bathrooms;

  return rentcastFetch<unknown[]>('/properties', query);
}
