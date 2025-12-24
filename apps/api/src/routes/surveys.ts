import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Get all surveys
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status = 'active' } = req.query;

    const result = await pool.query(
      'SELECT * FROM surveys WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );

    res.json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    logger.error('Error fetching surveys:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch surveys',
    });
  }
});

// Get single survey by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM surveys WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Survey not found',
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error fetching survey:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch survey',
    });
  }
});

// Create new survey (admin only - will add auth later)
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      provider,
      title,
      description,
      reward_points,
      eligibility_criteria,
      api_config,
      status = 'active',
    } = req.body;

    if (!provider || !title) {
      return res.status(400).json({
        status: 'error',
        message: 'Provider and title are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO surveys (
        provider, title, description, reward_points,
        eligibility_criteria, api_config, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        provider,
        title,
        description || null,
        reward_points || 0,
        eligibility_criteria || {},
        api_config || {},
        status,
      ]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error creating survey:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create survey',
    });
  }
});

export default router;

