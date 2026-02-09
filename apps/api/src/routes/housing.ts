import { Router, Request, Response } from 'express';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

const router = Router();

// Read env vars lazily (at request time) so dotenv has loaded by then
const getRentcastConfig = () => ({
  baseUrl: process.env.RENTCAST_BASE_URL || 'https://api.rentcast.io/v1',
  apiKey: process.env.RENTCAST_API_KEY,
  cacheTtl: Number(process.env.RENTCAST_CACHE_TTL_SECONDS || 600),
});

type RentcastListing = Record<string, any>;

const toStringParam = (value: unknown) => {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
};

const buildCacheKey = (params: Record<string, string>) => {
  const sortedKeys = Object.keys(params).sort();
  const encoded = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  return `rentcast:rental_long_term:${encoded || 'all'}`;
};

const normalizeListing = (listing: RentcastListing, index: number) => {
  const address =
    listing.formattedAddress ||
    listing.addressLine1 ||
    listing.address ||
    listing.streetAddress ||
    '';
  const city = listing.city || '';
  const state = listing.state || '';
  const zipCode = listing.zipCode || '';
  const price = listing.price ?? listing.rent ?? listing.listPrice ?? 0;
  const beds = listing.bedrooms ?? listing.beds;
  const baths = listing.bathrooms ?? listing.baths;
  const sqft = listing.squareFootage || null;
  const propertyType = listing.propertyType || 'Home';
  const status = listing.status || '';

  // Build a human-readable title
  const parts: string[] = [];
  if (beds !== undefined && beds !== null) parts.push(`${beds} Bed`);
  if (baths !== undefined && baths !== null) parts.push(`${baths} Bath`);
  parts.push(propertyType);
  const title = listing.title || parts.join(' ');

  // Build amenities from available data
  const amenities: string[] = [];
  if (sqft) amenities.push(`${sqft} sqft`);
  if (listing.yearBuilt) amenities.push(`Built ${listing.yearBuilt}`);
  if (listing.county) amenities.push(listing.county);
  if (Array.isArray(listing.amenities)) amenities.push(...listing.amenities);

  return {
    id: listing.id || `listing-${index}`,
    title,
    description: listing.description || listing.summary || '',
    address,
    city,
    state,
    zipCode,
    price,
    bedrooms: beds ?? null,
    bathrooms: baths ?? null,
    squareFootage: sqft,
    propertyType,
    status,
    listedDate: listing.listedDate || null,
    daysOnMarket: listing.daysOnMarket ?? null,
    amenities,
    images: Array.isArray(listing.photos)
      ? listing.photos
      : Array.isArray(listing.images)
        ? listing.images
        : [],
    source: 'rentcast',
    raw: listing,
  };
};

// Proxy RentCast Rental Listings with caching
router.get('/search', async (req: Request, res: Response) => {
  const { baseUrl, apiKey, cacheTtl } = getRentcastConfig();

  if (!apiKey) {
    logger.error('RENTCAST_API_KEY not set. Available env keys:', Object.keys(process.env).filter(k => k.includes('RENT')));
    return res.status(500).json({
      status: 'error',
      message: 'RentCast API key is not configured',
    });
  }

  try {
    const queryParams: Record<string, string> = {};
    const allowedParams = [
      'city',
      'state',
      'zip',
      'minPrice',
      'maxPrice',
      'beds',
      'baths',
      'propertyType',
      'limit',
      'offset',
    ];

    for (const key of allowedParams) {
      const value = toStringParam(req.query[key]);
      if (value) queryParams[key] = value;
    }

    const cacheKey = buildCacheKey(queryParams);
    const canUseCache = redisClient.isOpen;

    if (canUseCache) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json({
          status: 'success',
          data: {
            listings: JSON.parse(cached),
            cached: true,
          },
        });
      }
    }

    const searchParams = new URLSearchParams(queryParams);
    const requestUrl = `${baseUrl}/listings/rental/long-term?${searchParams.toString()}`;

    const response = await fetch(requestUrl, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('RentCast API error', { status: response.status, body: errorText });
      return res.status(response.status).json({
        status: 'error',
        message: 'RentCast request failed',
      });
    }

    const data = await response.json();
    // RentCast returns a raw array, not wrapped in an object
    const rawListings = Array.isArray(data)
      ? data
      : data?.listings || data?.results || data?.data || [];
    const listings = Array.isArray(rawListings)
      ? rawListings.map((listing: RentcastListing, index: number) => normalizeListing(listing, index))
      : [];

    if (canUseCache) {
      await redisClient.setEx(cacheKey, cacheTtl, JSON.stringify(listings));
    }

    return res.json({
      status: 'success',
      data: {
        listings,
        cached: false,
      },
    });
  } catch (error) {
    logger.error('Error fetching RentCast listings', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch RentCast listings',
    });
  }
});

export default router;

