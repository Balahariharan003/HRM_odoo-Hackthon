const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

// Route imports
// Module 1 Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Module 2 Routes
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');

// Module 3 Routes
const payrollRoutes = require('./routes/payrollRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// 1. CORS enabled for client
app.use(cors());

// 2. JSON body parser setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register Module 1 API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

// Register Module 2 API routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);

// Register Module 3 API routes
app.use('/api/payroll', payrollRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Dayflow HRMS Server Running' });
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Dayflow HRMS Server Running' });
});

// 4. Error handling middleware (LAST)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to sync database:', err);
  });
}
