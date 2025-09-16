module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['localhost:3000',
      'localhost:3001'
    ], // Add your image domains here
  },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY, // Gemini API key for AI functionality
  },
};