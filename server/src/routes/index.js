import express from 'express';
import authRoutes from './authRoutes.js';
import leadRoutes from './leadRoutes.js';

const router = express.Router();

// API version 1 routes
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
