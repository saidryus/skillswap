const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ── Security headers (Helmet) ──────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-origin' },
  contentSecurityPolicy: isProd ? undefined : false, // relax CSP in dev
}));

// ── HTTPS redirect (production only) ──────────────────────────
if (isProd) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// ── CORS ───────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Body parsing with size limits ─────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── NoSQL injection sanitization ──────────────────────────────
app.use(mongoSanitize());

// ── General API rate limiter ───────────────────────────────────
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api', apiLimiter);

// ── Routes ─────────────────────────────────────────────────────
// Grade documents served through authenticated route only (not public static)
// See: /api/tutor-profiles/:id/document
app.use('/api/auth',             require('./routes/auth.routes'));
app.use('/api/users',            require('./routes/user.routes'));
app.use('/api/courses',          require('./routes/course.routes'));
app.use('/api/departments',      require('./routes/department.routes'));
app.use('/api/tutor-profiles',   require('./routes/tutorProfile.routes'));
app.use('/api/student-schedules',require('./routes/studentSchedule.routes'));
app.use('/api/sessions',         require('./routes/session.routes'));
app.use('/api/ratings',          require('./routes/rating.routes'));
app.use('/api/announcements',    require('./routes/announcement.routes'));
app.use('/api/notifications',    require('./routes/notification.routes'));
app.use('/api/settings',         require('./routes/settings.routes'));
app.use('/api/materials',        require('./routes/material.routes'));
app.use('/api/messages',         require('./routes/message.routes'));
app.use('/api/availability',     require('./routes/availability.routes'));
app.use('/api/curriculum',       require('./routes/curriculum.routes'));
app.use('/api/ml',               require('./routes/mlStatus.routes'));

// ── Error handling ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ── Start ──────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Acadia server running on port ${process.env.PORT}`);
      const { startExpiryScheduler } = require('./utils/docExpiry');
      startExpiryScheduler();
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
