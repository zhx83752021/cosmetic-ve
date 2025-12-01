// Vercel Serverless Function entry point
// This file handles all API requests in Vercel environment

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔍 Serverless function starting...')
console.log('📂 __dirname:', __dirname)
console.log('📂 __filename:', __filename)
console.log('📂 process.cwd():', process.cwd())

// Check if dist/index.js exists
const distPath = join(__dirname, 'dist', 'index.js')
console.log('🔍 Looking for Express app at:', distPath)
console.log('📁 File exists:', existsSync(distPath))

let app

try {
  // Import the compiled Express app
  const module = await import('./dist/index.js')
  app = module.default
  console.log('✅ Express app loaded successfully')
  console.log('📝 App type:', typeof app)
} catch (error) {
  console.error('❌ Failed to load Express app:', error)
  console.error('Error name:', error.name)
  console.error('Error message:', error.message)
  console.error('Error stack:', error.stack)

  // Create a fallback error handler
  app = (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: error.message,
      errorName: error.name,
      distPath,
      fileExists: existsSync(distPath),
      __dirname,
      cwd: process.cwd(),
      stack: error.stack,
    })
  }
}

// Export for Vercel serverless
export default app
