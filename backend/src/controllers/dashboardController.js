const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get employee dashboard
 * GET /api/dashboard/employee
 * Auth: Required, Role: EMPLOYEE
 */
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const employee = req.employee;

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    // Get pending leave requests
    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId: employee.id,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get current month attendance summary
    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    const monthAttendance = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const attendanceSummary = {
      present: monthAttendance.filter((a) => a.status === 'PRESENT').length,
      absent: monthAttendance.filter((a) => a.status === 'ABSENT').length,
      halfDay: monthAttendance.filter((a) => a.status === 'HALF_DAY').length,
      leave: monthAttendance.filter((a) => a.status === 'LEAVE').length,
    };

    // Get current month payroll
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const currentPayroll = await prisma.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: employee.id,
          month: currentMonth,
          year: currentYear,
        },
      },
    });

    res.json({
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        jobTitle: employee.jobTitle,
        department: employee.department,
        profilePictureUrl: employee.profilePictureUrl,
      },
      todayAttendance: todayAttendance || null,
      attendanceSummary,
      pendingLeaves,
      currentPayroll: currentPayroll || null,
    });
  } catch (error) {
    console.error('Error fetching employee dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

/**
 * Get admin dashboard
 * GET /api/dashboard/admin
 * Auth: Required, Role: ADMIN
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get total employee count
    const totalEmployees = await prisma.employee.count();

    // Get employees count by role
    const adminCount = await prisma.employee.count({
      where: { role: 'ADMIN' },
    });

    const employeeCount = await prisma.employee.count({
      where: { role: 'EMPLOYEE' },
    });

    // Get today's attendance summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await prisma.attendance.findMany({
      where: { date: today },
    });

    const attendanceSummary = {
      present: todayAttendance.filter((a) => a.status === 'PRESENT').length,
      absent: todayAttendance.filter((a) => a.status === 'ABSENT').length,
      halfDay: todayAttendance.filter((a) => a.status === 'HALF_DAY').length,
      leave: todayAttendance.filter((a) => a.status === 'LEAVE').length,
    };

    // Get pending leave requests
    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get recent activity
    const recentLeaves = await prisma.leaveRequest.findMany({
      where: {
        NOT: { status: 'PENDING' },
      },
      include: { employee: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    // Get unpaid payroll count
    const unpaidPayroll = await prisma.payroll.count({
      where: { paymentStatus: 'PENDING' },
    });

    res.json({
      summary: {
        totalEmployees,
        admins: adminCount,
        employees: employeeCount,
      },
      attendance: {
        today: attendanceSummary,
        totalRecordsToday: todayAttendance.length,
      },
      leaves: {
        pending: pendingLeaves.length,
        recentLeaves,
        pendingRequests: pendingLeaves,
      },
      payroll: {
        unpaidCount: unpaidPayroll,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};
