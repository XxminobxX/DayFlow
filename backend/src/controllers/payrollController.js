const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get my payroll records
 * GET /api/payroll/my
 * Auth: Required
 * Query: ?month=1&year=2026 (optional)
 */
exports.getMyPayroll = async (req, res) => {
  try {
    const { month, year } = req.query;
    const employee = req.employee;

    let whereClause = { employeeId: employee.id };

    if (month && year) {
      whereClause.month = parseInt(month);
      whereClause.year = parseInt(year);
    }

    const payroll = await prisma.payroll.findMany({
      where: whereClause,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    res.json(payroll);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
};

/**
 * Get all payroll records (Admin only)
 * GET /api/payroll
 * Auth: Required, Role: ADMIN
 * Query: ?employeeId=xxx&month=1&year=2026
 */
exports.getAllPayroll = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;

    let whereClause = {};

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    if (month && year) {
      whereClause.month = parseInt(month);
      whereClause.year = parseInt(year);
    }

    const payroll = await prisma.payroll.findMany({
      where: whereClause,
      include: { employee: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    res.json(payroll);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
};

/**
 * Create/Update payroll record (Admin only)
 * POST /api/payroll
 * Auth: Required, Role: ADMIN
 * Body: { employeeId, month, year, baseSalary, allowances, deductions, grossSalary, netSalary, paymentStatus, remarks }
 */
exports.createPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
      baseSalary,
      allowances,
      deductions,
      grossSalary,
      netSalary,
      paymentStatus,
      remarks,
    } = req.body;

    if (!employeeId || !month || !year || !baseSalary) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if payroll already exists
    const existingPayroll = await prisma.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
    });

    if (existingPayroll) {
      return res
        .status(400)
        .json({ error: 'Payroll already exists for this month/year' });
    }

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        month: parseInt(month),
        year: parseInt(year),
        baseSalary: parseFloat(baseSalary),
        allowances: parseFloat(allowances) || 0,
        deductions: parseFloat(deductions) || 0,
        grossSalary: parseFloat(grossSalary),
        netSalary: parseFloat(netSalary),
        paymentStatus: paymentStatus || 'PENDING',
        remarks: remarks || null,
      },
    });

    res.status(201).json({
      message: 'Payroll created successfully',
      payroll,
    });
  } catch (error) {
    console.error('Error creating payroll:', error);
    res.status(500).json({ error: 'Failed to create payroll' });
  }
};

/**
 * Update payroll record (Admin only)
 * PUT /api/payroll/:id
 * Auth: Required, Role: ADMIN
 */
exports.updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      baseSalary,
      allowances,
      deductions,
      grossSalary,
      netSalary,
      paymentStatus,
      paymentDate,
      remarks,
    } = req.body;

    const updateData = {};
    if (baseSalary) updateData.baseSalary = parseFloat(baseSalary);
    if (allowances) updateData.allowances = parseFloat(allowances);
    if (deductions) updateData.deductions = parseFloat(deductions);
    if (grossSalary) updateData.grossSalary = parseFloat(grossSalary);
    if (netSalary) updateData.netSalary = parseFloat(netSalary);
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentDate) updateData.paymentDate = new Date(paymentDate);
    if (remarks !== undefined) updateData.remarks = remarks;

    const payroll = await prisma.payroll.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Payroll updated successfully',
      payroll,
    });
  } catch (error) {
    console.error('Error updating payroll:', error);
    res.status(500).json({ error: 'Failed to update payroll' });
  }
};

/**
 * Get current month payroll summary
 * GET /api/payroll/summary/my
 * Auth: Required
 */
exports.getPayrollSummary = async (req, res) => {
  try {
    const employee = req.employee;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const payroll = await prisma.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: employee.id,
          month: currentMonth,
          year: currentYear,
        },
      },
    });

    if (!payroll) {
      return res.status(404).json({ error: 'Payroll not found for current month' });
    }

    res.json(payroll);
  } catch (error) {
    console.error('Error fetching payroll summary:', error);
    res.status(500).json({ error: 'Failed to fetch payroll summary' });
  }
};
