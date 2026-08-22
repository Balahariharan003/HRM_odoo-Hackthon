const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// User self-service attendance routes
router.post('/check-in', authMiddleware, attendanceController.checkIn);
router.post('/check-out', authMiddleware, attendanceController.checkOut);
router.get('/me', authMiddleware, attendanceController.getMyAttendance);

// Admin / HR attendance management routes
router.get('/', authMiddleware, checkRole(['Admin', 'HR_Officer']), attendanceController.getAllAttendance);
router.put('/:attendanceId', authMiddleware, checkRole(['Admin', 'HR_Officer']), attendanceController.updateAttendance);

module.exports = router;
