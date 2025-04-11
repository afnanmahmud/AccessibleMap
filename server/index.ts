import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { connectToDatabase } from './config/db';
import userRoutes from './userRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Add security headers
app.use(compression()); // Compress responses
app.use(cors({
  origin: 'https://accessiblemap-gnddadh9ghbgc9e8.eastus-01.azurewebsites.net', // Allow only your production frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Serve static frontend files (from dist folder)
app.use(express.static('../../dist'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// API Routes
app.use('/api/users', userRoutes);

// Catch-all route to serve frontend (SPA routing)
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: '../../dist' });
});

// Start the server
const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();