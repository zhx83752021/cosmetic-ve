// Vercel Serverless Function entry point
// This file handles all API requests in Vercel environment

let app

try {
  // Import the compiled Express app
  const module = await import('./dist/index.js')
  app = module.default
  console.log('✅ Express app loaded successfully')
} catch (error) {
  console.error('❌ Failed to load Express app:', error)

  // Create a fallback error handler
  app = (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    })
  }
}

// Export for Vercel serverless
export default app
