const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { 
      name, email, password, role, employeeId, 
      phone, jobRole, department, techStack, managementLevel, 
      teamSize, specialization, certifications, staffType, workLocation 
    } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name, email, password, role, employeeId, 
      phone, jobRole, department, techStack, managementLevel, 
      teamSize, specialization, certifications, staffType, workLocation
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        employeeId: user.employeeId
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        const userObj = user.toObject();
        delete userObj.password;
        res.json({ token, user: userObj });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: 'Invalid credentials, it\'s not your role' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        employeeId: user.employeeId
      }
    };

    // Log the login event
    user.auditTrails.push({ action: 'Login', timestamp: new Date() });
    await user.save();

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        const userObj = user.toObject();
        delete userObj.password;
        res.json({ token, user: userObj });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.auditTrails.push({ action: 'Logout', timestamp: new Date() });
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
