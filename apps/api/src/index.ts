import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { connectRedis } from './config/redis';
import { attachUserContext } from './middleware/auth';

// Load environment variables
const repoRoot = path.resolve(__dirname, '..', '..', '..');
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, 'apps', 'api', '.env') });

const app = express();
const PORT = process.env.API_PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachUserContext);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
import listingsRouter from './routes/listings';
import housingRouter from './routes/housing';
import forumRouter from './routes/forum';
import bankingRouter from './routes/banking';
import documentsRouter from './routes/documents';
import surveysRouter from './routes/surveys';

app.get('/api', (req, res) => {
  res.json({ 
    message: 'OneStop Student Ecosystem API',
    version: '0.1.0'
  });
});

app.use('/api/listings', listingsRouter);
app.use('/api/housing', housingRouter);
app.use('/api/forum', forumRouter);
app.use('/api/banking', bankingRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/surveys', surveysRouter);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();
    
    app.listen(PORT, () => {
      logger.info(`🚀 API server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Don't start HTTP server when running on Vercel (serverless) or in tests
const shouldStartServer =
  process.env.NODE_ENV !== 'test' &&
  !process.env.JEST_WORKER_ID &&
  !process.env.VERCEL;

if (shouldStartServer) {
  startServer();
}

export default app;
