import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService, attendanceService, leaveService, payrollService } from '../services';
import { LogOut, Clock, Calendar, DollarSign } from 'lucide-react';
import '../styles/dashboard.css';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getEmployeeDashboard();
      setDashboard(data);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      window.location.href = '/login';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {user?.firstName || 'Employee'} 👋</h1>
          <p className="header-subtitle">Employee ID: <strong style={{color:'#121212'}}>{user?.id}</strong></p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <Clock size={18} /> Attendance
        </button>
        <button
          className={`tab ${activeTab === 'leaves' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          <Calendar size={18} /> Leaves
        </button>
        <button
          className={`tab ${activeTab === 'payroll' ? 'active' : ''}`}
          onClick={() => setActiveTab('payroll')}
        >
          <DollarSign size={18} /> Payroll
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab user={user} dashboard={dashboard} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab />
        )}
        {activeTab === 'leaves' && (
          <LeavesTab />
        )}
        {activeTab === 'payroll' && (
          <PayrollTab />
        )}
      </div>
    </div>
  );
}

function OverviewTab({ user, dashboard }) {
  return (
    <div className="cards-grid">
      <div className="stat-card">
        <div className="stat-icon" style={{background: '#e3f2fd'}}>
          <Clock size={24} color="#1976d2" />
        </div>
        <div className="stat-content">
          <h3>Attendance This Month</h3>
          <p className="stat-value">{dashboard?.attendanceThisMonth || 0} days</p>
          <p className="stat-label">Present</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{background: '#f3e5f5'}}>
          <Calendar size={24} color="#7b1fa2" />
        </div>
        <div className="stat-content">
          <h3>Leave Balance</h3>
          <p className="stat-value">{dashboard?.leaveBalance || 0} days</p>
          <p className="stat-label">Remaining</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{background: '#fff3e0'}}>
          <DollarSign size={24} color="#f57c00" />
        </div>
        <div className="stat-content">
          <h3>Last Salary</h3>
          <p className="stat-value">${dashboard?.lastSalary || '0.00'}</p>
          <p className="stat-label">Net Pay</p>
        </div>
      </div>
    </div>
  );
}

function AttendanceTab() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const data = await attendanceService.getMyAttendance();
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>My Attendance Records</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {attendance.length > 0 ? (
            attendance.map((record) => (
              <tr key={record.id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td><span className={`badge badge-${record.status.toLowerCase()}`}>{record.status}</span></td>
                <td>{record.checkInTime || '-'}</td>
                <td>{record.checkOutTime || '-'}</td>
                <td>{record.remarks || '-'}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" style={{textAlign: 'center'}}>No attendance records found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function LeavesTab() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const data = await leaveService.getMyLeaves();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="card" style={{marginBottom: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>My Leave Requests</h2>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Apply for Leave'}
          </button>
        </div>
      </div>

      {showForm && <LeaveFormComponent onSuccess={() => {loadLeaves(); setShowForm(false);}} />}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>From Date</th>
              <th>To Date</th>
              <th>Type</th>
              <th>Days</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td>{leave.leaveType}</td>
                  <td>{leave.numberOfDays}</td>
                  <td><span className={`badge badge-${leave.status.toLowerCase()}`}>{leave.status}</span></td>
                  <td>{leave.reason}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>No leave requests found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaveFormComponent({ onSuccess }) {
  const [formData, setFormData] = useState({
    leaveType: 'PAID',
    startDate: '',
    endDate: '',
    numberOfDays: '',
    reason: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await leaveService.applyLeave(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Apply for Leave</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="form-group">
            <label>Leave Type</label>
            <select name="leaveType" value={formData.leaveType} onChange={handleChange}>
              <option value="PAID">Paid Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
          </div>
          <div className="form-group">
            <label>Number of Days</label>
            <input type="number" name="numberOfDays" value={formData.numberOfDays} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label>Reason</label>
          <textarea name="reason" value={formData.reason} onChange={handleChange} required rows="3" />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Leave Request'}
        </button>
      </form>
    </div>
  );
}

function PayrollTab() {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    try {
      const data = await payrollService.getMyPayroll();
      setPayroll(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>My Payroll Records (Read-Only)</h2>
      <p style={{color: '#666', marginBottom: '16px', fontSize: '14px'}}>You can view your payroll information below. To make changes, please contact HR.</p>
      <table>
        <thead>
          <tr>
            <th>Month/Year</th>
            <th>Base Salary</th>
            <th>Allowances</th>
            <th>Deductions</th>
            <th>Net Salary</th>
          </tr>
        </thead>
        <tbody>
          {payroll.length > 0 ? (
            payroll.map((record) => (
              <tr key={record.id}>
                <td>{record.month}/{record.year}</td>
                <td>${parseFloat(record.baseSalary || 0).toFixed(2)}</td>
                <td>${parseFloat(record.allowances || 0).toFixed(2)}</td>
                <td>${parseFloat(record.deductions || 0).toFixed(2)}</td>
                <td style={{fontWeight: 'bold'}}>${parseFloat(record.netSalary || 0).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" style={{textAlign: 'center'}}>No payroll records found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
