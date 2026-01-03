const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get current employee profile
 * GET /api/employees/me
 * Auth: Required (firebaseUid from middleware)
 */
exports.getMyProfile = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { firebaseUid: req.user.firebaseUid },
      include: {
        attendance: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Update employee profile (limited fields for employees, all fields for admins)
 * PUT /api/employees/me
 * Auth: Required
 * Body: { firstName, lastName, phone, address, profilePictureUrl }
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, profilePictureUrl } = req.body;

    // Employees can only update certain fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (profilePictureUrl) updateData.profilePictureUrl = profilePictureUrl;

    const updatedEmployee = await prisma.employee.update({
      where: { firebaseUid: req.user.firebaseUid },
      data: updateData,
    });

    res.json({
      message: 'Profile updated successfully',
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Get all employees (Admin only)
 * GET /api/employees
 * Auth: Required, Role: ADMIN
 */
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        attendance: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        payroll: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

/**
 * Get single employee details (Admin only)
 * GET /api/employees/:id
 * Auth: Required, Role: ADMIN
 */
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        attendance: {
          orderBy: { date: 'desc' },
        },
        leaveRequests: {
          orderBy: { createdAt: 'desc' },
        },
        payroll: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

/**
 * Update employee details (Admin only)
 * PUT /api/employees/:id
 * Auth: Required, Role: ADMIN
 */
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      jobTitle,
      department,
      role,
    } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (jobTitle) updateData.jobTitle = jobTitle;
    if (department) updateData.department = department;
    if (role) updateData.role = role;

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};
