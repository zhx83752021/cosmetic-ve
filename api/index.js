// Vercel Serverless Function entry point
// This file handles all API requests in Vercel environment

// Import the compiled Express app
// After deployment preparation, this file is in /api/index.js
// and the compiled code is in /api/dist/index.js
import app from './dist/index.js'

// Export for Vercel serverless
export default app
