import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Get all banking resources with optional filters
router.get('/resources', async (req: Request, res: Response) => {
  try {
    const { category, type, search } = req.query;

    let query = 'SELECT * FROM banking_resources WHERE published = true';
    const params: any[] = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (type) {
      paramCount++;
      query += ` AND resource_type = $${paramCount}`;
      params.push(type);
    }

    if (search) {
      const searchPattern = `%${search}%`;
      paramCount++;
      query += ` AND (title ILIKE $${paramCount}`;
      params.push(searchPattern);
      paramCount++;
      query += ` OR content ILIKE $${paramCount})`;
      params.push(searchPattern);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      status: 'success',
      data: result.rows,
    });
  } catch (error: any) {
    logger.error('Error fetching banking resources:', error);
    logger.error('Error details:', { message: error.message, stack: error.stack });
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch banking resources',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
});

// Get single resource by slug
router.get('/resources/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      'SELECT * FROM banking_resources WHERE slug = $1 AND published = true',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found',
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error fetching banking resource:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch banking resource',
    });
  }
});

// Get categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM banking_resources WHERE published = true ORDER BY category'
    );

    res.json({
      status: 'success',
      data: result.rows.map(row => row.category),
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories',
    });
  }
});

// Create new resource (admin only - will add auth later)
router.post('/resources', async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      content,
      category,
      resource_type,
      video_url,
      partner_bank_name,
      partner_referral_link,
      tags,
      summary,
      source_urls,
      last_verified,
      published = true,
    } = req.body;

    if (!title || !slug || !content || !category || !resource_type) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, slug, content, category, and resource_type are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO banking_resources (
        title, slug, content, category, resource_type, video_url,
        partner_bank_name, partner_referral_link, tags, published,
        summary, source_urls, last_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        title,
        slug,
        content,
        category,
        resource_type,
        video_url || null,
        partner_bank_name || null,
        partner_referral_link || null,
        tags || [],
        published,
        summary || null,
        source_urls || null,
        last_verified || null,
      ]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        status: 'error',
        message: 'A resource with this slug already exists',
      });
    }
    logger.error('Error creating banking resource:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create banking resource',
    });
  }
});

export default router;

