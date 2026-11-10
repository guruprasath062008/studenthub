const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if email already registered
    const existingUsers = await db.query('SELECT * FROM `users` WHERE `email` = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const assignedRole = role || 'faculty';

    // Insert user into database
    const result = await db.query(
      'INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, assignedRole]
    );

    const newUserId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: newUserId, name, email, role: assignedRole },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: newUserId,
        name,
        email,
        role: assignedRole
      }
    });
  } catch (err) {
    console.error('[Auth Controller] Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while registering user.'
    });
  }
}

/**
 * Authenticate existing user
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Lookup user by email
    const users = await db.query('SELECT * FROM `users` WHERE `email` = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const user = users[0];

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('[Auth Controller] Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing login.'
    });
  }
}

/**
 * Retrieve current authenticated user profile
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    const users = await db.query('SELECT id, name, email, role, created_at FROM `users` WHERE `id` = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (err) {
    console.error('[Auth Controller] getMe error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving user profile.'
    });
  }
}

/**
 * Health check endpoint
 * GET /api/auth/health
 */
function healthCheck(req, res) {
  return res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    storageMode: db.isFallbackMode() ? 'in-memory-fallback' : 'mysql-connected'
  });
}

module.exports = {
  register,
  login,
  getMe,
  healthCheck
};
