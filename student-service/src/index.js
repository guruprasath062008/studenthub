require('dotenv').config();
const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

// CORS: allow any origin so the Vercel frontend can call this Railway service
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[Student Service] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/students', studentRoutes);

// Root greeting / meta
app.get('/', (req, res) => {
  res.json({
    service: 'StudentHub Student API Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/students/health',
      stats: 'GET /api/students/stats',
      list: 'GET /api/students',
      single: 'GET /api/students/:id',
      create: 'POST /api/students',
      update: 'PUT /api/students/:id',
      delete: 'DELETE /api/students/:id'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found on Student API Service.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Student Service] Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred in Student API Service.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`  StudentHub Student API Service Running on Port ${PORT}  `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===================================================`);
});