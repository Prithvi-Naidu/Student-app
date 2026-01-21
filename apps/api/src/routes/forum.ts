import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const getUserId = (req: Request) => (req as AuthRequest).user?.id;
const requireAuth = (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
    return null;
  }
  return userId;
};

const getModeratorIds = () =>
  (process.env.FORUM_MODERATOR_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

const isModerator = (userId: string | undefined) => {
  if (!userId) return false;
  return getModeratorIds().includes(userId);
};

const updatePostVoteCount = async (postId: string) => {
  await pool.query(
    `UPDATE forum_posts
     SET upvotes = (
       SELECT COALESCE(SUM(value), 0)
       FROM forum_post_votes
       WHERE post_id = $1
     )
     WHERE id = $1`,
    [postId]
  );
};

const updateCommentVoteCount = async (commentId: string) => {
  await pool.query(
    `UPDATE forum_comments
     SET upvotes = (
       SELECT COALESCE(SUM(value), 0)
       FROM forum_comment_votes
       WHERE comment_id = $1
     )
     WHERE id = $1`,
    [commentId]
  );
};

// Get all forum posts with optional filters
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { category, search, page = '1', limit = '20' } = req.query;
    const pageNumber = Math.max(parseInt(page as string) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit as string) || 20, 1), 50);
    const offset = (pageNumber - 1) * limitNumber;

    let query = 'SELECT * FROM forum_posts WHERE status != $1';
    const params: any[] = [];
    let paramCount = 0;

    paramCount++;
    params.push('deleted');

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

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limitNumber, offset);

    if (process.env.NODE_ENV !== 'production') {
      logger.info('Forum posts query', { query, params });
    }
    const result = await pool.query(query, params);

    // Get comment counts for each post
    const postsWithCounts = await Promise.all(
      result.rows.map(async (post) => {
        const commentResult = await pool.query(
          'SELECT COUNT(*) as count FROM forum_comments WHERE post_id = $1 AND status != $2',
          [post.id, 'deleted']
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
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        count: postsWithCounts.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching forum posts:', error);
    res.status(500).json({
      status: 'error',
      message:
        process.env.NODE_ENV === 'development'
          ? `Failed to fetch forum posts: ${error instanceof Error ? error.message : String(error)}`
          : 'Failed to fetch forum posts',
    });
  }
});

// Get single post by ID
router.get('/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const postResult = await pool.query(
      'SELECT * FROM forum_posts WHERE id = $1 AND status != $2',
      [id, 'deleted']
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
      });
    }

    // Get comments for this post
    const commentsResult = await pool.query(
      'SELECT * FROM forum_comments WHERE post_id = $1 AND status != $2 ORDER BY created_at ASC',
      [id, 'deleted']
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
    const userId = requireAuth(req, res);
    if (!userId) return;
    const { category, title, content } = req.body;

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
      [userId, category, title, content]
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

// Update post (owner or moderator)
router.put('/posts/:id', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const { id } = req.params;
    const { title, content, category } = req.body;

    const postResult = await pool.query('SELECT * FROM forum_posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
      });
    }

    const post = postResult.rows[0];
    if (post.user_id !== userId && !isModerator(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to edit this post',
      });
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (title) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      params.push(title);
    }
    if (content) {
      paramCount++;
      updates.push(`content = $${paramCount}`);
      params.push(content);
    }
    if (category) {
      paramCount++;
      updates.push(`category = $${paramCount}`);
      params.push(category);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update',
      });
    }

    params.push(id);
    const updateQuery = `UPDATE forum_posts SET ${updates.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`;
    const result = await pool.query(updateQuery, params);

    res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error updating forum post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update forum post',
    });
  }
});

// Delete post (owner or moderator) - soft delete
router.delete('/posts/:id', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const { id } = req.params;

    const postResult = await pool.query('SELECT * FROM forum_posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
      });
    }

    const post = postResult.rows[0];
    if (post.user_id !== userId && !isModerator(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this post',
      });
    }

    const result = await pool.query(
      `UPDATE forum_posts
       SET status = $1, deleted_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      ['deleted', id]
    );

    res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error deleting forum post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete forum post',
    });
  }
});

// Create comment on post
router.post('/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const { id } = req.params;
    const { parent_id, content } = req.body;

    if (!content) {
      return res.status(400).json({
        status: 'error',
        message: 'Content is required',
      });
    }

    const postResult = await pool.query('SELECT * FROM forum_posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
      });
    }
    if (postResult.rows[0].status === 'deleted') {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
      });
    }
    if (postResult.rows[0].status === 'locked') {
      return res.status(403).json({
        status: 'error',
        message: 'Post is locked',
      });
    }

    const result = await pool.query(
      `INSERT INTO forum_comments (post_id, user_id, parent_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, userId, parent_id || null, content]
    );

    // Notifications: reply or post comment
    const newComment = result.rows[0];
    if (parent_id) {
      const parentResult = await pool.query('SELECT user_id FROM forum_comments WHERE id = $1', [parent_id]);
      const parentUserId = parentResult.rows[0]?.user_id;
      if (parentUserId && parentUserId !== userId) {
        await pool.query(
          `INSERT INTO forum_notifications (user_id, actor_id, type, entity_type, entity_id, message)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [parentUserId, userId, 'reply', 'comment', newComment.id, 'New reply to your comment']
        );
      }
    } else {
      const postUserId = postResult.rows[0]?.user_id;
      if (postUserId && postUserId !== userId) {
        await pool.query(
          `INSERT INTO forum_notifications (user_id, actor_id, type, entity_type, entity_id, message)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [postUserId, userId, 'reply', 'post', id, 'New comment on your post']
        );
      }
    }

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

// Vote on post
router.post('/posts/:id/vote', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const { id } = req.params;
    const { value } = req.body;

    if (![1, -1].includes(value)) {
      return res.status(400).json({
        status: 'error',
        message: 'Vote value must be 1 or -1',
      });
    }

    const existingVote = await pool.query(
      'SELECT * FROM forum_post_votes WHERE post_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingVote.rows.length > 0) {
      if (existingVote.rows[0].value === value) {
        await pool.query('DELETE FROM forum_post_votes WHERE post_id = $1 AND user_id = $2', [id, userId]);
      } else {
        await pool.query(
          'UPDATE forum_post_votes SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE post_id = $2 AND user_id = $3',
          [value, id, userId]
        );
      }
    } else {
      await pool.query(
        'INSERT INTO forum_post_votes (post_id, user_id, value) VALUES ($1, $2, $3)',
        [id, userId, value]
      );
    }

    await updatePostVoteCount(id);

    const result = await pool.query('SELECT * FROM forum_posts WHERE id = $1', [id]);
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
    logger.error('Error voting on post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to vote on post',
    });
  }
});

// Vote on comment
router.post('/comments/:id/vote', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const { id } = req.params;
    const { value } = req.body;

    if (![1, -1].includes(value)) {
      return res.status(400).json({
        status: 'error',
        message: 'Vote value must be 1 or -1',
      });
    }

    const existingVote = await pool.query(
      'SELECT * FROM forum_comment_votes WHERE comment_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingVote.rows.length > 0) {
      if (existingVote.rows[0].value === value) {
        await pool.query('DELETE FROM forum_comment_votes WHERE comment_id = $1 AND user_id = $2', [id, userId]);
      } else {
        await pool.query(
          'UPDATE forum_comment_votes SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE comment_id = $2 AND user_id = $3',
          [value, id, userId]
        );
      }
    } else {
      await pool.query(
        'INSERT INTO forum_comment_votes (comment_id, user_id, value) VALUES ($1, $2, $3)',
        [id, userId, value]
      );
    }

    await updateCommentVoteCount(id);

    const result = await pool.query('SELECT * FROM forum_comments WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found',
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error voting on comment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to vote on comment',
    });
  }
});

// Delete comment (owner or moderator) - soft delete
router.delete('/comments/:id', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const { id } = req.params;

    const commentResult = await pool.query('SELECT * FROM forum_comments WHERE id = $1', [id]);
    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found',
      });
    }

    const comment = commentResult.rows[0];
    if (comment.user_id !== userId && !isModerator(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this comment',
      });
    }

    const result = await pool.query(
      `UPDATE forum_comments
       SET status = $1, deleted_at = CURRENT_TIMESTAMP, content = $2
       WHERE id = $3
       RETURNING *`,
      ['deleted', '[deleted]', id]
    );

    res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error deleting comment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete comment',
    });
  }
});

// Lock a post (moderator only)
router.post('/posts/:id/lock', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;
    if (!isModerator(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Moderator access required',
      });
    }
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE forum_posts
       SET status = $1, locked_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      ['locked', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
      });
    }

    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    logger.error('Error locking post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to lock post',
    });
  }
});

// Unlock a post (moderator only)
router.post('/posts/:id/unlock', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;
    if (!isModerator(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Moderator access required',
      });
    }
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE forum_posts
       SET status = $1, locked_at = NULL
       WHERE id = $2
       RETURNING *`,
      ['active', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found',
      });
    }

    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    logger.error('Error unlocking post:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unlock post',
    });
  }
});

// Get notifications
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const { page = '1', limit = '20' } = req.query;
    const pageNumber = Math.max(parseInt(page as string) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit as string) || 20, 1), 50);
    const offset = (pageNumber - 1) * limitNumber;

    const result = await pool.query(
      `SELECT * FROM forum_notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limitNumber, offset]
    );

    res.json({
      status: 'success',
      data: result.rows,
      pagination: { page: pageNumber, limit: limitNumber, count: result.rows.length },
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications',
    });
  }
});

// Mark notification read
router.post('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE forum_notifications
       SET read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found',
      });
    }

    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    logger.error('Error updating notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update notification',
    });
  }
});

export default router;

