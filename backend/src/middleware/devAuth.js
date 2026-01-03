/**
 * Development-Only Authentication Middleware
 * 
 * This middleware allows testing without Firebase configuration.
 * 
 * SECURITY WARNING: ⚠️ ONLY USE IN DEVELOPMENT ⚠️
 * Remove or disable in production!
 * 
 * Usage:
 * - Include header: X-Firebase-UID: employee-firebase-uid-001
 * - Include header: X-Firebase-Email: test@company.com (optional)
 */

const devAuth = (req, res, next) => {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ 
      error: 'Dev auth only available in development mode' 
    });
  }

  // Get UID from custom header
  const uid = req.headers['x-firebase-uid'];
  
  if (!uid) {
    return res.status(400).json({ 
      error: 'Development mode: X-Firebase-UID header is required' 
    });
  }

  // Attach user data to request
  req.user = {
    firebaseUid: uid,
    email: req.headers['x-firebase-email'] || 'test@dayflow.com',
  };

  next();
};

module.exports = devAuth;
