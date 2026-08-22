const { Leave, User } = require('../models');
const { createNotification } = require('../utils/notifications');

/**
 * approveLeave
 * Approves or rejects a leave request and triggers a notification for the employee
 */
const approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, remarks } = req.body; // status: 'Approved' | 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Approved or Rejected.' });
    }

    const leave = await Leave.findByPk(leaveId, {
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    await leave.update({ status });

    const notificationType = status === 'Approved' ? 'leave_approved' : 'leave_rejected';
    const notificationTitle = status === 'Approved' ? 'Leave Request Approved' : 'Leave Request Rejected';
    const notificationMessage = `Your leave request from ${leave.startDate} to ${leave.endDate} has been ${status.toLowerCase()}.${remarks ? ' Remarks: ' + remarks : ''}`;

    await createNotification({
      userId: leave.userId,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      link: '/leave/my-leaves',
    });

    return res.status(200).json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leave,
    });
  } catch (error) {
    console.error('Error in approveLeave:', error);
    return res.status(500).json({ message: 'Error processing leave request', error: error.message });
  }
};

module.exports = {
  approveLeave,
};
