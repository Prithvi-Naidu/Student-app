import { Router, Request, Response } from 'express';
import {
  searchRentalListings,
  getRentalListingById,
  RentCastSearchParams,
} from '../utils/rentcast';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/housing/rentals
 * Search rental listings via RentCast API.
 * Query params: city, state, zipCode, bedrooms, minPrice, maxPrice, limit, offset
 */
router.get('/rentals', async (req: Request, res: Response) => {
  try {
    const {
      city,
      state,
      zipCode,
      bedrooms,
      minPrice,
      maxPrice,
      limit,
      offset,
      status = 'Active',
    } = req.query;

    const params: RentCastSearchParams = {
      status: status as 'Active' | 'Inactive',
      limit: limit ? Math.min(parseInt(String(limit), 10) || 20, 100) : 20,
      offset: offset ? parseInt(String(offset), 10) || 0 : 0,
    };

    if (city && typeof city === 'string') params.city = city;
    if (state && typeof state === 'string') params.state = state;
    if (zipCode && typeof zipCode === 'string') params.zipCode = zipCode;
    if (bedrooms && typeof bedrooms === 'string') params.bedrooms = bedrooms;

    if (minPrice != null || maxPrice != null) {
      const min = minPrice != null ? parseInt(String(minPrice), 10) : undefined;
      const max = maxPrice != null ? parseInt(String(maxPrice), 10) : undefined;
      if (min != null && max != null && !isNaN(min) && !isNaN(max)) {
        params.price = `${min}-${max}`;
      } else if (min != null && !isNaN(min)) {
        params.price = `${min}`;
      } else if (max != null && !isNaN(max)) {
        params.price = `${max}`;
      }
    }

    const listings = await searchRentalListings(params);

    res.json({
      status: 'success',
      data: listings,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('RentCast rental search failed:', error);

    if (msg.includes('RENTCAST_API_KEY')) {
      return res.status(503).json({
        status: 'error',
        message:
          'Housing search is temporarily unavailable. Please configure RENTCAST_API_KEY.',
      });
    }

    res.status(500).json({
      status: 'error',
      message: msg,
    });
  }
});

/**
 * GET /api/housing/rentals/:id
 * Get a single rental listing by RentCast ID.
 */
router.get('/rentals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const listing = await getRentalListingById(id);

    res.json({
      status: 'success',
      data: listing,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('RentCast rental fetch failed:', error);

    if (msg.includes('RENTCAST_API_KEY')) {
      return res.status(503).json({
        status: 'error',
        message:
          'Housing search is temporarily unavailable. Please configure RENTCAST_API_KEY.',
      });
    }

    res.status(500).json({
      status: 'error',
      message: msg,
    });
  }
});

export default router;
