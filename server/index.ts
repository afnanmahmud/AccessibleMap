import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { connectToDatabase } from './config/db';
import userRoutes from './userRoutes';
import path from 'path';

console.log('Starting server...');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Setting up middleware...');

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: 'https://accessiblemap-gnddadh9ghbgc9e8.eastus-01.azurewebsites.net', // Updated to match the actual URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Serve static frontend files (from dist folder)
const staticPath = path.join(__dirname, 'dist');
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
  const indexPath = path.join(__dirname, 'dist', 'index.html');
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
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
