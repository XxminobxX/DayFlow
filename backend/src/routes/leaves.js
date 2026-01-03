const express = require('express');
const router = express.Router();
const firebaseAuth = require('../middleware/firebaseAuth');
const devAuth = require('../middleware/devAuth');
const roleMiddleware = require('../middleware/role');
const {
  getMyLeaves,
  applyLeave,
  getAllLeaves,
  updateLeaveStatus,
  getLeaveStats,
} = require('../controllers/leaveController');

// Use devAuth in development, firebaseAuth in production
const auth = process.env.NODE_ENV === 'development' ? devAuth : firebaseAuth;

// Employee routes
router.get('/my', auth, roleMiddleware(), getMyLeaves);
router.post('/', auth, roleMiddleware(), applyLeave);
router.get('/stats/my', auth, roleMiddleware(), getLeaveStats);

// Admin routes
router.get('/', auth, roleMiddleware(['ADMIN']), getAllLeaves);
router.put('/:id', auth, roleMiddleware(['ADMIN']), updateLeaveStatus);

module.exports = router;
