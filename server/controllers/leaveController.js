const { Op } = require('sequelize');
const { Leave, User, Profile } = require('../models');
const { createNotification } = require('../utils/notifications');

/**
 * 1. applyLeave
 * POST /api/leave/apply
 */
const applyLeave = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
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
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
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
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

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
          attributes: ['id', 'employeeId', 'email', 'role'],
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['firstName', 'lastName', 'department', 'designation'],
              where: department ? profileWhere : undefined,
              required: department ? true : false,
            },
          ],
        },
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'employeeId', 'email'],
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['firstName', 'lastName'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    const formattedRecords = rows.map((rec) => {
      const json = rec.toJSON();
      const prof = json.User?.profile;
      const fullName = prof ? `${prof.firstName || ''} ${prof.lastName || ''}`.trim() : '';

      const appProf = json.Approver?.profile;
      const appFullName = appProf ? `${appProf.firstName || ''} ${appProf.lastName || ''}`.trim() : '';

      return {
        ...json,
        employeeName: fullName || (json.User ? json.User.email : null),
        department: prof ? prof.department : null,
        employeeCode: json.User ? json.User.employeeId : null,
        approverName: appFullName || (json.Approver ? json.Approver.email : null),
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
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const leaveId = req.params.leaveId || req.params.id;
    const { action, status, comments, remarks } = req.body;

    const finalStatus = status || action || 'Approved';
    if (!['Approved', 'Rejected'].includes(finalStatus)) {
      return res.status(400).json({ message: 'Invalid status. Must be Approved or Rejected.' });
    }

    const leave = await Leave.findByPk(leaveId, {
      include: [{ model: User, attributes: ['id', 'employeeId', 'email'] }],
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Leave request has already been processed' });
    }

    const finalComments = comments || remarks || '';

    leave.status = finalStatus;
    const approverId = req.user?.userId || req.user?.id;
    if (approverId) {
      leave.approvedBy = approverId;
    }
    leave.approvedAt = new Date();
    if (finalComments) {
      leave.comments = finalComments;
    }

    await leave.save();

    // Trigger Notification
    const notificationType = finalStatus === 'Approved' ? 'leave_approved' : 'leave_rejected';
    const notificationTitle = finalStatus === 'Approved' ? 'Leave Request Approved' : 'Leave Request Rejected';
    const notificationMessage = `Your leave request from ${leave.startDate} to ${leave.endDate} has been ${finalStatus.toLowerCase()}.${finalComments ? ' Remarks: ' + finalComments : ''}`;

    try {
      await createNotification({
        userId: leave.userId,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        link: '/leave/my-leaves',
      });
    } catch (notifErr) {
      console.error('Error triggering notification:', notifErr.message);
    }

    return res.status(200).json({
      message: `Leave request ${finalStatus.toLowerCase()} successfully`,
      leave,
    });
  } catch (error) {
    console.error('Error in approveLeave:', error);
    return res.status(500).json({ message: 'Error processing leave request', error: error.message });
  }
};

/**
 * 5. cancelLeave
 * DELETE /api/leave/:leaveId
 */
const cancelLeave = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const leaveId = req.params.leaveId || req.params.id;

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
