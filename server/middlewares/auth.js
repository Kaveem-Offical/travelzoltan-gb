/**
 * Mock Authentication Middleware
 * Validates an 'Authorization' header. For demonstration purposes,
 * any token that equals 'mock-admin-token' will be granted access.
 */
const mockAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Expected format: 'Bearer mock-admin-token'

  if (token === 'mock-admin-token') {
    // Admin is authenticated
    req.user = { role: 'admin' };
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden. Invalid token.' });
  }
};

module.exports = { mockAdminAuth };
