const express = require('express');
const router = express.Router();
const firebaseAuth = require('../middleware/firebaseAuth');
const devAuth = require('../middleware/devAuth');
const roleMiddleware = require('../middleware/role');
const {
  createEmployee,
  getMyProfile,
  updateMyProfile,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
} = require('../controllers/employeeController');

// Use devAuth in development, firebaseAuth in production
const auth = process.env.NODE_ENV === 'development' ? devAuth : firebaseAuth;

// Public routes (require auth but no specific role)
router.get('/me', auth, roleMiddleware(), getMyProfile);
router.put('/me', auth, roleMiddleware(), updateMyProfile);

// Admin routes
router.post('/', auth, roleMiddleware(['ADMIN']), createEmployee);
router.get('/', auth, roleMiddleware(['ADMIN']), getAllEmployees);
router.get('/:id', auth, roleMiddleware(['ADMIN']), getEmployeeById);
router.put('/:id', auth, roleMiddleware(['ADMIN']), updateEmployee);

module.exports = router;
