// Vercel Serverless Function entry point
// This file handles all requests in Vercel environment

// Import the compiled Express app
import app from '../dist/index.js'

// Export for Vercel serverless
export default app
