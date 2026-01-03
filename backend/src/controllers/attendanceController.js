const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get my attendance records
 * GET /api/attendance/my
 * Auth: Required
 * Query: ?month=1&year=2026 (optional for filtering)
 */
exports.getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const employee = req.employee;

    let whereClause = { employeeId: employee.id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

/**
 * Get all attendance records (Admin only)
 * GET /api/attendance
 * Auth: Required, Role: ADMIN
 * Query: ?employeeId=xxx&month=1&year=2026
 */
exports.getAllAttendance = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;

    let whereClause = {};

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: { employee: true },
      orderBy: { date: 'desc' },
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

/**
 * Mark attendance for today
 * POST /api/attendance/mark
 * Auth: Required
 * Body: { status, checkInTime, checkOutTime, remarks }
 */
exports.markAttendance = async (req, res) => {
  try {
    const { status, checkInTime, checkOutTime, remarks } = req.body;
    const employee = req.employee;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance already marked for today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (existingAttendance) {
      return res
        .status(400)
        .json({ error: 'Attendance already marked for today' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        status: status || 'PRESENT',
        checkInTime: checkInTime ? new Date(checkInTime) : null,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
        remarks: remarks || null,
      },
    });

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance,
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

/**
 * Update attendance record (Admin only)
 * PUT /api/attendance/:id
 * Auth: Required, Role: ADMIN
 */
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkInTime, checkOutTime, remarks } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (checkInTime) updateData.checkInTime = new Date(checkInTime);
    if (checkOutTime) updateData.checkOutTime = new Date(checkOutTime);
    if (remarks !== undefined) updateData.remarks = remarks;

    const attendance = await prisma.attendance.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Attendance updated successfully',
      attendance,
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
};

/**
 * Get attendance summary for dashboard
 * GET /api/attendance/summary/my
 * Auth: Required
 */
exports.getAttendanceSummary = async (req, res) => {
  try {
    const employee = req.employee;
    const currentMonth = new Date();
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const summary = {
      present: attendance.filter((a) => a.status === 'PRESENT').length,
      absent: attendance.filter((a) => a.status === 'ABSENT').length,
      halfDay: attendance.filter((a) => a.status === 'HALF_DAY').length,
      leave: attendance.filter((a) => a.status === 'LEAVE').length,
      total: attendance.length,
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
};
