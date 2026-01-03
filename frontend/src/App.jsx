import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function AppRoutes() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{color: 'white', fontSize: '18px', fontWeight: 600}}>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login Page */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={isAdmin ? '/admin/dashboard' : '/employee/dashboard'} /> : <Login />}
      />

      {/* Employee Dashboard */}
      <Route
        path="/employee/dashboard"
        element={isAuthenticated && !isAdmin ? <EmployeeDashboard /> : <Navigate to="/login" />}
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/login" />}
      />

      {/* Root Redirect */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to={isAdmin ? '/admin/dashboard' : '/employee/dashboard'} /> : <Navigate to="/login" />}
      />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
