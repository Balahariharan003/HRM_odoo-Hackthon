const { Payroll, User, Profile, Notification } = require('../models');
const { createNotification } = require('../utils/notifications');
const { Op } = require('sequelize');

/**
 * 1. getMyPayroll
 * Get current user's payroll record for given month/year (defaults to current month/year)
 */
const getMyPayroll = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const currentDate = new Date();
    const month = parseInt(req.query.month) || (currentDate.getMonth() + 1);
    const year = parseInt(req.query.year) || currentDate.getFullYear();

    const payroll = await Payroll.findOne({
      where: { userId, month, year },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role'],
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['employeeId', 'department', 'designation'],
            },
          ],
        },
      ],
    });

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found for this month' });
    }

    const payrollData = payroll.toJSON();
    payrollData.payslipUrl = `/api/payroll/payslip/${payroll.id}`;

    return res.status(200).json(payrollData);
  } catch (error) {
    console.error('Error in getMyPayroll:', error);
    return res.status(500).json({ message: 'Error retrieving payroll record', error: error.message });
  }
};

/**
 * 2. getAllPayroll
 * Admin/HR only — paginated payroll listing with filters for month, year, department
 */
const getAllPayroll = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.month) where.month = parseInt(req.query.month);
    if (req.query.year) where.year = parseInt(req.query.year);

    const profileWhere = {};
    if (req.query.department) {
      profileWhere.department = req.query.department;
    }

    const { count, rows } = await Payroll.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role'],
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['employeeId', 'department', 'designation'],
              where: Object.keys(profileWhere).length ? profileWhere : undefined,
              required: Object.keys(profileWhere).length > 0,
            },
          ],
        },
      ],
      limit,
      offset,
      order: [['year', 'DESC'], ['month', 'DESC'], ['createdAt', 'DESC']],
    });

    const formattedPayrolls = rows.map((p) => {
      const pData = p.toJSON();
      return {
        ...pData,
        employeeName: pData.User ? pData.User.name : 'N/A',
        employeeId: pData.User && pData.User.Profile ? pData.User.Profile.employeeId : 'N/A',
        department: pData.User && pData.User.Profile ? pData.User.Profile.department : 'N/A',
        payslipUrl: `/api/payroll/payslip/${pData.id}`,
      };
    });

    return res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      payrolls: formattedPayrolls,
    });
  } catch (error) {
    console.error('Error in getAllPayroll:', error);
    return res.status(500).json({ message: 'Error fetching payroll list', error: error.message });
  }
};

/**
 * 3. updateSalaryStructure
 * Admin/HR only — update employee salary structure and calculate/sync current payroll record
 */
const updateSalaryStructure = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { employeeId } = req.params;
    const { basic: inputBasic, hra: inputHra, allowances: inputAllowances, deductions: inputDeductions, effectiveDate } = req.body;

    let profile = await Profile.findOne({
      where: {
        [Op.or]: [{ employeeId }, { userId: employeeId }],
      },
      include: [{ model: User }],
    });

    if (!profile) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const basic = parseFloat(inputBasic || 0);
    const hra = parseFloat(inputHra || 0);
    const allowances = parseFloat(inputAllowances || 0);
    const deductions = inputDeductions || {};
    const tax = parseFloat(deductions.tax || 0);
    const pf = parseFloat(deductions.pf || 0);
    const insurance = parseFloat(deductions.insurance || 0);
    const otherDeductions = parseFloat(deductions.other || deductions.otherDeductions || 0);

    const grossSalary = parseFloat((basic + hra + allowances).toFixed(2));
    const totalDeductions = parseFloat((tax + pf + insurance + otherDeductions).toFixed(2));
    const netSalary = parseFloat((grossSalary - totalDeductions).toFixed(2));

    const salaryStructure = {
      basic,
      hra,
      allowances,
      deductions: { tax, pf, insurance, other: otherDeductions },
      effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
    };

    await profile.update({ salaryStructure });

    const effectiveDateObj = effectiveDate ? new Date(effectiveDate) : new Date();
    const month = effectiveDateObj.getMonth() + 1;
    const year = effectiveDateObj.getFullYear();

    let payroll = await Payroll.findOne({
      where: { userId: profile.userId, month, year },
    });

    if (!payroll) {
      payroll = await Payroll.create({
        userId: profile.userId,
        month,
        year,
        basic,
        hra,
        allowances,
        grossSalary,
        tax,
        pf,
        insurance,
        otherDeductions,
        totalDeductions,
        netSalary,
        paymentStatus: 'Pending',
      });
    } else {
      await payroll.update({
        basic,
        hra,
        allowances,
        grossSalary,
        tax,
        pf,
        insurance,
        otherDeductions,
        totalDeductions,
        netSalary,
      });
    }

    return res.status(200).json({
      message: 'Salary structure updated successfully',
      salaryStructure,
      payroll,
    });
  } catch (error) {
    console.error('Error in updateSalaryStructure:', error);
    return res.status(500).json({ message: 'Error updating salary structure', error: error.message });
  }
};

/**
 * 4. processMonthlyPayroll
 * Admin/HR only — batch process monthly payroll for all active employees based on standard rules
 */
const processMonthlyPayroll = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const currentDate = new Date();
    const month = parseInt(req.body.month) || (currentDate.getMonth() + 1);
    const year = parseInt(req.body.year) || currentDate.getFullYear();
    const todayStr = currentDate.toISOString().split('T')[0];

    const profiles = await Profile.findAll({
      where: { status: 'Active' },
      include: [{ model: User }],
    });

    let totalProcessed = 0;
    let totalPayout = 0;
    const errors = [];

    for (const profile of profiles) {
      try {
        const salary = profile.salaryStructure || {};
        const basic = parseFloat(salary.basic || 50000);
        const hra = parseFloat(salary.hra || 20000);
        const allowances = parseFloat(salary.allowances || 10000);
        const grossSalary = parseFloat((basic + hra + allowances).toFixed(2));

        const tax = parseFloat((salary.deductions?.tax ?? 0.10 * grossSalary).toFixed(2));
        const pf = parseFloat((salary.deductions?.pf ?? 0.12 * basic).toFixed(2));
        const insurance = parseFloat((salary.deductions?.insurance ?? 2000).toFixed(2));
        const otherDeductions = parseFloat((salary.deductions?.other || salary.deductions?.otherDeductions || 0).toFixed(2));

        const totalDeductions = parseFloat((tax + pf + insurance + otherDeductions).toFixed(2));
        const netSalary = parseFloat((grossSalary - totalDeductions).toFixed(2));

        let payroll = await Payroll.findOne({
          where: { userId: profile.userId, month, year },
        });

        if (!payroll) {
          payroll = await Payroll.create({
            userId: profile.userId,
            month,
            year,
            basic,
            hra,
            allowances,
            grossSalary,
            tax,
            pf,
            insurance,
            otherDeductions,
            totalDeductions,
            netSalary,
            paymentStatus: 'Processed',
            paymentDate: todayStr,
          });
        } else {
          await payroll.update({
            basic,
            hra,
            allowances,
            grossSalary,
            tax,
            pf,
            insurance,
            otherDeductions,
            totalDeductions,
            netSalary,
            paymentStatus: 'Processed',
            paymentDate: todayStr,
          });
        }

        // Auto-create notification using createNotification helper
        await createNotification({
          userId: profile.userId,
          type: 'payroll_processed',
          title: 'Payroll Processed',
          message: `Your payroll for ${month}/${year} has been processed. Net Salary: $${netSalary}`,
          link: `/payroll/payslip/${payroll.id}`,
        });

        totalProcessed++;
        totalPayout += netSalary;
      } catch (err) {
        console.error(`Error processing payroll for employee ${profile.employeeId}:`, err);
        errors.push({ employeeId: profile.employeeId, error: err.message });
      }
    }

    return res.status(200).json({
      message: `Monthly payroll processed for ${month}/${year}`,
      totalProcessed,
      totalPayout: parseFloat(totalPayout.toFixed(2)),
      errors,
    });
  } catch (error) {
    console.error('Error in processMonthlyPayroll:', error);
    return res.status(500).json({ message: 'Error processing monthly payroll', error: error.message });
  }
};

/**
 * 5. downloadPayslip
 * Fetch payslip data for a specific payroll record
 */
const downloadPayslip = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { payrollId } = req.params;

    const payroll = await Payroll.findByPk(payrollId, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role'],
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['employeeId', 'department', 'designation'],
            },
          ],
        },
      ],
    });

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const isOwner = payroll.userId === (req.user?.userId || req.user?.id);
    const isAdminOrHR = ['Admin', 'HR_Officer'].includes(req.user.role);

    if (!isOwner && !isAdminOrHR) {
      return res.status(403).json({ message: 'Access denied to this payslip' });
    }

    const payslipData = {
      payrollId: payroll.id,
      employeeName: payroll.User ? payroll.User.name : 'N/A',
      employeeId: payroll.User && payroll.User.Profile ? payroll.User.Profile.employeeId : 'N/A',
      department: payroll.User && payroll.User.Profile ? payroll.User.Profile.department : 'N/A',
      designation: payroll.User && payroll.User.Profile ? payroll.User.Profile.designation : 'N/A',
      month: payroll.month,
      year: payroll.year,
      earnings: {
        basic: payroll.basic,
        hra: payroll.hra,
        allowances: payroll.allowances,
        grossSalary: payroll.grossSalary,
      },
      deductions: {
        tax: payroll.tax,
        pf: payroll.pf,
        insurance: payroll.insurance,
        otherDeductions: payroll.otherDeductions,
        totalDeductions: payroll.totalDeductions,
      },
      netSalary: payroll.netSalary,
      paymentStatus: payroll.paymentStatus,
      paymentDate: payroll.paymentDate,
      downloadUrl: `/api/payroll/payslip/${payroll.id}`,
    };

    return res.status(200).json(payslipData);
  } catch (error) {
    console.error('Error in downloadPayslip:', error);
    return res.status(500).json({ message: 'Error downloading payslip', error: error.message });
  }
};

module.exports = {
  getMyPayroll,
  getAllPayroll,
  updateSalaryStructure,
  processMonthlyPayroll,
  downloadPayslip,
};
