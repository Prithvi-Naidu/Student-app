import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const repoRoot = path.resolve(__dirname, '..', '..', '..');
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, 'apps', 'api', '.env') });

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5433'),
        database: process.env.POSTGRES_DB || 'onestop_db',
        user: process.env.POSTGRES_USER || 'onestop',
        password: process.env.POSTGRES_PASSWORD || 'onestop_dev_password',
      }
);

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    // Create migrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'schemas');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files`);

    // Execute each migration
    for (const file of files) {
      const checkResult = await client.query(
        'SELECT id FROM migrations WHERE filename = $1',
        [file]
      );

      if (checkResult.rows.length > 0) {
        console.log(`Skipping ${file} (already executed)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
      console.log(`✓ Executed ${file}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);

