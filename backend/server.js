const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/schedules', require('./routes/schedule.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/announcements', require('./routes/announcement.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/settings', require('./routes/settings.routes'));

// Seed route (only in non-production or when ENABLE_SEED is set)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SEED === 'true') {
  app.use('/api/seed', require('./routes/seed.routes'));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
