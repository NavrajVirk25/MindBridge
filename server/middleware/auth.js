const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT tokens
 * Protects routes from unauthorized access
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get token from Authorization header (format: "Bearer TOKEN")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer"

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    // Verify token using JWT_SECRET
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      // Add user information to request object for use in route handlers
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        userType: decoded.userType
      };

      next(); // Continue to the route handler
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
};

/**
 * Authorization middleware to check user roles
 * Use after authenticateToken to restrict access by user type
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
