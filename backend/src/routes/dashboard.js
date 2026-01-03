const express = require('express');
const router = express.Router();
const firebaseAuth = require('../middleware/firebaseAuth');
const devAuth = require('../middleware/devAuth');
const roleMiddleware = require('../middleware/role');
const {
  getEmployeeDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');

// Use devAuth in development, firebaseAuth in production
const auth = process.env.NODE_ENV === 'development' ? devAuth : firebaseAuth;

// Employee dashboard
router.get('/employee', auth, roleMiddleware(), getEmployeeDashboard);

// Admin dashboard
router.get('/admin', auth, roleMiddleware(['ADMIN']), getAdminDashboard);

module.exports = router;
