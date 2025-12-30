import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';

// Configuration needed for ES Modules to handle paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Google Cloud Run sets the PORT environment variable. Default to 8080.
const PORT = process.env.PORT || 8080;

// 1. Security & Performance Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for simplicity with external images/scripts in this demo
  crossOriginEmbedderPolicy: false
}));
app.use(compression()); // Gzip compression for speed
app.use(morgan('combined')); // Robust request logging
app.use(express.json()); // Parse JSON bodies

// 2. Health Check Endpoint (Critical for Cloud Load Balancers)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 3. Serve Static Files (The React App)
// Vite builds to the 'dist' folder. We serve those files directly.
app.use(express.static(path.join(__dirname, 'dist')));

// 4. Handle Client-Side Routing (SPA Fallback)
// Any request that isn't an API call or a static file gets served index.html.
// This allows React Router to handle the URL.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 5. Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running securely on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});