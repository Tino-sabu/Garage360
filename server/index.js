const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, checkTablesExist } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    const tablesExist = await checkTablesExist();

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        tablesReady: tablesExist
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Garage360 API! 🚗⚙️',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      users: '/api/users/*',
      vehicles: '/api/vehicles/*',
      services: '/api/services/*',
      bookings: '/api/bookings/*'
    },
    documentation: 'Coming soon...'
  });
});

// Import and use route modules
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);
app.use('/api/users', require('./routes/users'));
app.use('/api/services', require('./routes/services'));
app.use('/api/service-requests', require('./routes/service-requests'));
app.use('/api/parts', require('./routes/parts'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/mechanics', require('./routes/mechanics'));
app.use('/api/cartypes', require('./routes/cartypes'));
app.use('/api/vehicles', require('./routes/vehicles'));
// app.use('/api/bookings', require('./routes/bookings'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  if (err.code === '23505') {
    // PostgreSQL unique violation
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry found',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Database constraint violation'
    });
  }

  if (err.code === '23503') {
    // PostgreSQL foreign key violation
    return res.status(400).json({
      success: false,
      message: 'Referenced record not found',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Foreign key constraint violation'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection first
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.log('⚠️  Starting server without database connection');
      console.log('💡 Make sure PostgreSQL is running and database is set up');
    }

    // Check if tables exist
    await checkTablesExist();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Garage360 API Server started!');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 Local: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    }).on('error', (err) => {
      console.error('❌ Server failed to start:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;