require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware configuration
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[Auth Service] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);

// Root greeting / meta
app.get('/', (req, res) => {
  res.json({
    service: 'StudentHub Auth Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/auth/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found on Auth Service.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Auth Service] Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred in Auth Service.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`  StudentHub Auth Service Running on Port ${PORT}  `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});
