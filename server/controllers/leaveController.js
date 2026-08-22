const { Op } = require('sequelize');
const { Leave, User, Profile } = require('../models');

/**
 * 1. applyLeave
 * POST /api/leave/apply
 */
const applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveType, startDate, endDate, reason, halfDay, halfDaySession } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'leaveType, startDate, endDate, and reason are required' });
    }

    // Validate: endDate >= startDate
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'endDate must be greater than or equal to startDate' });
    }

    // Validate: reason min 10 chars
    if (typeof reason !== 'string' || reason.trim().length < 10) {
      return res.status(400).json({ message: 'reason must be at least 10 characters long' });
    }

    // Validate halfDaySession if halfDay is true
    const isHalfDay = Boolean(halfDay);
    if (isHalfDay && !halfDaySession) {
      return res.status(400).json({ message: 'halfDaySession is required when halfDay is true' });
    }

    // Calculate totalDays
    let totalDays = 0;
    if (isHalfDay) {
      totalDays = 0.5;
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      totalDays = Math.round(diffTime / (1000 * 3600 * 24)) + 1;
    }

    const leave = await Leave.create({
      userId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      halfDay: isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession : null,
      reason: reason.trim(),
      status: 'Pending',
    });

    return res.status(201).json({
      message: 'Leave request submitted successfully',
      leave,
    });
  } catch (error) {
    console.error('Error in applyLeave:', error);
    return res.status(500).json({ message: 'Server error applying for leave', error: error.message });
  }
};

/**
 * 2. getMyLeaves
 * GET /api/leave/my-leaves
 */
const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, year } = req.query;

    const where = { userId };

    if (status && status !== 'All') {
      where.status = status;
    }

    if (year) {
      const startOfYear = `${year}-01-01`;
      const endOfYear = `${year}-12-31`;
      where.startDate = {
        [Op.gte]: startOfYear,
        [Op.lte]: endOfYear,
      };
    }

    const leaves = await Leave.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    const balance = {
      paid: 12,
      sick: 10,
      unpaid: 0,
    };

    return res.status(200).json({
      leaves,
      records: leaves,
      balance,
    });
  } catch (error) {
    console.error('Error in getMyLeaves:', error);
    return res.status(500).json({ message: 'Server error fetching user leaves', error: error.message });
  }
};

/**
 * 3. getAllLeaveRequests
 * GET /api/leave/requests (Admin / HR_Officer)
 */
const getAllLeaveRequests = async (req, res) => {
  try {
    const { status = 'Pending', department, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const whereLeave = {};
    if (status && status !== 'All') {
      whereLeave.status = status;
    }

    const profileWhere = {};
    if (department) {
      profileWhere.department = department;
    }

    const { count, rows } = await Leave.findAndCountAll({
      where: whereLeave,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role'],
          include: [
            {
              model: Profile,
              attributes: ['employeeId', 'department', 'designation'],
              where: department ? profileWhere : undefined,
              required: department ? true : false,
            },
          ],
        },
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    const formattedRecords = rows.map((rec) => {
      const json = rec.toJSON();
      return {
        ...json,
        employeeName: json.User ? json.User.name : null,
        department: json.User && json.User.Profile ? json.User.Profile.department : null,
        employeeCode: json.User && json.User.Profile ? json.User.Profile.employeeId : null,
        approverName: json.Approver ? json.Approver.name : null,
      };
    });

    return res.status(200).json({
      records: formattedRecords,
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error) {
    console.error('Error in getAllLeaveRequests:', error);
    return res.status(500).json({ message: 'Server error fetching leave requests', error: error.message });
  }
};

/**
 * 4. approveLeave
 * PUT /api/leave/:leaveId/approve (Admin / HR_Officer)
 */
const approveLeave = async (req, res) => {
  try {
    const leaveId = req.params.leaveId || req.params.id;
    const { action, comments } = req.body;

    const leave = await Leave.findByPk(leaveId);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Leave request has already been processed' });
    }

    const finalStatus = action === 'Rejected' ? 'Rejected' : 'Approved';

    leave.status = finalStatus;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    if (comments) leave.comments = comments;

    await leave.save();

    return res.status(200).json({
      message: `Leave request ${finalStatus.toLowerCase()} successfully`,
      leave,
    });
  } catch (error) {
    console.error('Error in approveLeave:', error);
    return res.status(500).json({ message: 'Server error approving/rejecting leave', error: error.message });
  }
};

/**
 * 5. cancelLeave
 * DELETE /api/leave/:leaveId
 */
const cancelLeave = async (req, res) => {
  try {
    const leaveId = req.params.leaveId || req.params.id;
    const userId = req.user.id;

    const leave = await Leave.findOne({
      where: {
        id: leaveId,
        userId,
        status: 'Pending',
      },
    });

    if (!leave) {
      return res.status(400).json({ message: 'Cannot cancel leave request' });
    }

    await leave.destroy();

    return res.status(200).json({
      message: 'Leave request cancelled successfully',
    });
  } catch (error) {
    console.error('Error in cancelLeave:', error);
    return res.status(500).json({ message: 'Server error cancelling leave', error: error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaveRequests,
  approveLeave,
  cancelLeave,
};
