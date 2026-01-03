import api from './api';

// Authentication Services
export const authService = {
  // Get current user profile with attendance
  getMyProfile: async () => {
    const response = await api.get('/employees/me');
    return response.data;
  },

  // Update user profile (limited fields)
  updateMyProfile: async (data) => {
    const response = await api.put('/employees/me', data);
    return response.data;
  },

  // Get all employees (Admin only)
  getAllEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  // Create new employee (Admin only)
  createEmployee: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  // Get employee by ID (Admin only)
  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Update employee (Admin only)
  updateEmployee: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },
};

// Attendance Services
export const attendanceService = {
  // Get my attendance records
  getMyAttendance: async (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const response = await api.get(`/attendance/my${params.toString() ? '?' + params : ''}`);
    return response.data;
  },

  // Get all attendance records (Admin only)
  getAllAttendance: async (employeeId, month, year) => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const response = await api.get(`/attendance${params.toString() ? '?' + params : ''}`);
    return response.data;
  },

  // Mark attendance for today
  markAttendance: async (data) => {
    const response = await api.post('/attendance/mark', data);
    return response.data;
  },

  // Update attendance record (Admin only)
  updateAttendance: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  // Get attendance summary
  getAttendanceSummary: async () => {
    const response = await api.get('/attendance/summary/my');
    return response.data;
  },
};

// Leave Services
export const leaveService = {
  // Get my leave requests
  getMyLeaves: async (status) => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/leaves/my${params}`);
    return response.data;
  },

  // Apply for leave
  applyLeave: async (data) => {
    const response = await api.post('/leaves', data);
    return response.data;
  },

  // Get all leave requests (Admin only)
  getAllLeaves: async (status, employeeId) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (employeeId) params.append('employeeId', employeeId);
    const response = await api.get(`/leaves${params.toString() ? '?' + params : ''}`);
    return response.data;
  },

  // Update leave status (Admin only)
  updateLeaveStatus: async (id, data) => {
    const response = await api.put(`/leaves/${id}`, data);
    return response.data;
  },

  // Get leave statistics
  getLeaveStats: async () => {
    const response = await api.get('/leaves/stats/my');
    return response.data;
  },
};

// Payroll Services
export const payrollService = {
  // Get my payroll records (read-only for employees)
  getMyPayroll: async () => {
    const response = await api.get('/payroll/my');
    return response.data;
  },

  // Get all payroll records (Admin only)
  getAllPayroll: async () => {
    const response = await api.get('/payroll');
    return response.data;
  },

  // Create payroll record (Admin only)
  createPayroll: async (data) => {
    const response = await api.post('/payroll', data);
    return response.data;
  },

  // Update payroll record (Admin only)
  updatePayroll: async (id, data) => {
    const response = await api.put(`/payroll/${id}`, data);
    return response.data;
  },

  // Get payroll summary
  getPayrollSummary: async () => {
    const response = await api.get('/payroll/summary/my');
    return response.data;
  },
};

// Dashboard Services
export const dashboardService = {
  // Get employee dashboard data
  getEmployeeDashboard: async () => {
    const response = await api.get('/dashboard/employee');
    return response.data;
  },

  // Get admin dashboard data
  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
};
