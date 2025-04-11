import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { connectToDatabase } from './config/db';
import userRoutes from './userRoutes';
import path from 'path';

console.log('Starting server...');

const app = express();
// IMPORTANT: Use the PORT environment variable that Azure provides
// This is the critical fix for the EACCES: permission denied error
const PORT = process.env.PORT || 5000;
console.log(`Using port: ${PORT}`);

console.log('Setting up middleware...');

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for easier deployment testing
}));
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://accessiblemap-gnddadh9ghbgc9e8.eastus-01.azurewebsites.net'
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Serve static frontend files from the current directory
const staticPath = path.resolve(__dirname);
console.log(`Serving static files from: ${staticPath}`);
app.use(express.static(staticPath));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.status(200).json({ status: 'OK' });
});

// API Routes
console.log('Setting up API routes...');
app.use('/api/users', userRoutes);

// Catch-all route to serve frontend (SPA routing)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  console.log(`Serving index.html from: ${indexPath}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Server error');
    }
  });
});

// Start the server
const startServer = async () => {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connection successful');
    console.log('Starting server on port', PORT);
    
    // IMPORTANT: Use the PORT variable, don't hardcode port 80
    // This is where your code was failing with EACCES error
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    // Don't exit the process on error - this helps Azure recover
    console.error('Error details:', err);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process - this helps Azure recover
});

startServer();

// Export for external use
export { startServer };
