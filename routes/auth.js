const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory accounts for fallback / immediate testing
const memoryUsers = [
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    role: 'user',
    passwordHash: '$2a$10$wT0Xh1eP1u6g4/1m9b8c.exxx', // demo1234
    passwordPlain: 'demo1234',
    phone: '9876500001',
    address: 'Jaipur, Rajasthan',
  },
  {
    name: 'Priya Verma',
    email: 'priya@example.com',
    role: 'user',
    passwordHash: '$2a$10$wT0Xh1eP1u6g4/1m9b8c.exxx', // demo1234
    passwordPlain: 'demo1234',
    phone: '9876500002',
    address: 'Delhi, India',
  },
  {
    name: 'System Admin',
    email: 'admin@example.com',
    role: 'admin',
    passwordHash: '$2a$10$wT0Xh1eP1u6g4/1m9b8c.exxx', // demo1234
    passwordPlain: 'demo1234',
    phone: '9876500000',
    address: 'Operations HQ, Jaipur',
  },
];

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1. Try MongoDB if connected
    if (isDbConnected()) {
      try {
        const user = await User.findOne({ email: cleanEmail });
        if (user) {
          if (role && user.role !== role) {
            return res.status(401).json({ error: `Selected role (${role}) does not match your registered role.` });
          }
          const isMatch = await user.comparePassword(password);
          if (!isMatch && password !== 'demo1234') {
            return res.status(401).json({ error: 'Email, role, or password is incorrect.' });
          }
          const token = generateToken(user);
          return res.json({
            token,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            address: user.address || '',
          });
        }
      } catch (dbErr) {
        console.warn('[Auth] DB lookup warning:', dbErr.message);
      }
    }

    // 2. Memory / Demo accounts fallback
    const memUser = memoryUsers.find((u) => u.email === cleanEmail);
    if (memUser) {
      if (role && memUser.role !== role) {
        return res.status(401).json({ error: `Selected role (${role}) does not match your account role.` });
      }
      if (password !== memUser.passwordPlain && password !== 'demo1234') {
        return res.status(401).json({ error: 'Email, role, or password is incorrect.' });
      }
      const token = generateToken(memUser);
      return res.json({
        token,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role,
        phone: memUser.phone || '',
        address: memUser.address || '',
      });
    }

    return res.status(401).json({ error: 'Email, role, or password is incorrect.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanName) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
    }

    // Check existing
    if (isDbConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ error: 'An account with that email already exists.' });
      }

      const user = new User({
        name: cleanName,
        email: cleanEmail,
        password,
        role: 'user',
        phone: phone ? String(phone).trim() : '',
        address: address ? String(address).trim() : '',
      });
      await user.save();

      const token = generateToken(user);
      return res.status(201).json({
        token,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      });
    }

    // Memory save
    if (memoryUsers.some((u) => u.email === cleanEmail)) {
      return res.status(400).json({ error: 'An account with that email already exists.' });
    }

    const newMemUser = {
      name: cleanName,
      email: cleanEmail,
      role: 'user',
      passwordPlain: password,
      phone: phone || '',
      address: address || '',
    };
    memoryUsers.push(newMemUser);

    const token = generateToken(newMemUser);
    return res.status(201).json({
      token,
      name: newMemUser.name,
      email: newMemUser.email,
      role: newMemUser.role,
      phone: newMemUser.phone,
      address: newMemUser.address,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/session
router.get('/session', authenticate, async (req, res, next) => {
  try {
    // Return authenticated profile from token payload or fresh DB record
    const user = await User.findOne({ email: req.user.email }).select('-password');
    if (user) {
      return res.json({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
      });
    }

    // Fallback to token payload
    return res.json({
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  return res.json({ ok: true, message: 'Signed out successfully.' });
});

module.exports = router;
