-- Forum enhancements: moderation, votes, notifications

-- Posts moderation fields
ALTER TABLE forum_posts
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active', -- active, locked, deleted
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

UPDATE forum_posts SET status = 'active' WHERE status IS NULL;

-- Comments moderation fields
ALTER TABLE forum_comments
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active', -- active, deleted
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

UPDATE forum_comments SET status = 'active' WHERE status IS NULL;

-- Post votes (per user)
CREATE TABLE IF NOT EXISTS forum_post_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (post_id, user_id)
);

-- Comment votes (per user)
CREATE TABLE IF NOT EXISTS forum_comment_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES forum_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (comment_id, user_id)
);

-- Notifications (reply/mention)
CREATE TABLE IF NOT EXISTS forum_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- recipient
  actor_id UUID, -- who triggered the notification
  type VARCHAR(50) NOT NULL, -- reply, mention
  entity_type VARCHAR(50) NOT NULL, -- post, comment
  entity_id UUID NOT NULL,
  message TEXT,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON forum_posts(status);
CREATE INDEX IF NOT EXISTS idx_forum_posts_updated_at ON forum_posts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_status ON forum_comments(status);
CREATE INDEX IF NOT EXISTS idx_forum_comments_created_at ON forum_comments(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_forum_post_votes_post_id ON forum_post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_votes_user_id ON forum_post_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_comment_votes_comment_id ON forum_comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_forum_comment_votes_user_id ON forum_comment_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_user_id ON forum_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_read_at ON forum_notifications(read_at);



