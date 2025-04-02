const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const { sendLoginCredentials } = require('../utils/emailService'); // Import email function

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

const generateTempPassword = () => {
  return crypto.randomBytes(6).toString('hex'); // Generates a 12-character password
};

/**
 * Registers a new user by hashing the password and storing the user in the database.
 *
 * @param {Object} req - The Express request object containing `firstname`, `middlename`, `surname`, `email`, `password`, `phone`, and `role`.
 * @param {Object} res - The Express response object.
 */
exports.registerUser = async (req, res) => {
  const { firstname, middlename, surname, email, phone, role } = req.body;

  if (!firstname || !surname || !email || !role) {
    return res.status(400).json({ message: 'Firstname, surname, email, and role are required' });
  }

  if (!['landlord', 'tenant', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be "landlord", "tenant", or "admin"' });
  }

  try {
    const tempPassword = generateTempPassword(); // Generate a temporary password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const result = await db.query(
      `INSERT INTO users (firstname, middlename, surname, email, password_hash, phone, role, password_reset_required)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING id, firstname, surname, email, role, created_at`,
      [firstname, middlename, surname, email, hashedPassword, phone, role, true]
    );

    await sendLoginCredentials(email); // Send email with login details

    res.status(201).json({ message: 'User registered successfully. Login credentials sent via email.', user: result.rows[0], psswd: tempPassword });
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

    if (user.password_reset_required) {
      return res.status(403).json({ message: 'Password reset required. Please change your password before accessing the app.' });
    }

    // Generate JWT with role
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );

    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

//Password Coontrollers i.e 
//change password when forgotten
//change password when logged in
//reset password on first login after registration

/**
* Allows a user to change their password
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

/**
 * Force a user to change their password before logging in for the first time.
 *
 * This function is used when an admin creates a new account, and the user
 * is required to update their password before accessing the system.
 *
 * @route POST /api/auth/force-password-change
 * @param {string} req.body.email - The user's email address.
 * @param {string} req.body.newPassword - The new password to be set.
 * @returns {Object} JSON response indicating success or failure.
 *
 * Responses:
 * - 200: Password changed successfully.
 * - 400: Missing email/password, invalid password format, or password change not required.
 * - 404: User not found.
 * - 500: Internal server error.
 */
exports.forcePasswordChange = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  if (!isPasswordValid(newPassword)) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long and include a combination of lowercase, uppercase, number, and special character.',
    });
  }

  try {
    const result = await db.query('SELECT id, password_reset_required FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.password_reset_required) {
      return res.status(400).json({ message: 'Password change is not required' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1, password_reset_required = FALSE WHERE id = $2', [hashedPassword, user.id]);

    res.json({ message: 'Password changed successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};
