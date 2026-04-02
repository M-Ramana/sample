const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// @route GET /api/students
// Query params: class, subject
router.get('/', protect, async (req, res) => {
  const { class: cls, subject, department, year, section } = req.query;
  const filter = {};
  if (cls) filter.class = cls;
  else if (department && section) filter.class = `${department}-${section}`;
  if (subject) filter.subjects = subject;

  const students = await Student.find(filter).sort({ regNo: 1 });
  res.json(students);
});

// @route GET /api/students/classes
router.get('/classes', protect, async (req, res) => {
  const classes = await Student.distinct('class');
  res.json(classes);
});

// @route POST /api/students (bulk insert)
router.post('/', protect, async (req, res) => {
  const { students } = req.body;
  if (!students || !Array.isArray(students))
    return res.status(400).json({ message: 'Please provide an array of students' });

  const inserted = await Student.insertMany(students, { ordered: false });
  res.status(201).json({ inserted: inserted.length });
});

// @route GET /api/students/:id
router.get('/:id', protect, async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
});

module.exports = router;
