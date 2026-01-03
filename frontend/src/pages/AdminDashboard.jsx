import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService, leaveService, dashboardService } from '../services';
import { LogOut, Users, FileText, CheckCircle } from 'lucide-react';
import '../styles/dashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      window.location.href = '/login';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, Admin 👋</h1>
          <p className="header-subtitle">Managing <strong style={{color:'#121212'}}>DayFlow HRMS</strong></p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <Users size={18} /> Employees
        </button>
        <button
          className={`tab ${activeTab === 'leaves' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          <FileText size={18} /> Leave Approvals
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && <AdminOverviewTab />}
        {activeTab === 'employees' && <EmployeesTab />}
        {activeTab === 'leaves' && <LeaveApprovalsTab />}
      </div>
    </div>
  );
}

function AdminOverviewTab() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getAdminDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="cards-grid">
      <div className="stat-card">
        <div className="stat-icon" style={{background: '#e3f2fd'}}>
          <Users size={24} color="#1976d2" />
        </div>
        <div className="stat-content">
          <h3>Total Employees</h3>
          <p className="stat-value">{dashboard?.totalEmployees || 0}</p>
          <p className="stat-label">Active Staff</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{background: '#fff3e0'}}>
          <FileText size={24} color="#f57c00" />
        </div>
        <div className="stat-content">
          <h3>Pending Approvals</h3>
          <p className="stat-value">{dashboard?.pendingApprovals || 0}</p>
          <p className="stat-label">Leave Requests</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{background: '#e8f5e9'}}>
          <CheckCircle size={24} color="#388e3c" />
        </div>
        <div className="stat-content">
          <h3>Present Today</h3>
          <p className="stat-value">{dashboard?.presentToday || 0}</p>
          <p className="stat-label">Checked In</p>
        </div>
      </div>
    </div>
  );
}

function EmployeesTab() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await authService.getAllEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setSuccessMessage('Employee created successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
    loadEmployees();
    setShowForm(false);
  };

  if (loading && !employees.length) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="card" style={{marginBottom: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Employee Management</h2>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Create Employee'}
          </button>
        </div>
      </div>

      {successMessage && <div className="success">{successMessage}</div>}
      {showForm && <CreateEmployeeForm onSuccess={handleSuccess} />}

      <div className="card">
        <h3>All Employees ({employees.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Position</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id}>
                  <td><strong>{emp.id}</strong></td>
                  <td>{emp.firstName} {emp.lastName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.position}</td>
                  <td>{emp.department}</td>
                  <td><span className="badge badge-approved">Active</span></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>No employees found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateEmployeeForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    dateOfBirth: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await authService.createEmployee(formData);
      setCredentials(response);
      setShowCredentials(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        dateOfBirth: '',
        address: ''
      });
      setTimeout(() => {
        onSuccess();
        setShowCredentials(false);
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Create New Employee</h3>
      <p style={{color: '#666', fontSize: '14px', marginBottom: '20px'}}>
        ⚠️ Only HR/Admin can create employees. A temporary password will be generated.
      </p>
      
      {error && <div className="error">{error}</div>}
      
      {showCredentials && credentials && (
        <div style={{background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '16px', marginBottom: '20px'}}>
          <h4 style={{marginTop: 0}}>✅ Employee Created Successfully!</h4>
          <div style={{background: 'white', padding: '12px', borderRadius: '4px', marginBottom: '12px', fontFamily: 'monospace'}}>
            <p><strong>Employee ID:</strong> {credentials.employee.employeeId}</p>
            <p><strong>Firebase UID:</strong> {credentials.employee.firebaseUid}</p>
            <p><strong>Email:</strong> {credentials.employee.email}</p>
            <p><strong>Temporary Password:</strong> <code style={{background: '#f0f0f0', padding: '4px 8px'}}>{credentials.credentials.temporaryPassword}</code></p>
          </div>
          <p style={{color: '#856404', fontSize: '13px', margin: 0}}>
            📋 {credentials.credentials.note}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="form-group">
            <label>First Name *</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Last Name *</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Position *</label>
            <input type="text" name="position" value={formData.position} onChange={handleChange} required placeholder="e.g., Software Engineer" />
          </div>
          <div className="form-group">
            <label>Department *</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} required placeholder="e.g., Engineering" />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{width: '100%', marginTop: '16px'}}>
          {loading ? 'Creating Employee...' : 'Create Employee & Generate Credentials'}
        </button>
      </form>
    </div>
  );
}

function LeaveApprovalsTab() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await leaveService.getAllLeaves('PENDING');
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load leave requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveService.updateLeaveStatus(id, {
        status: 'APPROVED',
        approvalComments: 'Approved by Admin'
      });
      loadLeaves();
    } catch (err) {
      alert('Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    try {
      await leaveService.updateLeaveStatus(id, {
        status: 'REJECTED',
        approvalComments: 'Rejected by Admin'
      });
      loadLeaves();
    } catch (err) {
      alert('Failed to reject leave');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="card">
      <h2>Leave Approval Requests</h2>
      {error && <div className="error">{error}</div>}
      
      {leaves.length === 0 ? (
        <p style={{color: '#666', textAlign: 'center', padding: '40px 0'}}>✅ No pending leave requests</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td>{leave.employee?.firstName} {leave.employee?.lastName}</td>
                <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                <td>{leave.leaveType}</td>
                <td>{leave.reason}</td>
                <td style={{display: 'flex', gap: '8px'}}>
                  <button
                    className="btn-primary"
                    onClick={() => handleApprove(leave.id)}
                    style={{padding: '6px 12px', fontSize: '12px'}}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => handleReject(leave.id)}
                    style={{padding: '6px 12px', fontSize: '12px'}}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
