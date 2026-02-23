/**
 * Vercel serverless handler: forwards all /api/* (except /api/auth) to the Express API.
 * NextAuth handles /api/auth/* via app/api/auth/[...nextauth]/route.ts
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import app from '@onestop/api';

export const config = {
  api: {
    bodyParser: false, // Let Express handle multipart/form-data for document uploads
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Don't forward auth routes - NextAuth handles those
  if (req.url?.startsWith('/api/auth')) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  return app(req, res);
}
