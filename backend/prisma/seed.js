const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Delete existing data (in proper order due to foreign keys)
  await prisma.leaveRequest.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.payroll.deleteMany({});
  await prisma.employee.deleteMany({});
  console.log('✅ Cleared existing data');

  // ============================================================
  // CREATE EMPLOYEES
  // ============================================================

  const adminEmployee = await prisma.employee.create({
    data: {
      firebaseUid: 'admin-firebase-uid-001',
      role: 'ADMIN',
      firstName: 'John',
      lastName: 'Admin',
      email: 'admin@dayflow.com',
      phone: '+1-555-0001',
      address: '123 Admin Street, New York, NY 10001',
      employeeId: 'EMP001',
      jobTitle: 'HR Manager',
      department: 'Human Resources',
      dateOfJoining: new Date('2020-01-15'),
    },
  });
  console.log('✅ Created ADMIN employee:', adminEmployee.email);

  const employee1 = await prisma.employee.create({
    data: {
      firebaseUid: 'employee-firebase-uid-001',
      role: 'EMPLOYEE',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@dayflow.com',
      phone: '+1-555-0002',
      address: '456 Employee Ave, New York, NY 10002',
      employeeId: 'EMP002',
      jobTitle: 'Software Developer',
      department: 'Engineering',
      dateOfJoining: new Date('2022-03-20'),
    },
  });
  console.log('✅ Created EMPLOYEE 1:', employee1.email);

  const employee2 = await prisma.employee.create({
    data: {
      firebaseUid: 'employee-firebase-uid-002',
      role: 'EMPLOYEE',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@dayflow.com',
      phone: '+1-555-0003',
      address: '789 Worker Blvd, New York, NY 10003',
      employeeId: 'EMP003',
      jobTitle: 'Product Manager',
      department: 'Product',
      dateOfJoining: new Date('2021-07-10'),
    },
  });
  console.log('✅ Created EMPLOYEE 2:', employee2.email);

  // ============================================================
  // CREATE ATTENDANCE RECORDS
  // ============================================================

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Create 5 attendance records for employee1
  for (let i = 0; i < 5; i++) {
    const date = new Date(startOfMonth);
    date.setDate(date.getDate() + i);

    await prisma.attendance.create({
      data: {
        employeeId: employee1.id,
        date: date,
        status: i === 2 ? 'HALF_DAY' : 'PRESENT',
        checkInTime: new Date(date.setHours(9, 0, 0)),
        checkOutTime: new Date(date.setHours(18, 0, 0)),
        remarks: i === 2 ? 'Doctor appointment in afternoon' : null,
      },
    });
  }
  console.log('✅ Created attendance records for employee1');

  // Create 3 attendance records for employee2
  for (let i = 0; i < 3; i++) {
    const date = new Date(startOfMonth);
    date.setDate(date.getDate() + i);

    await prisma.attendance.create({
      data: {
        employeeId: employee2.id,
        date: date,
        status: i === 1 ? 'ABSENT' : 'PRESENT',
        checkInTime: new Date(date.setHours(9, 0, 0)),
        checkOutTime: new Date(date.setHours(18, 0, 0)),
        remarks: i === 1 ? 'Sick leave (not submitted through system)' : null,
      },
    });
  }
  console.log('✅ Created attendance records for employee2');

  // ============================================================
  // CREATE LEAVE REQUESTS
  // ============================================================

  // Pending leave request
  await prisma.leaveRequest.create({
    data: {
      employeeId: employee1.id,
      leaveType: 'PAID',
      startDate: new Date(today.getFullYear(), today.getMonth(), 10),
      endDate: new Date(today.getFullYear(), today.getMonth(), 12),
      numberOfDays: 3,
      reason: 'Vacation',
      status: 'PENDING',
    },
  });
  console.log('✅ Created PENDING leave request for employee1');

  // Approved leave request
  await prisma.leaveRequest.create({
    data: {
      employeeId: employee1.id,
      leaveType: 'SICK',
      startDate: new Date(today.getFullYear(), today.getMonth() - 1, 5),
      endDate: new Date(today.getFullYear(), today.getMonth() - 1, 6),
      numberOfDays: 2,
      reason: 'Medical checkup',
      status: 'APPROVED',
      approvedById: adminEmployee.id,
      approvalComments: 'Approved',
      approvalDate: new Date(today.getFullYear(), today.getMonth() - 1, 4),
    },
  });
  console.log('✅ Created APPROVED leave request for employee1');

  // Rejected leave request
  await prisma.leaveRequest.create({
    data: {
      employeeId: employee2.id,
      leaveType: 'UNPAID',
      startDate: new Date(today.getFullYear(), today.getMonth() - 2, 15),
      endDate: new Date(today.getFullYear(), today.getMonth() - 2, 20),
      numberOfDays: 5,
      reason: 'Personal reasons',
      status: 'REJECTED',
      approvedById: adminEmployee.id,
      approvalComments: 'Cannot approve at this time',
      approvalDate: new Date(today.getFullYear(), today.getMonth() - 2, 14),
    },
  });
  console.log('✅ Created REJECTED leave request for employee2');

  // ============================================================
  // CREATE PAYROLL RECORDS
  // ============================================================

  // Payroll for employee1
  await prisma.payroll.create({
    data: {
      employeeId: employee1.id,
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      baseSalary: 80000,
      allowances: 10000,
      deductions: 5000,
      grossSalary: 90000,
      netSalary: 85000,
      paymentStatus: 'PAID',
      paymentDate: new Date(),
    },
  });
  console.log('✅ Created payroll record for employee1');

  // Payroll for employee2
  await prisma.payroll.create({
    data: {
      employeeId: employee2.id,
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      baseSalary: 95000,
      allowances: 12000,
      deductions: 6000,
      grossSalary: 107000,
      netSalary: 101000,
      paymentStatus: 'PENDING',
    },
  });
  console.log('✅ Created payroll record for employee2');

  console.log('\n✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
