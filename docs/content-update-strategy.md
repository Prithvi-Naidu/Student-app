# Content Update Strategy for Banking Resources

## How to Fetch Latest Info from Official Websites

### Approach 1: Manual Curation with Monitoring (Recommended)

#### Workflow:
1. **Initial Content Creation**
   - Research official bank websites manually
   - Document requirements, processes, fees
   - Create comprehensive articles
   - Store source URLs in database

2. **Automated Monitoring Service**
   - Periodically check source URLs for changes
   - Compare page content (hash-based or diff)
   - Flag articles that need review
   - Send notifications to admins

3. **Manual Review & Update**
   - Admin reviews flagged articles
   - Updates content based on changes
   - Updates `last_verified` date
   - Publishes updated version

### Implementation Example:

```typescript
// Monitoring service (apps/api/src/services/contentMonitor.ts)
import * as crypto from 'crypto';
import axios from 'axios';
import pool from '../config/database';

interface ContentCheck {
  resourceId: string;
  sourceUrl: string;
  lastHash: string;
  currentHash: string;
  hasChanged: boolean;
}

async function checkContentUpdates() {
  // Get all resources with source URLs
  const resources = await pool.query(
    'SELECT id, title, source_urls FROM banking_resources WHERE source_urls IS NOT NULL'
  );

  for (const resource of resources.rows) {
    for (const sourceUrl of resource.source_urls) {
      try {
        // Fetch current content
        const response = await axios.get(sourceUrl);
        const currentHash = crypto
          .createHash('sha256')
          .update(response.data)
          .digest('hex');

        // Get last known hash
        const lastCheck = await pool.query(
          'SELECT content_hash FROM content_checks WHERE resource_id = $1 AND source_url = $2 ORDER BY checked_at DESC LIMIT 1',
          [resource.id, sourceUrl]
        );

        if (lastCheck.rows.length > 0) {
          const lastHash = lastCheck.rows[0].content_hash;
          
          if (currentHash !== lastHash) {
            // Content has changed - flag for review
            await pool.query(
              `UPDATE banking_resources 
               SET needs_review = true, 
                   last_checked = CURRENT_TIMESTAMP 
               WHERE id = $1`,
              [resource.id]
            );
            
            // Log the change
            logger.info(`Content changed for resource ${resource.id}: ${resource.title}`);
          }
        }

        // Store current hash
        await pool.query(
          `INSERT INTO content_checks (resource_id, source_url, content_hash, checked_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (resource_id, source_url) 
           DO UPDATE SET content_hash = $3, checked_at = CURRENT_TIMESTAMP`,
          [resource.id, sourceUrl, currentHash]
        );
      } catch (error) {
        logger.error(`Error checking ${sourceUrl}:`, error);
      }
    }
  }
}
```

### Approach 2: RSS Feeds & Official APIs

Some banks provide:
- RSS feeds for news/updates
- Developer APIs (limited availability)
- Email newsletters

**Implementation:**
- Subscribe to bank RSS feeds
- Parse updates and flag related articles
- Use official APIs where available (requires partnerships)

### Approach 3: User-Reported Updates

**Implementation:**
- Add "Report Outdated Info" button on articles
- Users can submit reports
- Admins review and update content
- Reward users for helpful reports (points system)

## Recommended Database Schema Updates

```sql
-- Content monitoring table
CREATE TABLE IF NOT EXISTS content_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID REFERENCES banking_resources(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  content_hash VARCHAR(64), -- SHA-256 hash
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resource_id, source_url)
);

-- Add fields to banking_resources
ALTER TABLE banking_resources ADD COLUMN IF NOT EXISTS
  source_urls TEXT[],           -- Array of source URLs to monitor
  last_verified DATE,           -- Last manual verification date
  needs_review BOOLEAN DEFAULT false, -- Flag for admin review
  last_checked TIMESTAMP;       -- Last automated check

-- Index for monitoring queries
CREATE INDEX IF NOT EXISTS idx_banking_resources_needs_review 
  ON banking_resources(needs_review) WHERE needs_review = true;
```

## Practical Implementation Steps

### Step 1: Create Article Detail Page
- Dynamic route: `/banking/[slug]`
- Fetch article from API
- Render rich content
- Display metadata and sources

### Step 2: Add Sample Content
- Create "How to Open a Bank Account Without SSN" article
- Include comprehensive guide
- Add source URLs
- Set up proper formatting

### Step 3: Implement Content Monitoring (Optional)
- Create monitoring service
- Schedule periodic checks
- Admin notification system

### Step 4: Admin Interface (Future)
- Content management dashboard
- Review flagged articles
- Update content easily

