import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Get all listings with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { city, state, minPrice, maxPrice, status = 'active' } = req.query;

    let query = 'SELECT * FROM listings WHERE status = $1';
    const params: any[] = [status];
    let paramCount = 1;

    if (city) {
      paramCount++;
      query += ` AND city = $${paramCount}`;
      params.push(city);
    }

    if (state) {
      paramCount++;
      query += ` AND state = $${paramCount}`;
      params.push(state);
    }

    if (minPrice) {
      paramCount++;
      query += ` AND price >= $${paramCount}`;
      params.push(parseFloat(minPrice as string));
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND price <= $${paramCount}`;
      params.push(parseFloat(maxPrice as string));
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    logger.error('Error fetching listings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch listings',
    });
  }
});

// Get single listing by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found',
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error fetching listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch listing',
    });
  }
});

// Create new listing
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      landlord_id,
      title,
      description,
      address,
      city,
      state,
      zip_code,
      price,
      amenities,
      images,
    } = req.body;

    if (!title || !address || !price) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, address, and price are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO listings (
        landlord_id, title, description, address, city, state, zip_code,
        price, amenities, images, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        landlord_id || null,
        title,
        description || null,
        address,
        city || null,
        state || null,
        zip_code || null,
        price,
        amenities || [],
        images || [],
        'active',
      ]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error creating listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create listing',
    });
  }
});

// Update listing
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = [
      'title',
      'description',
      'address',
      'city',
      'state',
      'zip_code',
      'price',
      'amenities',
      'images',
      'status',
    ];

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(updates[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update',
      });
    }

    values.push(id);
    const query = `UPDATE listings SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found',
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error updating listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update listing',
    });
  }
});

// Delete listing
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM listings WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found',
      });
    }

    res.json({
      status: 'success',
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete listing',
    });
  }
});

export default router;

