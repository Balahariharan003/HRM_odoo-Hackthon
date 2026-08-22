const express = require('express');
const router = express.Router();
const {
  getMyPayroll,
  getAllPayroll,
  updateSalaryStructure,
  processMonthlyPayroll,
  downloadPayslip,
} = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// User's own payroll
router.get('/me', authMiddleware, getMyPayroll);

// Admin/HR endpoints
router.get('/', authMiddleware, checkRole(['Admin', 'HR_Officer']), getAllPayroll);
router.put('/:employeeId', authMiddleware, checkRole(['Admin', 'HR_Officer']), updateSalaryStructure);
router.post('/process', authMiddleware, checkRole(['Admin', 'HR_Officer']), processMonthlyPayroll);

// Payslip download / view
router.get('/payslip/:payrollId', authMiddleware, downloadPayslip);

module.exports = router;
