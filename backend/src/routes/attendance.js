const express = require('express');
const router = express.Router();
const firebaseAuth = require('../middleware/firebaseAuth');
const devAuth = require('../middleware/devAuth');
const roleMiddleware = require('../middleware/role');
const {
  getMyAttendance,
  getAllAttendance,
  markAttendance,
  updateAttendance,
  getAttendanceSummary,
} = require('../controllers/attendanceController');

// Use devAuth in development, firebaseAuth in production
const auth = process.env.NODE_ENV === 'development' ? devAuth : firebaseAuth;

// Employee routes
router.get('/my', auth, roleMiddleware(), getMyAttendance);
router.post('/mark', auth, roleMiddleware(), markAttendance);
router.get('/summary/my', auth, roleMiddleware(), getAttendanceSummary);

// Admin routes
router.get('/', auth, roleMiddleware(['ADMIN']), getAllAttendance);
router.put('/:id', auth, roleMiddleware(['ADMIN']), updateAttendance);

module.exports = router;
