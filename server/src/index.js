// ============================================================
// CPMS – Express App Entry Point (src/index.js)
// ============================================================

require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// ── Route imports ───────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const companyRoutes = require('./routes/companyRoutes');
const driveRoutes = require('./routes/driveRoutes');
const roundRoutes = require('./routes/roundRoutes');

// Future routes will be registered here as phases progress:
const trainingRoutes = require('./routes/trainingRoutes');
const mockTestRoutes = require('./routes/mockTestRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notifRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Serve local uploads (fallback when Cloudinary is not configured) ──
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'CPMS API is running 🚀' });
});

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/rounds', roundRoutes);

app.use('/api/training', trainingRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notifRoutes);

// ── Global error handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  CPMS Server listening on http://localhost:${PORT}`);
  console.log(`📋  Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
