import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

const requireAuth = (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return null;
  }
  return userId;
};

// Get my roommate profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const result = await pool.query(
      'SELECT * FROM roommate_profiles WHERE user_id = $1',
      [userId]
    );

    res.json({
      status: 'success',
      data: result.rows[0] || null,
    });
  } catch (error) {
    logger.error('Error fetching roommate profile:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch profile' });
  }
});

// Create or update my roommate profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const {
      display_name,
      school,
      program,
      graduation_year,
      bio,
      budget_min,
      budget_max,
      move_in_date,
      lease_length_months,
      preferred_locations,
      room_type,
      gender_preference,
      smoking_preference,
      pets_preference,
      sleep_schedule,
      noise_tolerance,
      cleanliness_level,
      guests_preference,
      cooking_frequency,
      work_from_home,
      social_style,
      compatibility_tags,
      contact_email,
      contact_phone,
      discoverable,
    } = req.body;

    if (!display_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Display name is required',
      });
    }

    const existing = await pool.query(
      'SELECT id FROM roommate_profiles WHERE user_id = $1',
      [userId]
    );

    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE roommate_profiles SET
          display_name = $1,
          school = $2,
          program = $3,
          graduation_year = $4,
          bio = $5,
          budget_min = $6,
          budget_max = $7,
          move_in_date = $8,
          lease_length_months = $9,
          preferred_locations = $10,
          room_type = $11,
          gender_preference = $12,
          smoking_preference = $13,
          pets_preference = $14,
          sleep_schedule = $15,
          noise_tolerance = $16,
          cleanliness_level = $17,
          guests_preference = $18,
          cooking_frequency = $19,
          work_from_home = $20,
          social_style = $21,
          compatibility_tags = $22,
          contact_email = $23,
          contact_phone = $24,
          discoverable = $25
         WHERE user_id = $26
         RETURNING *`,
        [
          display_name,
          school || null,
          program || null,
          graduation_year || null,
          bio || null,
          budget_min || null,
          budget_max || null,
          move_in_date || null,
          lease_length_months || null,
          preferred_locations || null,
          room_type || null,
          gender_preference || null,
          smoking_preference || null,
          pets_preference || null,
          sleep_schedule || null,
          noise_tolerance || null,
          cleanliness_level || null,
          guests_preference || null,
          cooking_frequency || null,
          work_from_home || null,
          social_style || null,
          compatibility_tags || null,
          contact_email || null,
          contact_phone || null,
          discoverable !== undefined ? discoverable : true,
          userId,
        ]
      );

      return res.json({ status: 'success', data: result.rows[0] });
    }

    const result = await pool.query(
      `INSERT INTO roommate_profiles (
        user_id, display_name, school, program, graduation_year, bio,
        budget_min, budget_max, move_in_date, lease_length_months,
        preferred_locations, room_type, gender_preference, smoking_preference,
        pets_preference, sleep_schedule, noise_tolerance, cleanliness_level,
        guests_preference, cooking_frequency, work_from_home, social_style,
        compatibility_tags, contact_email, contact_phone, discoverable
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26
      ) RETURNING *`,
      [
        userId,
        display_name,
        school || null,
        program || null,
        graduation_year || null,
        bio || null,
        budget_min || null,
        budget_max || null,
        move_in_date || null,
        lease_length_months || null,
        preferred_locations || null,
        room_type || null,
        gender_preference || null,
        smoking_preference || null,
        pets_preference || null,
        sleep_schedule || null,
        noise_tolerance || null,
        cleanliness_level || null,
        guests_preference || null,
        cooking_frequency || null,
        work_from_home || null,
        social_style || null,
        compatibility_tags || null,
        contact_email || null,
        contact_phone || null,
        discoverable !== undefined ? discoverable : true,
      ]
    );

    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    logger.error('Error saving roommate profile:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save profile' });
  }
});

// Browse roommate profiles with filters (auth required, but browse only discoverable)
router.get('/browse', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const {
      budget_min,
      budget_max,
      move_in_date,
      location,
      room_type,
      sleep_schedule,
      noise_tolerance,
      cleanliness_level,
      guests_preference,
      pets_preference,
    } = req.query;

    let query = 'SELECT * FROM roommate_profiles WHERE discoverable = true AND user_id != $1';
    const params: any[] = [userId];
    let paramCount = 1;

    if (budget_min) {
      paramCount++;
      query += ` AND (budget_max IS NULL OR budget_max >= $${paramCount})`;
      params.push(parseInt(budget_min as string));
    }
    if (budget_max) {
      paramCount++;
      query += ` AND (budget_min IS NULL OR budget_min <= $${paramCount})`;
      params.push(parseInt(budget_max as string));
    }
    if (move_in_date) {
      paramCount++;
      query += ` AND (move_in_date IS NULL OR move_in_date <= $${paramCount})`;
      params.push(move_in_date);
    }
    if (location) {
      paramCount++;
      query += ` AND preferred_locations @> ARRAY[$${paramCount}]`;
      params.push(location);
    }
    if (room_type) {
      paramCount++;
      query += ` AND room_type = $${paramCount}`;
      params.push(room_type);
    }
    if (sleep_schedule) {
      paramCount++;
      query += ` AND sleep_schedule = $${paramCount}`;
      params.push(sleep_schedule);
    }
    if (noise_tolerance) {
      paramCount++;
      query += ` AND noise_tolerance = $${paramCount}`;
      params.push(noise_tolerance);
    }
    if (cleanliness_level) {
      paramCount++;
      query += ` AND cleanliness_level = $${paramCount}`;
      params.push(cleanliness_level);
    }
    if (guests_preference) {
      paramCount++;
      query += ` AND guests_preference = $${paramCount}`;
      params.push(guests_preference);
    }
    if (pets_preference) {
      paramCount++;
      query += ` AND pets_preference = $${paramCount}`;
      params.push(pets_preference);
    }

    query += ' ORDER BY updated_at DESC';

    const result = await pool.query(query, params);

    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    logger.error('Error browsing roommate profiles:', error);
    res.status(500).json({ status: 'error', message: 'Failed to browse profiles' });
  }
});

// Send a roommate request
router.post('/requests', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { target_user_id, message } = req.body;
    if (!target_user_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Target user is required',
      });
    }

    const result = await pool.query(
      `INSERT INTO roommate_requests (requester_user_id, target_user_id, message)
       VALUES ($1, $2, $3)
       ON CONFLICT (requester_user_id, target_user_id)
       DO UPDATE SET message = EXCLUDED.message, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, target_user_id, message || null]
    );

    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    logger.error('Error sending roommate request:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send request' });
  }
});

// List my incoming/outgoing requests
router.get('/requests', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const incoming = await pool.query(
      'SELECT * FROM roommate_requests WHERE target_user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const outgoing = await pool.query(
      'SELECT * FROM roommate_requests WHERE requester_user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      status: 'success',
      data: {
        incoming: incoming.rows,
        outgoing: outgoing.rows,
      },
    });
  } catch (error) {
    logger.error('Error fetching roommate requests:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch requests' });
  }
});

// Update request status (accept/reject)
router.post('/requests/:id/status', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const { id } = req.params;
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
      });
    }

    const result = await pool.query(
      `UPDATE roommate_requests
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND target_user_id = $3
       RETURNING *`,
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Request not found' });
    }

    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    logger.error('Error updating roommate request:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update request' });
  }
});

export default router;



