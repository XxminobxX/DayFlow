const admin = require('firebase-admin');

/**
 * Firebase Authentication Middleware
 * 
 * Verifies Firebase ID token from Authorization header.
 * Attaches firebaseUid to req.user if verification succeeds.
 * 
 * Expected header format: Authorization: Bearer <firebase_id_token>
 */
const firebaseAuth = async (req, res, next) => {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid Authorization header' 
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Attach firebaseUid to request context
    req.user = {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email || null,
    };

    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
};

module.exports = firebaseAuth;
