const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Role-Based Authorization Middleware
 * 
 * Fetches employee record using firebaseUid and verifies role.
 * Allows/denies access based on allowed roles.
 * 
 * Usage: roleMiddleware(['ADMIN']) or roleMiddleware(['ADMIN', 'EMPLOYEE'])
 */
const roleMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // firebaseUid should be set by firebaseAuth middleware
      if (!req.user || !req.user.firebaseUid) {
        return res.status(401).json({ 
          error: 'User not authenticated' 
        });
      }

      // Fetch employee record from database
      const employee = await prisma.employee.findUnique({
        where: { firebaseUid: req.user.firebaseUid },
      });

      if (!employee) {
        return res.status(404).json({ 
          error: 'Employee record not found' 
        });
      }

      // Check if employee role is in allowed roles
      if (allowedRoles.length > 0 && !allowedRoles.includes(employee.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions to access this resource' 
        });
      }

      // Attach employee object to request context
      req.employee = employee;

      next();
    } catch (error) {
      console.error('Role authorization error:', error.message);
      return res.status(500).json({ 
        error: 'Internal server error' 
      });
    }
  };
};

module.exports = roleMiddleware;
