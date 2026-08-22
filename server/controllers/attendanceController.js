const { Op } = require('sequelize');
const { Attendance, User, Profile } = require('../models');

// Helper to get formatted YYYY-MM-DD
const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get formatted HH:mm:ss
const getCurrentTime = () => {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * 1. checkIn
 * POST /api/attendance/check-in
 */
const checkIn = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const today = getTodayDate();
    const currentTime = getCurrentTime();

    // Check if attendance record already exists for today
    const existingAttendance = await Attendance.findOne({
      where: { userId, date: today },
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in' });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      userId,
      date: today,
      checkIn: currentTime,
      status: 'Present',
      location: req.body.location || null,
      notes: req.body.notes || null,
    });

    return res.status(201).json({
      message: 'Check-in successful',
      attendance,
    });
  } catch (error) {
    console.error('Error in checkIn:', error);
    return res.status(500).json({ message: 'Server error during check-in', error: error.message });
  }
};

/**
 * 2. checkOut
 * POST /api/attendance/check-out
 */
const checkOut = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const today = getTodayDate();
    const currentTime = getCurrentTime();

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      where: { userId, date: today },
    });

    if (!attendance) {
      return res.status(400).json({ message: 'Not checked in yet' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out' });
    }

    // Update checkOut time (hook will automatically calculate totalHours)
    attendance.checkOut = currentTime;
    if (req.body.notes) {
      attendance.notes = attendance.notes ? `${attendance.notes}; ${req.body.notes}` : req.body.notes;
    }
    if (req.body.location) {
      attendance.location = req.body.location;
    }

    await attendance.save();

    return res.status(200).json({
      message: 'Check-out successful',
      attendance,
    });
  } catch (error) {
    console.error('Error in checkOut:', error);
    return res.status(500).json({ message: 'Server error during check-out', error: error.message });
  }
};

/**
 * 3. getMyAttendance
 * GET /api/attendance/me
 */
const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { startDate, endDate, view } = req.query;

    let start = startDate;
    let end = endDate;

    if (!start || !end) {
      const now = new Date();
      if (view === 'daily') {
        start = getTodayDate();
        end = getTodayDate();
      } else if (view === 'weekly') {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        start = d.toISOString().split('T')[0];
        end = getTodayDate();
      } else if (view === 'monthly') {
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      } else {
        // Default past 30 days
        const d = new Date();
        d.setDate(d.getDate() - 30);
        start = d.toISOString().split('T')[0];
        end = getTodayDate();
      }
    }

    const records = await Attendance.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [start, end],
        },
      },
      order: [['date', 'DESC']],
    });

    // Summary calculation
    const summary = {
      totalDays: records.length,
      present: records.filter((r) => r.status === 'Present').length,
      absent: records.filter((r) => r.status === 'Absent').length,
      halfDay: records.filter((r) => r.status === 'Half-day').length,
      leave: records.filter((r) => r.status === 'Leave').length,
    };

    return res.status(200).json({
      records,
      summary,
    });
  } catch (error) {
    console.error('Error in getMyAttendance:', error);
    return res.status(500).json({ message: 'Server error fetching user attendance', error: error.message });
  }
};

/**
 * 4. getAllAttendance
 * GET /api/attendance (Admin / HR_Officer)
 */
const getAllAttendance = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { date, employeeId, department, status, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const whereAttendance = {};
    if (date) whereAttendance.date = date;
    if (status) whereAttendance.status = status;
    if (employeeId) whereAttendance.userId = employeeId;

    const profileWhere = {};
    if (department) profileWhere.department = department;

    const { count, rows } = await Attendance.findAndCountAll({
      where: whereAttendance,
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
      ],
      order: [['date', 'DESC']],
      limit: limitNum,
      offset,
    });

    const formattedRecords = rows.map((rec) => {
      const json = rec.toJSON();
      const prof = json.User?.profile;
      const fullName = prof ? `${prof.firstName || ''} ${prof.lastName || ''}`.trim() : '';
      return {
        ...json,
        employeeName: fullName || (json.User ? json.User.email : null),
        department: prof ? prof.department : null,
        employeeCode: json.User ? json.User.employeeId : null,
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
    console.error('Error in getAllAttendance:', error);
    return res.status(500).json({ message: 'Server error fetching all attendance', error: error.message });
  }
};

/**
 * 5. updateAttendance
 * PUT /api/attendance/:attendanceId (Admin / HR_Officer)
 */
const updateAttendance = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const attendanceId = req.params.attendanceId || req.params.id;
    const { checkIn, checkOut, status, notes, location, date } = req.body;

    const attendance = await Attendance.findByPk(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (date !== undefined) attendance.date = date;
    if (checkIn !== undefined) attendance.checkIn = checkIn;
    if (checkOut !== undefined) attendance.checkOut = checkOut;
    if (status !== undefined) attendance.status = status;
    if (notes !== undefined) attendance.notes = notes;
    if (location !== undefined) attendance.location = location;

    await attendance.save(); // save triggers hook to recalculate totalHours if checkIn/checkOut changed

    return res.status(200).json({
      message: 'Attendance record updated successfully',
      attendance,
    });
  } catch (error) {
    console.error('Error in updateAttendance:', error);
    return res.status(500).json({ message: 'Server error updating attendance', error: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  updateAttendance,
};
