const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Hardcoded credentials from .env
    if (username === process.env.ADMIN_USERNAME && 
        password === process.env.ADMIN_PASSWORD) {
      
      const token = jwt.sign(
        { 
          adminId: 'admin-user',
          username: username
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({ 
        success: true, 
        token,
        message: 'Login successful',
        adminId: 'admin-user'
      });
    }

    res.status(401).json({ error: 'Invalid username or password' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/verify - Verify token
router.post('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }

    const token = authHeader.split(' ');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({ valid: true, adminId: decoded.adminId });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
