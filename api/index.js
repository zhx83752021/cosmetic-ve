// Vercel Serverless Function entry point
// This file handles all API requests in Vercel environment

let app

try {
  // Import the compiled Express app
  // After deployment preparation, this file is in /api/index.js
  // and the compiled code is in /api/dist/index.js
  const module = await import('./dist/index.js')
  app = module.default
  console.log('✅ Express app loaded successfully')
} catch (error) {
  console.error('❌ Failed to load Express app:', error)
  console.error('Error stack:', error.stack)

  // Create a fallback error handler
  app = (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    })
  }
}

// Export for Vercel serverless
export default app
