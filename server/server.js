const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const trackRoutes = require('./routes/tracks');
const hazardRoutes = require('./routes/hazards');
const routeRoutes = require('./routes/routes');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/hazards', hazardRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`\n🚢 True North Navigator API Server`);
  console.log(`📍 Running on http://localhost:${PORT}`);
  console.log(`⏰ Started at ${new Date().toLocaleString()}\n`);
});

// Handle port already in use error
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use.`);
    console.error(`\n💡 Solutions:`);
    console.error(`   1. Kill the process using the port:`);
    console.error(`      Windows: cmd //c "for /f "tokens=5" %a in ('netstat -ano ^| findstr :${PORT}') do taskkill /PID %a /F"`);
    console.error(`      Linux/Mac: lsof -ti:${PORT} | xargs kill -9`);
    console.error(`   2. Change the PORT in your .env file\n`);
    process.exit(1);
  } else {
    console.error(`\n❌ Server error:`, error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
