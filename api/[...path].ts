import app from '../artifacts/api-server/src/app.js';

// Vercel invokes the Express app as a serverless function. The catch-all
// filename preserves the original /api/* request path for Express routing.
export default app;
