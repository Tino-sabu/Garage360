const express = require('express');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const router = express.Router();

// Password validation function
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 4) {
    return { isValid: false, message: 'Password must be at least 4 characters long' };
  }
  
  if (password.length > 12) {
    return { isValid: false, message: 'Password must be no more than 12 characters long' };
  }
  
  return { isValid: true };
};

// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and password are required'
      });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }
    
    // Check if user already exists across all tables
    const emailCheckQueries = [
      'SELECT email FROM customers WHERE email = $1',
      'SELECT email FROM managers WHERE email = $1', 
      'SELECT email FROM mechanics WHERE email = $1'
    ];
    
    const phoneCheckQueries = [
      'SELECT phone FROM customers WHERE phone = $1',
      'SELECT phone FROM managers WHERE phone = $1',
      'SELECT phone FROM mechanics WHERE phone = $1'
    ];
    
    // Check email uniqueness
    for (const emailQuery of emailCheckQueries) {
      const existingEmail = await query(emailQuery, [email]);
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }
    
    // Check phone uniqueness  
    for (const phoneQuery of phoneCheckQueries) {
      const existingPhone = await query(phoneQuery, [phone]);
      if (existingPhone.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this phone number already exists'
        });
      }
    }
    
    // Always insert new users into customers table
    const insertQuery = `
      INSERT INTO customers (name, email, phone, password, is_active, email_verified)
      VALUES ($1, $2, $3, $4, true, false)
      RETURNING customer_id as id, name, email, phone, created_at
    `;
    const insertParams = [name, email, phone, password];
    
    const result = await query(insertQuery, insertParams);
    const newUser = result.rows[0];
    newUser.role = 'customer'; // All registered users are customers
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email,
        role: 'customer'
      },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Customer account created successfully',
      data: {
        user: newUser,
        token: token
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user by email across all three tables
    let user = null;
    let userRole = null;
    
    // Check customers table
    const customerResult = await query(`
      SELECT customer_id as id, name, email, phone, password, is_active, email_verified
      FROM customers 
      WHERE email = $1
    `, [email]);
    
    if (customerResult.rows.length > 0) {
      user = customerResult.rows[0];
      userRole = 'customer';
    } else {
      // Check managers table
      const managerResult = await query(`
        SELECT manager_id as id, name, email, phone, password, is_active, email_verified
        FROM managers 
        WHERE email = $1
      `, [email]);
      
      if (managerResult.rows.length > 0) {
        user = managerResult.rows[0];
        userRole = 'manager';
      } else {
        // Check mechanics table
        const mechanicResult = await query(`
          SELECT mechanic_id as id, name, email, phone, password, is_active, email_verified, hourly_rate, specializations
          FROM mechanics 
          WHERE email = $1
        `, [email]);
        
        if (mechanicResult.rows.length > 0) {
          user = mechanicResult.rows[0];
          userRole = 'mechanic';
        }
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }
    
    // Verify password (direct comparison)
    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login based on user role
    const tableName = userRole === 'customer' ? 'customers' : userRole === 'manager' ? 'managers' : 'mechanics';
    const idColumn = userRole === 'customer' ? 'customer_id' : userRole === 'manager' ? 'manager_id' : 'mechanic_id';
    await query(`UPDATE ${tableName} SET last_login = CURRENT_TIMESTAMP WHERE ${idColumn} = $1`, [user.id]);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: userRole 
      },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: userPassword, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          ...userWithoutPassword,
          role: userRole
        },
        token: token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID, current password, and new password are required'
      });
    }
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }
    
    // Get current user from appropriate table based on userId
    let user = null;
    let userRole = null;
    let tableName = null;
    let idColumn = null;
    
    // Check customers table (IDs 200+)
    if (userId >= 200 && userId < 300) {
      const customerResult = await query('SELECT password FROM customers WHERE customer_id = $1', [userId]);
      if (customerResult.rows.length > 0) {
        user = customerResult.rows[0];
        userRole = 'customer';
        tableName = 'customers';
        idColumn = 'customer_id';
      }
    }
    // Check managers table (IDs 300+)
    else if (userId >= 300 && userId < 400) {
      const managerResult = await query('SELECT password FROM managers WHERE manager_id = $1', [userId]);
      if (managerResult.rows.length > 0) {
        user = managerResult.rows[0];
        userRole = 'manager';
        tableName = 'managers';
        idColumn = 'manager_id';
      }
    }
    // Check mechanics table (IDs 400+)
    else if (userId >= 400) {
      const mechanicResult = await query('SELECT password FROM mechanics WHERE mechanic_id = $1', [userId]);
      if (mechanicResult.rows.length > 0) {
        user = mechanicResult.rows[0];
        userRole = 'mechanic';
        tableName = 'mechanics';
        idColumn = 'mechanic_id';
      }
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password (direct comparison)
    if (currentPassword !== user.password) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password (store directly)
    await query(`
      UPDATE ${tableName} 
      SET password = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE ${idColumn} = $2
    `, [newPassword, userId]);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    req.user = user;
    next();
  });
};

// Get current user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    let user = null;
    let userRole = null;
    
    // Check customers table (IDs 200+)
    if (userId >= 200 && userId < 300) {
      const customerResult = await query(`
        SELECT customer_id as id, name, email, phone, is_active, email_verified, phone_verified, created_at, last_login
        FROM customers 
        WHERE customer_id = $1
      `, [userId]);
      if (customerResult.rows.length > 0) {
        user = customerResult.rows[0];
        userRole = 'customer';
      }
    }
    // Check managers table (IDs 300+)
    else if (userId >= 300 && userId < 400) {
      const managerResult = await query(`
        SELECT manager_id as id, name, email, phone, is_active, email_verified, phone_verified, created_at, last_login
        FROM managers 
        WHERE manager_id = $1
      `, [userId]);
      if (managerResult.rows.length > 0) {
        user = managerResult.rows[0];
        userRole = 'manager';
      }
    }
    // Check mechanics table (IDs 400+)
    else if (userId >= 400) {
      const mechanicResult = await query(`
        SELECT mechanic_id as id, name, email, phone, is_active, email_verified, phone_verified, created_at, last_login, hourly_rate, specializations
        FROM mechanics 
        WHERE mechanic_id = $1
      `, [userId]);
      if (mechanicResult.rows.length > 0) {
        user = mechanicResult.rows[0];
        userRole = 'mechanic';
      }
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...user,
        role: userRole
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

module.exports = { router, authenticateToken };