const express = require('express');
const router = express.Router();
const firebaseAuth = require('../middleware/firebaseAuth');
const devAuth = require('../middleware/devAuth');
const roleMiddleware = require('../middleware/role');
const {
  getMyPayroll,
  getAllPayroll,
  createPayroll,
  updatePayroll,
  getPayrollSummary,
} = require('../controllers/payrollController');

// Use devAuth in development, firebaseAuth in production
const auth = process.env.NODE_ENV === 'development' ? devAuth : firebaseAuth;

// Employee routes
router.get('/my', auth, roleMiddleware(), getMyPayroll);
router.get('/summary/my', auth, roleMiddleware(), getPayrollSummary);

// Admin routes
router.get('/', auth, roleMiddleware(['ADMIN']), getAllPayroll);
router.post('/', auth, roleMiddleware(['ADMIN']), createPayroll);
router.put('/:id', auth, roleMiddleware(['ADMIN']), updatePayroll);

module.exports = router;
