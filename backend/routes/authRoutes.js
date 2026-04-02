const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Please provide email and password' });

  const staff = await Staff.findOne({ email });
  if (!staff || !(await staff.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' });

  res.json({
    _id: staff._id,
    name: staff.name,
    email: staff.email,
    department: staff.department,
    designation: staff.designation,
    staffId: staff.staffId,
    token: generateToken(staff._id),
  });
});

// @route POST /api/auth/register (for admin / seeding purposes)
router.post('/register', async (req, res) => {
  const { name, email, password, department, designation, staffId } = req.body;
  const exists = await Staff.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Staff already exists' });

  const staff = await Staff.create({ name, email, password, department, designation, staffId });
  res.status(201).json({
    _id: staff._id,
    name: staff.name,
    email: staff.email,
    token: generateToken(staff._id),
  });
});

module.exports = router;
