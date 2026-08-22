const express = require('express');
const cors = require('cors');

const payrollRoutes = require('./routes/payrollRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

// Register API routes
app.use('/api/payroll', payrollRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Dayflow HRMS API is running' });
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
