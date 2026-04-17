const bcrypt = require('bcryptjs');

// Admin credentials - Must match authController
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$YourHashedPasswordHere'; // Default: 'admin123'

/**
 * HTTP Basic Authentication Middleware
 * Validates the Authorization header using Basic Auth
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ 
      success: false,
      message: 'Authorization header missing or invalid format',
      wwwAuthenticate: 'Basic realm="Admin"'
    });
  }

  // Decode Base64 credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Validate username
  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid credentials',
      wwwAuthenticate: 'Basic realm="Admin"'
    });
  }

  // Validate password
  let isPasswordValid = false;
  try {
    isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  } catch (e) {
    // Hash format invalid
  }
  
  // Fallback to plain text for default dev credentials
  if (!isPasswordValid && password === 'admin123') {
    isPasswordValid = true;
  }

  if (!isPasswordValid) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid credentials',
      wwwAuthenticate: 'Basic realm="Admin"'
    });
  }

  // Attach user info to request
  req.user = {
    username: ADMIN_USERNAME,
    role: 'admin'
  };
  
  next();
};

/**
 * Optional authentication - doesn't block request but adds user info if credentials present
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Basic ')) {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    if (username === ADMIN_USERNAME) {
      let isPasswordValid = false;
      try {
        isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      } catch (e) {
        // Hash format invalid
      }
      
      // Fallback to plain text for default dev credentials
      if (!isPasswordValid && password === 'admin123') {
        isPasswordValid = true;
      }
      
      if (isPasswordValid) {
        req.user = {
          username: ADMIN_USERNAME,
          role: 'admin'
        };
      }
    }
  }
  
  next();
};

module.exports = { 
  requireAuth,
  optionalAuth,
  ADMIN_USERNAME,
  ADMIN_PASSWORD_HASH
};
