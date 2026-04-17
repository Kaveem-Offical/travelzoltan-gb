const bcrypt = require('bcryptjs');

// Admin credentials - In production, these should be in database
// For now, using environment variables with fallback defaults
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$YourHashedPasswordHere'; // Default: 'admin123'

/**
 * Validate credentials for Basic Auth
 * Used by client to verify credentials before storing
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Username and password are required' 
      });
    }

    // Check username
    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Validate password
    let isPasswordValid = false;
    
    // Try bcrypt comparison first
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
        message: 'Invalid credentials' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        username: ADMIN_USERNAME,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

/**
 * Verify Basic Auth credentials from Authorization header
 */
const verifyCredentials = async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ 
      success: false,
      valid: false,
      message: 'No credentials provided',
      wwwAuthenticate: 'Basic realm="Admin"'
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  
  // Check username
  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ 
      success: false,
      valid: false,
      message: 'Invalid credentials',
      wwwAuthenticate: 'Basic realm="Admin"'
    });
  }

  // Validate password
  let isPasswordValid = false;
  try {
    isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  } catch (e) {
    isPasswordValid = password === 'admin123';
  }

  if (!isPasswordValid) {
    return res.status(401).json({ 
      success: false,
      valid: false,
      message: 'Invalid credentials',
      wwwAuthenticate: 'Basic realm="Admin"'
    });
  }

  return res.status(200).json({
    success: true,
    valid: true,
    user: {
      username: ADMIN_USERNAME,
      role: 'admin'
    }
  });
};

// POST /api/admin/logout
const logout = async (req, res) => {
  // Basic Auth is stateless, client should clear stored credentials
  return res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

module.exports = {
  login,
  verifyCredentials,
  logout,
  ADMIN_USERNAME,
  ADMIN_PASSWORD_HASH
};
