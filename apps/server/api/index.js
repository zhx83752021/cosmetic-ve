// Vercel Serverless Function entry point
// This file handles all requests in Vercel environment

// Import the compiled Express app
// When Root Directory is set to 'apps/server', the paths are relative to that directory
// api/index.js -> ../dist/index.js points to apps/server/dist/index.js
import app from '../dist/index.js'

// Export for Vercel serverless
export default app
