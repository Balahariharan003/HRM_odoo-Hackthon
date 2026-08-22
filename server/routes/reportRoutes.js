const express = require('express');
const router = express.Router();
const {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getDashboardAnalytics,
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

const adminOrHR = checkRole(['Admin', 'HR_Officer']);

router.get('/attendance', authMiddleware, adminOrHR, getAttendanceReport);
router.get('/leave', authMiddleware, adminOrHR, getLeaveReport);
router.get('/payroll', authMiddleware, adminOrHR, getPayrollReport);
router.get('/dashboard', authMiddleware, adminOrHR, getDashboardAnalytics);

module.exports = router;
