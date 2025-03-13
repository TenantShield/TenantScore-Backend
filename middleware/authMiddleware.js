const jwt = require('jsonwebtoken');

/**
 * Middleware function to authenticate JWT tokens.
 * Extracts the token from the `Authorization` header, verifies it, 
 * and attaches the decoded user information to `req.user`.
 *
 * Also checks the user's role: admin, tenant, or landlord.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the pipeline.
 */
exports.authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden - Invalid token' });
    }

    req.user = user;

    // Check user role
    if (!user.role) {
      return res.status(403).json({ message: 'Forbidden - Role not assigned' });
    }

    req.isAdmin = user.role === 'admin';
    req.isTenant = user.role === 'tenant';
    req.isLandlord = user.role === 'landlord';

    next();
  });
};

/**
 * Middleware to ensure a user is authenticated (logged in).
 * Must be used after `authenticateToken`.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the pipeline.
 */
exports.ensureAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized - Please log in' });
  }
  next();
};

/**
 * Middleware to ensure the user is an admin.
 * Must be used after `authenticateToken`.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the pipeline.
 */
exports.ensureAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ message: 'Forbidden - Admin access required' });
  }
  next();
};

/**
 * Middleware to ensure the logged-in user is updating their own password.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
exports.ensureAccountOwner = (req, res, next) => {
  const loggedInUserId = req.user.userId; // Extracted from token
  const requestedUserId = parseInt(req.params.userId); // Extracted from route param

  if (!requestedUserId || loggedInUserId !== requestedUserId) {
      return res.status(403).json({ message: 'Forbidden - You can only update your own password' });
  }

  next();
};
