// Import required packages
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const pool = require('./db'); // Import our database connection
const logger = require('./logger'); // Import Winston logger


// Create Express application
const app = express();

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Add user information to socket object
      socket.user = {
        userId: decoded.userId,
        email: decoded.email,
        userType: decoded.userType
      };

      next();
    });
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(helmet()); // Add security headers
// CORS configuration for production
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(morgan('combined', { stream: logger.stream })); // Log HTTP requests through Winston
app.use(express.json()); // Parse JSON request bodies

// ============================================================================
// RATE LIMITING - Prevent abuse and DoS attacks
// ============================================================================

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 account creations per hour
  message: {
    success: false,
    error: 'Too many accounts created from this IP, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 password reset requests per 15 minutes
  message: {
    success: false,
    error: 'Too many password reset attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter - less strict for authenticated requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check and root endpoint
    return req.path === '/api/health' || req.path === '/';
  }
});

// Apply general rate limiter to all /api/* routes
app.use('/api/', apiLimiter);

// Basic route to test server is working
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MindBridge API',
    status: 'Server is running successfully'
  });
});

// Health check endpoint - useful for monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API endpoint to get mental health resources - NOW CONNECTED TO DATABASE!
app.get('/api/resources', async (req, res) => {
  try {
    // Query the database for resources
    const result = await pool.query('SELECT * FROM resources WHERE is_active = true ORDER BY urgency_level DESC');
    
    // Send the resources as JSON
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Database query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resources from database',
      timestamp: new Date().toISOString()
    });
  }
});

// Start the server
// Import bcrypt and jwt for authentication
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Import authentication middleware
const { authenticateToken, authorizeRoles } = require('./middleware/auth');

// User authentication endpoint
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Query database for user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const user = result.rows[0];

    // Use bcrypt to securely compare password with hashed password in database
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token for authenticated user
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType: user.user_type
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Return user info and JWT token (excluding password)
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// User registration endpoint
app.post('/api/auth/register', registerLimiter, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Determine user type based on email domain
    let userType = 'student';
    if (email.endsWith('@employee.kpu.ca')) {
      userType = 'counselor';
    } else if (email.endsWith('@admin.kpu.ca')) {
      userType = 'admin';
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token (32 bytes = 64 hex characters)
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Set token expiration to 24 hours from now
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Insert new user into database with verification fields
    const result = await pool.query(
      `INSERT INTO users (
        email, password_hash, first_name, last_name, user_type,
        is_email_verified, email_verification_token, verification_token_expires_at
       )
       VALUES ($1, $2, $3, $4, $5, FALSE, $6, $7)
       RETURNING id, email, first_name, last_name, user_type, is_email_verified`,
      [email, hashedPassword, firstName, lastName, userType, verificationToken, tokenExpiration]
    );

    const newUser = result.rows[0];

    // Generate JWT token for the new user
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        userType: newUser.user_type
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Generate verification URL
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    // Return user info and token
    // NOTE: In production, send verification link via email instead of returning it
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        userType: newUser.user_type,
        isEmailVerified: newUser.is_email_verified
      },
      // DEVELOPMENT ONLY - Remove in production
      verificationUrl: verificationUrl,
      message: 'Registration successful! Please verify your email address.',
      note: 'In production, verification link would be sent via email',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Email verification endpoint
app.get('/api/auth/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }

    // Find user with this verification token
    const result = await pool.query(
      `SELECT id, email, first_name, is_email_verified, verification_token_expires_at
       FROM users
       WHERE email_verification_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    const user = result.rows[0];

    // Check if email is already verified
    if (user.is_email_verified) {
      return res.json({
        success: true,
        message: 'Email already verified. You can log in now.',
        alreadyVerified: true
      });
    }

    // Check if token has expired
    if (new Date() > new Date(user.verification_token_expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'Verification token has expired. Please request a new one.',
        expired: true
      });
    }

    // Mark email as verified and clear the token
    await pool.query(
      `UPDATE users
       SET is_email_verified = TRUE,
           email_verification_token = NULL,
           verification_token_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id]
    );

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        email: user.email,
        firstName: user.first_name
      }
    });

  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
});

// Resend verification email endpoint
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, is_email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not (security)
      return res.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent'
      });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.is_email_verified) {
      return res.json({
        success: true,
        message: 'Email is already verified',
        alreadyVerified: true
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with new token
    await pool.query(
      `UPDATE users
       SET email_verification_token = $1,
           verification_token_expires_at = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [verificationToken, tokenExpiration, user.id]
    );

    // Generate verification URL
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    // In production, send email here
    res.json({
      success: true,
      message: 'Verification email sent successfully',
      // DEVELOPMENT ONLY - Remove in production
      verificationUrl: verificationUrl,
      note: 'In production, verification link would be sent via email'
    });

  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email'
    });
  }
});

// Password reset functionality - In-memory storage for reset codes
// NOTE: In production, use database table with expiration timestamps
const passwordResetCodes = new Map(); // email -> { code, expiresAt }

// Request password reset - generates and returns code
app.post('/api/auth/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if user exists
    const result = await pool.query(
      'SELECT id, email, first_name FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      // For security, don't reveal if email exists or not
      // But still return success to prevent email enumeration
      return res.json({
        success: true,
        message: 'If an account exists with this email, a reset code has been generated'
      });
    }

    const user = result.rows[0];

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code with 15-minute expiration
    passwordResetCodes.set(email, {
      code: resetCode,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      userId: user.id
    });

    // In production, send email here. For development, return code in response
    res.json({
      success: true,
      message: 'Password reset code generated',
      // DEVELOPMENT ONLY: Remove in production
      resetCode: resetCode,
      note: 'In production, this code would be sent via email'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Reset password with code
app.post('/api/auth/reset-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, reset code, and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if reset code exists and is valid
    const storedData = passwordResetCodes.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset code'
      });
    }

    // Check if code has expired
    if (Date.now() > storedData.expiresAt) {
      passwordResetCodes.delete(email);
      return res.status(400).json({
        success: false,
        error: 'Reset code has expired. Please request a new one'
      });
    }

    // Verify reset code
    if (storedData.code !== resetCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset code'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
      [hashedPassword, email]
    );

    // Remove used reset code
    passwordResetCodes.delete(email);

    res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Mood tracking endpoints
app.get('/api/mood/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Verify user is accessing their own data or is a counselor/admin
    if (req.user.userId !== parseInt(userId) &&
        req.user.userType !== 'counselor' &&
        req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own mood entries.'
      });
    }

    // Get mood entries for a specific user
    const result = await pool.query(
      'SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30',
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Mood fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mood entries'
    });
  }
});

// Enhanced mood entry endpoint with crisis detection
app.post('/api/mood', authenticateToken, async (req, res) => {
  try {
    const { userId, moodLevel, notes } = req.body;

    // Verify user is creating entry for themselves
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only create mood entries for yourself.'
      });
    }

    // Validate input
    if (!userId || !moodLevel || moodLevel < 1 || moodLevel > 5) {
      return res.status(400).json({
        success: false,
        error: 'User ID and mood level (1-5) are required'
      });
    }
    
    // Insert new mood entry
    const moodResult = await pool.query(
      'INSERT INTO mood_entries (user_id, mood_level, notes) VALUES ($1, $2, $3) RETURNING *',
      [userId, moodLevel, notes || null]
    );
    
    // Crisis detection analysis (if notes provided)
    let crisisAnalysis = null;
    if (notes && notes.trim().length > 0) {
      crisisAnalysis = analyzeCrisisText(notes);
      
      // If crisis detected, store alert in database
      if (crisisAnalysis.severity > 0) {
        await pool.query(
          'INSERT INTO crisis_alerts (user_id, alert_type, severity_level, description, status) VALUES ($1, $2, $3, $4, $5)',
          [userId, crisisAnalysis.alertType, crisisAnalysis.severity, crisisAnalysis.description, 'pending']
        );
        
        logger.warn(`CRISIS ALERT: User ${userId} - Severity ${crisisAnalysis.severity} - ${crisisAnalysis.alertType}`);
      }
    }
    
    res.json({
      success: true,
      data: moodResult.rows[0],
      crisisDetected: crisisAnalysis ? crisisAnalysis.severity > 0 : false,
      message: 'Mood entry added successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Mood entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add mood entry'
    });
  }
});

// Crisis detection function
function analyzeCrisisText(text) {
  const lowercaseText = text.toLowerCase();
  
  // Define crisis keywords and their severity levels
  const crisisKeywords = {
    critical: {
      keywords: ['suicide', 'kill myself', 'end it all', 'want to die', 'end my life', 'better off dead', 'nobody would miss me', 'say goodbye'],
      alertType: 'suicide_ideation',
      severity: 5
    },
    high: {
      keywords: ['hopeless', 'worthless', 'can\'t go on', 'nobody cares', 'hate myself', 'cut myself', 'hurt myself', 'ending everything'],
      alertType: 'self_harm',
      severity: 4
    },
    medium: {
      keywords: ['overwhelmed', 'panic attack', 'can\'t cope', 'anxiety attack', 'falling apart', 'breaking down'],
      alertType: 'severe_anxiety',
      severity: 3
    },
    low: {
      keywords: ['stressed', 'worried', 'anxious', 'sad', 'down', 'upset'],
      alertType: 'other',
      severity: 2
    }
  };
  
  let highestSeverity = 0;
  let detectedType = 'other';
  let detectedKeywords = [];
  
  // Check for crisis keywords
  for (const [level, config] of Object.entries(crisisKeywords)) {
    for (const keyword of config.keywords) {
      if (lowercaseText.includes(keyword)) {
        detectedKeywords.push(keyword);
        if (config.severity > highestSeverity) {
          highestSeverity = config.severity;
          detectedType = config.alertType;
        }
      }
    }
  }
  
  // Only create alerts for severity 3 and above (medium, high, critical)
  if (highestSeverity >= 3) {
    return {
      severity: highestSeverity,
      alertType: detectedType,
      keywords: detectedKeywords,
      description: `Crisis detected in mood entry: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}" | Keywords: ${detectedKeywords.join(', ')}`
    };
  }
  
  return { severity: 0, alertType: null, keywords: [], description: null };
}

// Get mood statistics for a user
app.get('/api/mood-stats/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Verify user is accessing their own data or is a counselor/admin
    if (req.user.userId !== parseInt(userId) &&
        req.user.userType !== 'counselor' &&
        req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own mood statistics.'
      });
    }

    // Get mood statistics
    const result = await pool.query(`
      SELECT 
        AVG(mood_level) as average_mood,
        COUNT(*) as total_entries,
        MAX(mood_level) as highest_mood,
        MIN(mood_level) as lowest_mood,
        DATE_TRUNC('day', created_at) as day,
        AVG(mood_level) as daily_average
      FROM mood_entries 
      WHERE user_id = $1 
      AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY day DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Mood stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mood statistics'
    });
  }
});

// Appointment endpoints
app.get('/api/appointments/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Verify user is accessing their own appointments or is an admin
    if (req.user.userId !== parseInt(userId) && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own appointments.'
      });
    }

    // Get appointments for a user (as student or counselor)
    const result = await pool.query(`
      SELECT 
        a.*,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        c.first_name as counselor_first_name,
        c.last_name as counselor_last_name
      FROM appointments a
      JOIN users s ON a.student_id = s.id
      JOIN users c ON a.counselor_id = c.id
      WHERE a.student_id = $1 OR a.counselor_id = $1
      ORDER BY a.appointment_date DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Appointments fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  }
});

// Create new appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { studentId, counselorId, appointmentDate, notes } = req.body;

    // Verify user is creating appointment for themselves (as student) or is a counselor/admin
    if (req.user.userId !== parseInt(studentId) &&
        req.user.userType !== 'counselor' &&
        req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Students can only book appointments for themselves.'
      });
    }

    // Validate input
    if (!studentId || !counselorId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        error: 'Student ID, counselor ID, and appointment date are required'
      });
    }
    
    // Insert new appointment
    const result = await pool.query(
      'INSERT INTO appointments (student_id, counselor_id, appointment_date, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [studentId, counselorId, appointmentDate, notes || null]
    );
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Appointment created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Appointment creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment'
    });
  }
});

// Update appointment status
app.put('/api/appointments/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const { status, notes } = req.body;

    // Only counselors and admins can update appointment status
    if (req.user.userType !== 'counselor' && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only counselors and admins can update appointments.'
      });
    }

    // Validate status
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: scheduled, completed, cancelled, or no_show'
      });
    }
    
    // Update appointment
    const result = await pool.query(
      'UPDATE appointments SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, notes, appointmentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Appointment updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Appointment update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment'
    });
  }
});

// Cancel appointment - allows students to cancel their own appointments
app.delete('/api/appointments/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const userId = req.user.userId;
    const userType = req.user.userType;

    // Get appointment details first
    const appointmentCheck = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [appointmentId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const appointment = appointmentCheck.rows[0];

    // Authorization: Students can cancel their own appointments, counselors/admins can cancel any
    if (userType === 'student' && appointment.student_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only cancel your own appointments'
      });
    }

    // Update appointment status to cancelled (soft delete)
    const result = await pool.query(
      `UPDATE appointments
       SET status = 'cancelled',
           notes = COALESCE(notes, '') || ' [Cancelled by ' || $1 || ' on ' || CURRENT_TIMESTAMP || ']',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [userType, appointmentId]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Appointment cancelled successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Appointment cancellation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment'
    });
  }
});

// Crisis Analytics API Endpoints

// Get active crisis alerts for counselor dashboard
app.get('/api/crisis/alerts', authenticateToken, authorizeRoles('counselor', 'admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ca.*,
        u.first_name,
        u.last_name,
        u.email,
        me.notes as mood_entry_text,
        me.mood_level,
        me.created_at as mood_entry_date
      FROM crisis_alerts ca
      JOIN users u ON ca.user_id = u.id
      LEFT JOIN mood_entries me ON ca.user_id = me.user_id 
        AND DATE(ca.created_at) = DATE(me.created_at)
        AND ABS(EXTRACT(EPOCH FROM (ca.created_at - me.created_at))) < 300
      ORDER BY ca.created_at DESC
    `);
    
    // Format the data for the counselor dashboard
    const formattedAlerts = result.rows.map(row => ({
      id: row.id,
      student: `${row.first_name} ${row.last_name}`,
      studentId: `10012${String(row.user_id).padStart(4, '0')}`,
      riskLevel: row.severity_level,
      category: row.alert_type,
      timestamp: row.created_at,
      status: row.status === 'pending' ? 'active' : row.status,
      text: row.mood_entry_text || 'No mood entry text available',
      aiAnalysis: {
        keywords: extractKeywordsFromDescription(row.description),
        sentiment: row.alert_type,
        confidence: 85 // Default confidence level
      },
      counselorAssigned: 'Dr. Sarah Mitchell',
      actionTaken: row.status === 'pending' ? 'pending' : 'appointment_scheduled',
      priority: row.severity_level >= 4 ? 'critical' : 'high'
    }));
    
    res.json({
      success: true,
      data: formattedAlerts,
      count: formattedAlerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Crisis alerts fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crisis alerts'
    });
  }
});

// Get crisis analytics summary for dashboard
app.get('/api/crisis/analytics', authenticateToken, authorizeRoles('counselor', 'admin'), async (req, res) => {
  try {
    // Get basic crisis statistics
    const totalAlertsResult = await pool.query(
      'SELECT COUNT(*) as total FROM crisis_alerts WHERE created_at >= NOW() - INTERVAL \'7 days\''
    );
    
    const todayAlertsResult = await pool.query(
      'SELECT COUNT(*) as today FROM crisis_alerts WHERE DATE(created_at) = CURRENT_DATE'
    );
    
    const activeAlertsResult = await pool.query(
      'SELECT COUNT(*) as active FROM crisis_alerts WHERE status = \'pending\''
    );
    
    // Get risk distribution
    const riskDistributionResult = await pool.query(`
      SELECT 
        severity_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
      FROM crisis_alerts 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY severity_level
      ORDER BY severity_level
    `);
    
    // Get trend data for last 7 days
    const trendDataResult = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        severity_level,
        COUNT(*) as count
      FROM crisis_alerts 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at), severity_level
      ORDER BY date DESC
    `);
    
    // Format risk distribution
    const riskDistribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    riskDistributionResult.rows.forEach(row => {
      const level = row.severity_level;
      if (level <= 2) riskDistribution.low = parseFloat(row.percentage);
      else if (level === 3) riskDistribution.medium = parseFloat(row.percentage);
      else if (level === 4) riskDistribution.high = parseFloat(row.percentage);
      else if (level === 5) riskDistribution.critical = parseFloat(row.percentage);
    });
    
    // Format trend data
    const trendData = [];
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    last7Days.forEach(date => {
      const dayData = { date, low: 0, medium: 0, high: 0, critical: 0 };
      trendDataResult.rows.forEach(row => {
        if (row.date.toISOString().split('T')[0] === date) {
          const level = row.severity_level;
          if (level <= 2) dayData.low += parseInt(row.count);
          else if (level === 3) dayData.medium += parseInt(row.count);
          else if (level === 4) dayData.high += parseInt(row.count);
          else if (level === 5) dayData.critical += parseInt(row.count);
        }
      });
      trendData.push(dayData);
    });
    
    res.json({
      success: true,
      data: {
        totalDetections: parseInt(totalAlertsResult.rows[0].total),
        todayDetections: parseInt(todayAlertsResult.rows[0].today),
        activeAlerts: parseInt(activeAlertsResult.rows[0].active),
        avgResponseTime: '8 minutes',
        successfulInterventions: 96.2,
        riskDistribution,
        trendData
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Crisis analytics fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crisis analytics'
    });
  }
});

// Helper function to extract keywords from description
function extractKeywordsFromDescription(description) {
  if (!description) return [];
  const keywordMatch = description.match(/Keywords: (.+)$/);
  return keywordMatch ? keywordMatch[1].split(', ') : [];
}
// Admin Crisis Analytics API Endpoints

// Get platform-wide crisis statistics for admin dashboard
app.get('/api/admin/crisis/statistics', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    // Get total crisis detections for current month
    const totalDetectionsResult = await pool.query(`
      SELECT COUNT(*) as total 
      FROM crisis_alerts 
      WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    
    // Get crisis detections for today
    const todayDetectionsResult = await pool.query(`
      SELECT COUNT(*) as today 
      FROM crisis_alerts 
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    // Get active alerts count
    const activeAlertsResult = await pool.query(`
      SELECT COUNT(*) as active 
      FROM crisis_alerts 
      WHERE status = 'pending'
    `);
    
    // Get resolved alerts for today
    const resolvedTodayResult = await pool.query(`
      SELECT COUNT(*) as resolved 
      FROM crisis_alerts 
      WHERE DATE(resolved_at) = CURRENT_DATE
    `);
    
    // Get average response time (simulated for now)
    const avgResponseTime = 12; // minutes - you can calculate this based on actual data later
    
    // Get risk level distribution
    const riskDistributionResult = await pool.query(`
      SELECT 
        severity_level,
        COUNT(*) as count
      FROM crisis_alerts 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY severity_level
    `);
    
    // Format risk distribution
    const riskDistribution = {
      critical: 0,
      high: 0, 
      medium: 0,
      low: 0
    };
    
    riskDistributionResult.rows.forEach(row => {
      const level = row.severity_level;
      if (level === 5) riskDistribution.critical = parseInt(row.count);
      else if (level === 4) riskDistribution.high = parseInt(row.count);
      else if (level === 3) riskDistribution.medium = parseInt(row.count);
      else if (level <= 2) riskDistribution.low += parseInt(row.count);
    });
    
    // Get 7-day trend data
    const trendDataResult = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        severity_level,
        COUNT(*) as count
      FROM crisis_alerts 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at), severity_level
      ORDER BY date DESC
    `);
    
    // Format trend data
    const trendData = [];
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    last7Days.forEach(date => {
      const dayData = { date, total: 0, critical: 0, high: 0, medium: 0, low: 0 };
      trendDataResult.rows.forEach(row => {
        if (row.date.toISOString().split('T')[0] === date) {
          const level = row.severity_level;
          const count = parseInt(row.count);
          dayData.total += count;
          if (level === 5) dayData.critical += count;
          else if (level === 4) dayData.high += count;
          else if (level === 3) dayData.medium += count;
          else if (level <= 2) dayData.low += count;
        }
      });
      trendData.push(dayData);
    });
    
    res.json({
      success: true,
      data: {
        totalDetections: parseInt(totalDetectionsResult.rows[0].total),
        todayDetections: parseInt(todayDetectionsResult.rows[0].today),
        activeAlerts: parseInt(activeAlertsResult.rows[0].active),
        resolvedToday: parseInt(resolvedTodayResult.rows[0].resolved),
        avgResponseTime: `${avgResponseTime} minutes`,
        counselorResponseRate: 98.5, // Can be calculated from actual data later
        emergencyEscalations: 0, // Can be tracked separately
        successfulInterventions: 94.7, // Can be calculated from resolved vs total
        riskDistribution,
        trendData
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Admin crisis statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin crisis statistics'
    });
  }
});

// Get platform statistics for admin dashboard
app.get('/api/admin/platform/statistics', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    // Get user counts by role
    const userStatsResult = await pool.query(`
      SELECT 
        user_type,
        COUNT(*) as count
      FROM users 
      WHERE is_active = true
      GROUP BY user_type
    `);
    
    // Get total users
    const totalUsersResult = await pool.query(`
      SELECT COUNT(*) as total FROM users WHERE is_active = true
    `);
    
    // Get total mood entries (as a proxy for sessions)
    const sessionsResult = await pool.query(`
      SELECT COUNT(*) as total FROM mood_entries
    `);
    
    // Get active resources count
    const resourcesResult = await pool.query(`
      SELECT COUNT(*) as total FROM resources WHERE is_active = true
    `);
    
    // Get crisis interventions count
    const interventionsResult = await pool.query(`
      SELECT COUNT(*) as total FROM crisis_alerts
    `);
    
    // Format user statistics
    let activeStudents = 0;
    let activeCounselors = 0;
    
    userStatsResult.rows.forEach(row => {
      if (row.user_type === 'student') activeStudents = parseInt(row.count);
      else if (row.user_type === 'counselor') activeCounselors = parseInt(row.count);
    });
    
    res.json({
      success: true,
      data: {
        totalUsers: parseInt(totalUsersResult.rows[0].total),
        activeStudents: activeStudents,
        activeCounselors: activeCounselors,
        monthlyGrowth: 12.5, // Can be calculated from user registration dates
        totalSessions: parseInt(sessionsResult.rows[0].total),
        resourcesAccessed: parseInt(resourcesResult.rows[0].total),
        crisisInterventions: parseInt(interventionsResult.rows[0].total),
        userSatisfaction: 4.7, // Would come from feedback system
        systemUptime: 99.8
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Platform statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform statistics'
    });
  }
});
// Import chat service
const chatService = require('./services/chatService');

// Store socket-to-user mappings
const socketUsers = new Map(); // socketId -> userId
const userSockets = new Map(); // userId -> socketId

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.debug('✓ New client connected:', socket.id);

  // User authentication and room joining
  socket.on('authenticate', async (data) => {
    logger.debug('🔐 Authenticate event received');
    try {
      // Use verified user information from socket.user (set by middleware)
      const { userId, userType } = socket.user;
      logger.debug('👤 Processing authentication for:', userId, userType);

      // Store socket-user mapping
      socketUsers.set(socket.id, { userId, userType });
      userSockets.set(userId, socket.id);

      logger.debug(`✅ User authenticated: ${userId} (${userType})`);

      // If peer supporter, update their online status
      if (userType === 'peer_supporter') {
        await chatService.updatePeerSupporterStatus(userId, true, socket.id);
        logger.debug(`Peer supporter ${userId} is now online`);
      }

      // Get or create active chat room
      let chatRoom = await chatService.getActiveChatRoom(userId);

      // If student and no active room, create one and try to match
      if (!chatRoom && userType === 'student') {
        // Create waiting room
        chatRoom = await chatService.createChatRoom(userId, null, true);
        logger.debug(`Created chat room ${chatRoom.id} for student ${userId}`);

        // Try to find available peer supporter
        const availablePeer = await chatService.findAvailablePeerSupporter();

        if (availablePeer) {
          // Assign peer supporter to room
          await chatService.assignPeerSupporter(chatRoom.id, availablePeer.id);
          chatRoom.peer_support_id = availablePeer.id;
          chatRoom.status = 'active';

          logger.debug(`Matched student ${userId} with peer supporter ${availablePeer.id}`);

          // Notify peer supporter of new chat
          const peerSocketId = userSockets.get(availablePeer.id);
          if (peerSocketId) {
            io.to(peerSocketId).emit('new_chat_assigned', {
              chatRoomId: chatRoom.id,
              studentId: userId
            });
          }
        }
      }

      if (chatRoom) {
        // Join socket room
        socket.join(`chat_${chatRoom.id}`);
        logger.debug(`📥 User ${userId} joined chat room ${chatRoom.id}`);

        // Get chat history
        const history = await chatService.getChatHistory(chatRoom.id);
        logger.debug(`📚 Retrieved ${history.length} messages from history`);

        const chatReadyData = {
          chatRoomId: chatRoom.id,
          status: chatRoom.status,
          isAnonymous: chatRoom.is_anonymous,
          history: history.map(msg => ({
            id: msg.id,
            message: msg.message,
            sender: msg.sender_id === userId ? 'me' : 'other',
            timestamp: msg.created_at
          }))
        };

        // Send chat room info and history
        logger.debug(`📤 Sending chat_ready to user ${userId}:`, chatReadyData);
        socket.emit('chat_ready', chatReadyData);

        // Mark messages as read
        await chatService.markMessagesAsRead(chatRoom.id, userId);
      } else {
        logger.debug(`⏳ No chat room for user ${userId}, sending waiting status`);
        socket.emit('chat_ready', {
          status: 'waiting',
          message: 'Waiting for available peer supporter...'
        });
      }

    } catch (error) {
      logger.error('❌ Authentication error:', error);
      logger.error('Error stack:', error.stack);
      socket.emit('error', { message: 'Authentication failed: ' + error.message });
    }
  });

  // Handle incoming chat messages
  socket.on('chat_message', async (data) => {
    try {
      // Verify user is authenticated (from middleware)
      if (!socket.user) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { userId } = socket.user;
      const { chatRoomId, message } = data;

      // Additional verification from socket mapping
      const userInfo = socketUsers.get(socket.id);
      if (!userInfo || userInfo.userId !== userId) {
        socket.emit('error', { message: 'Authentication mismatch' });
        return;
      }

      logger.debug(`💬 Message from user ${userId} in room ${chatRoomId}: ${message}`);

      // Save message to database
      const savedMessage = await chatService.saveMessage(chatRoomId, userId, message);
      logger.debug(`✅ Message saved to DB with ID: ${savedMessage.id}`);

      // Get all sockets in this room
      const socketsInRoom = await io.in(`chat_${chatRoomId}`).fetchSockets();
      logger.debug(`📢 Broadcasting to ${socketsInRoom.length} users in room`);

      // Send to each socket with correct sender designation
      socketsInRoom.forEach(recipientSocket => {
        const recipientInfo = socketUsers.get(recipientSocket.id);
        if (recipientInfo) {
          // Convert both to numbers to ensure proper comparison
          const recipientUserId = Number(recipientInfo.userId);
          const senderUserId = Number(userId);
          const isSender = recipientUserId === senderUserId;

          logger.debug(`  → Comparing: recipient=${recipientUserId} vs sender=${senderUserId} => isSender=${isSender}`);

          recipientSocket.emit('chat_message', {
            id: savedMessage.id,
            message: savedMessage.message,
            sender: isSender ? 'me' : 'other',
            senderId: savedMessage.sender_id,
            timestamp: savedMessage.created_at
          });
          logger.debug(`  → Sent to user ${recipientUserId} as '${isSender ? 'me' : 'other'}'`);
        }
      });

    } catch (error) {
      logger.error('Error handling chat message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle chat room closing
  socket.on('close_chat', async (data) => {
    try {
      const userInfo = socketUsers.get(socket.id);
      if (!userInfo) return;

      const { chatRoomId } = data;

      await chatService.closeChatRoom(chatRoomId);

      // Notify everyone in the room
      io.to(`chat_${chatRoomId}`).emit('chat_closed', {
        message: 'Chat session has ended'
      });

      logger.debug(`Chat room ${chatRoomId} closed`);

    } catch (error) {
      logger.error('Error closing chat:', error);
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const userInfo = socketUsers.get(socket.id);
    if (!userInfo) return;

    const { chatRoomId, isTyping } = data;

    // Broadcast typing status to others in the room
    socket.to(`chat_${chatRoomId}`).emit('user_typing', {
      isTyping,
      userId: userInfo.userId
    });
  });

  // Handle disconnect
  socket.on('disconnect', async (reason) => {
    const userInfo = socketUsers.get(socket.id);

    if (userInfo) {
      const { userId, userType } = userInfo;

      logger.debug(`✗ User ${userId} disconnected: ${reason}`);

      // If peer supporter, update their status to offline
      if (userType === 'peer_supporter') {
        await chatService.updatePeerSupporterStatus(userId, false, null);
        logger.debug(`Peer supporter ${userId} is now offline`);
      }

      // Clean up mappings
      socketUsers.delete(socket.id);
      userSockets.delete(userId);
    } else {
      logger.debug('✗ Client disconnected:', socket.id, '| Reason:', reason);
    }
  });

  // Send welcome message
  socket.emit('welcome', {
    message: 'Connected to MindBridge Socket.io server',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
});

// Start the server (use 'server' instead of 'app' for Socket.io support)
server.listen(PORT, () => {
  logger.debug(`MindBridge server is running on port ${PORT}`);
  logger.debug(`Visit http://localhost:${PORT} to see the welcome message`);
  logger.debug(`Socket.io server is ready for real-time connections`);
});