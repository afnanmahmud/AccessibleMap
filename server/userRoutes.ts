import express, { Router } from 'express'; // Import Router type
import sql from 'mssql';
import { connectToDatabase } from './config/db';

// Explicitly type router as Router
const router: Router = express.Router();

// GET: Retrieve user profile
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    if (!username || username.length > 50) {
      return res.status(400).json({ message: 'Invalid username' });
    }
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST: Create or update user profile
router.post('/', async (req, res) => {
  const { username, email, highContrastMode } = req.body;
  if (!username || !email || typeof highContrastMode !== 'boolean') {
    return res.status(400).json({ message: 'Invalid input' });
  }
  if (username.length > 50 || email.length > 100) {
    return res.status(400).json({ message: 'Input exceeds maximum length' });
  }
  try {
    const pool = await connectToDatabase();
    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('highContrastMode', sql.Bit, highContrastMode)
      .query(`
        IF EXISTS (SELECT * FROM Users WHERE username = @username)
          UPDATE Users
          SET email = @email, highContrastMode = @highContrastMode
          WHERE username = @username
        ELSE
          INSERT INTO Users (username, email, highContrastMode)
          VALUES (@username, @email, @highContrastMode)
      `);
    res.status(200).json({ message: 'User profile saved' });
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;