const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

/**
 * Validates if a password meets the required criteria.
 *
 * @param {string} password - The password to validate.
 * @returns {boolean} True if the password is valid, otherwise false.
 */
const isPasswordValid = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+<>])[A-Za-z\d@$!%*?&#^()\-_=+<>]{6,}$/;
  return regex.test(password);
};

/**
 * Registers a new user by hashing the password and storing the user in the database.
 *
 * @param {Object} req - The Express request object containing `firstname`, `middlename`, `surname`, `email`, `password`, `phone`, and `role`.
 * @param {Object} res - The Express response object.
 */
exports.registerUser = async (req, res) => {
    const { firstname, middlename, surname, email, password, phone, role } = req.body;
  
    if (!firstname || !surname || !email || !password || !role) {
      return res.status(400).json({ message: 'Firstname, surname, email, password, and role are required' });
    }
  
    if (!['landlord', 'tenant', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "landlord", "tenant", or "admin"' });
    }
  
    if (!isPasswordValid(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 6 characters long and include a combination of lowercase, uppercase, number, and special character.',
      });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(
        `INSERT INTO users (firstname, middlename, surname, email, password_hash, phone, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, firstname, surname, email, role, created_at`,
        [firstname, middlename, surname, email, hashedPassword, phone, role]
      );
  
      res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ message: 'Email already registered' });
      }
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  };
  
  /**
   * Logs in a user by validating the email and password, and returns a JWT token if successful.
   *
   * @param {Object} req - The Express request object containing `email` and `password`.
   * @param {Object} res - The Express response object.
   */
  exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
  
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Generate JWT with role
      const token = jwt.sign(
        { userId: user.id, role: user.role }, // Include user role in the token
        process.env.JWT_SECRET,
        { expiresIn: '5h' }
      );
  
      res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  };
  
  /**
 * Updates a user's password.
 *
 * @param {Object} req - The Express request object containing `userId` from auth and `newPassword`.
 * @param {Object} res - The Express response object.
 */
exports.updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.userId; // Extracted from the token

  if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
  }

  if (!isPasswordValid(newPassword)) {
      return res.status(400).json({
          message: 'Password must be at least 6 characters long and include a combination of lowercase, uppercase, number, and special character.',
      });
  }

  try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);

      res.json({ message: 'Password updated successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};
