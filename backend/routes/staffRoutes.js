const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const { protect } = require('../middleware/auth');

// @route GET /api/staff/profile
router.get('/profile', protect, async (req, res) => {
  const staff = await Staff.findById(req.staff._id).select('-password');
  if (!staff) return res.status(404).json({ message: 'Staff not found' });
  res.json(staff);
});

// @route PUT /api/staff/profile
router.put('/profile', protect, async (req, res) => {
  const staff = await Staff.findById(req.staff._id);
  if (!staff) return res.status(404).json({ message: 'Staff not found' });

  const {
    name, department, designation, qualification,
    specialization, experience, phone, subjects, classes
  } = req.body;

  staff.name = name || staff.name;
  staff.department = department || staff.department;
  staff.designation = designation || staff.designation;
  staff.qualification = qualification || staff.qualification;
  staff.specialization = specialization || staff.specialization;
  staff.experience = experience || staff.experience;
  staff.phone = phone || staff.phone;
  staff.subjects = subjects || staff.subjects;
  staff.classes = classes || staff.classes;

  if (req.body.password) {
    staff.password = req.body.password;
  }

  const updated = await staff.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    department: updated.department,
    designation: updated.designation,
    qualification: updated.qualification,
    specialization: updated.specialization,
    experience: updated.experience,
    phone: updated.phone,
    subjects: updated.subjects,
    classes: updated.classes,
    staffId: updated.staffId,
  });
});

// @route GET /api/staff/all (for admin)
router.get('/all', protect, async (req, res) => {
  const staffList = await Staff.find({}).select('-password');
  res.json(staffList);
});

module.exports = router;
