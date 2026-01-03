const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get my leave requests
 * GET /api/leaves/my
 * Auth: Required
 * Query: ?status=PENDING (optional filter)
 */
exports.getMyLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const employee = req.employee;

    let whereClause = { employeeId: employee.id };

    if (status) {
      whereClause.status = status;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: { approvedBy: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

/**
 * Apply for leave
 * POST /api/leaves
 * Auth: Required
 * Body: { leaveType, startDate, endDate, numberOfDays, reason, remarks }
 */
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, numberOfDays, reason, remarks } =
      req.body;
    const employee = req.employee;

    if (!leaveType || !startDate || !endDate || !numberOfDays || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        numberOfDays: parseFloat(numberOfDays),
        reason,
        remarks: remarks || null,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave: leaveRequest,
    });
  } catch (error) {
    console.error('Error applying leave:', error);
    res.status(500).json({ error: 'Failed to apply for leave' });
  }
};

/**
 * Get all leave requests (Admin only)
 * GET /api/leaves
 * Auth: Required, Role: ADMIN
 * Query: ?status=PENDING&employeeId=xxx
 */
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, employeeId } = req.query;

    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: { employee: true, approvedBy: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

/**
 * Approve or reject leave request (Admin only)
 * PUT /api/leaves/:id
 * Auth: Required, Role: ADMIN
 * Body: { status, approvalComments }
 */
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvalComments } = req.body;
    const admin = req.employee;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedById: admin.id,
        approvalComments: approvalComments || null,
        approvalDate: new Date(),
      },
      include: { employee: true, approvedBy: true },
    });

    res.json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leave: leaveRequest,
    });
  } catch (error) {
    console.error('Error updating leave:', error);
    res.status(500).json({ error: 'Failed to update leave request' });
  }
};

/**
 * Get leave statistics for dashboard
 * GET /api/leaves/stats/my
 * Auth: Required
 */
exports.getLeaveStats = async (req, res) => {
  try {
    const employee = req.employee;

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
    });

    const stats = {
      pending: leaveRequests.filter((l) => l.status === 'PENDING').length,
      approved: leaveRequests.filter((l) => l.status === 'APPROVED').length,
      rejected: leaveRequests.filter((l) => l.status === 'REJECTED').length,
      total: leaveRequests.length,
      approvedDays: leaveRequests
        .filter((l) => l.status === 'APPROVED')
        .reduce((sum, l) => sum + l.numberOfDays, 0),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    res.status(500).json({ error: 'Failed to fetch leave statistics' });
  }
};
