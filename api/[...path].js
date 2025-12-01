// Vercel Serverless Function - Catch-all API handler
// This proxies all /api/* requests to the Express app

import app from '../apps/server/dist/index.js'

export default app
