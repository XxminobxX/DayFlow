const { PrismaClient } = require('@prisma/client');
const admin = require('firebase-admin');
const prisma = new PrismaClient();

/**
 * Generate unique Employee ID
 * Format: EMP-YYYY-0001
 */
const generateEmployeeId = async () => {
  const year = new Date().getFullYear();
  const lastEmployee = await prisma.employee.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  });

  let nextNumber = 1;
  if (lastEmployee && lastEmployee.id) {
    const lastId = lastEmployee.id;
    const match = lastId.match(/EMP-\d+-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `EMP-${year}-${String(nextNumber).padStart(4, '0')}`;
};

/**
 * Generate temporary password
 * Format: 12 character alphanumeric
 */
const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Create new employee (Admin-only)
 * POST /api/employees
 * Auth: Admin only
 * Body: { firstName, lastName, email, phone, position, department, dateOfBirth, address }
 * Returns: { employeeId, firebaseUid, temporaryPassword }
 */
exports.createEmployee = async (req, res) => {
  try {
    // Verify admin
    if (req.employee.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can create employees' });
    }

    const { firstName, lastName, email, phone, position, department, dateOfBirth, address } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !position || !department) {
      return res.status(400).json({ 
        error: 'Missing required fields: firstName, lastName, email, phone, position, department' 
      });
    }

    // Check if email already exists in database
    const existingEmployee = await prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmployee) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Check if email already exists in Firebase
    try {
      await admin.auth().getUserByEmail(email);
      return res.status(409).json({ error: 'Email already exists in authentication system' });
    } catch (err) {
      // Expected - user should not exist
      if (err.code !== 'auth/user-not-found') {
        throw err;
      }
    }

    // Generate Employee ID and temporary password
    const employeeId = await generateEmployeeId();
    const temporaryPassword = generateTemporaryPassword();

    // Create Firebase user with temporary password
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email,
        password: temporaryPassword,
        displayName: `${firstName} ${lastName}`,
        disabled: false,
      });
    } catch (error) {
      console.error('Firebase user creation error:', error);
      return res.status(500).json({ error: 'Failed to create Firebase user: ' + error.message });
    }

    // Create employee in database with actual Firebase UID
    const newEmployee = await prisma.employee.create({
      data: {
        id: employeeId,
        firebaseUid: firebaseUser.uid,
        email,
        firstName,
        lastName,
        phone,
        position,
        department,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address || null,
        role: 'EMPLOYEE',
        createdAt: new Date(),
      },
    });

    // Return employee details with temporary credentials
    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        employeeId: newEmployee.id,
        firebaseUid: newEmployee.firebaseUid,
        email: newEmployee.email,
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        position: newEmployee.position,
      },
      credentials: {
        temporaryPassword,
        note: 'Employee must change password on first login. Share this securely with the employee.',
      },
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee: ' + error.message });
  }
};

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
