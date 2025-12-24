import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Get all forum posts with optional filters
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM forum_posts WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
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

    // Get comment counts for each post
    const postsWithCounts = await Promise.all(
      result.rows.map(async (post) => {
        const commentResult = await pool.query(
          'SELECT COUNT(*) as count FROM forum_comments WHERE post_id = $1',
          [post.id]
        );
        return {
          ...post,
          comment_count: parseInt(commentResult.rows[0].count),
        };
      })
    );

    res.json({
      status: 'success',
      data: postsWithCounts,
    });
  } catch (error) {
    logger.error('Error fetching forum posts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch forum posts',
    });
  }
});

// Get single post by ID
router.get('/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const postResult = await pool.query('SELECT * FROM forum_posts WHERE id = $1', [id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
      });
    }

    // Get comments for this post
    const commentsResult = await pool.query(
      'SELECT * FROM forum_comments WHERE post_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.json({
      status: 'success',
      data: {
        ...postResult.rows[0],
        comments: commentsResult.rows,
      },
    });
  } catch (error) {
    logger.error('Error fetching forum post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch forum post',
    });
  }
});

// Create new post
router.post('/posts', async (req: Request, res: Response) => {
  try {
    const { user_id, category, title, content } = req.body;

    if (!category || !title || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Category, title, and content are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO forum_posts (user_id, category, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id || null, category, title, content]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error creating forum post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create forum post',
    });
  }
});

// Create comment on post
router.post('/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, parent_id, content } = req.body;

    if (!content) {
      return res.status(400).json({
        status: 'error',
        message: 'Content is required',
      });
    }

    const result = await pool.query(
      `INSERT INTO forum_comments (post_id, user_id, parent_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, user_id || null, parent_id || null, content]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error creating comment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create comment',
    });
  }
});

// Upvote post
router.post('/posts/:id/upvote', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE forum_posts SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error upvoting post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upvote post',
    });
  }
});

export default router;

