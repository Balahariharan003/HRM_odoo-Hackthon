const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// Employee self-service leave routes
router.post('/apply', authMiddleware, leaveController.applyLeave);
router.get('/my-leaves', authMiddleware, leaveController.getMyLeaves);
router.delete('/:leaveId', authMiddleware, leaveController.cancelLeave);

// Admin / HR Officer leave management routes
router.get('/requests', authMiddleware, checkRole(['Admin', 'HR_Officer']), leaveController.getAllLeaveRequests);
router.put('/:leaveId/approve', authMiddleware, checkRole(['Admin', 'HR_Officer']), leaveController.approveLeave);

module.exports = router;
