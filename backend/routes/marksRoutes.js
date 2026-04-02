const express = require('express');
const router = express.Router();
const Marks = require('../models/Marks');
const TestMark = require('../models/TestMark');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// @route GET /api/marks?subject=&class=&auditNo=
router.get('/', protect, async (req, res) => {
  const { subject, class: cls, auditNo } = req.query;
  const filter = { staffId: req.staff._id };
  if (subject) filter.subject = subject;
  if (cls) filter.class = cls;
  if (auditNo) filter.auditNo = Number(auditNo);

  const marks = await Marks.find(filter).sort({ regNo: 1 });
  res.json(marks);
});

// @route POST /api/marks/bulk  — save/update marks for multiple students
router.post('/bulk', protect, async (req, res) => {
  const { marksData, subject, class: cls, auditNo } = req.body;
  if (!marksData || !Array.isArray(marksData))
    return res.status(400).json({ message: 'marksData must be an array' });

  const operations = marksData.map((m) => ({
    updateOne: {
      filter: {
        staffId: req.staff._id,
        studentId: m.studentId,
        subject,
        auditNo: Number(auditNo),
      },
      update: {
        $set: {
          regNo: m.regNo,
          studentName: m.studentName,
          class: cls,
          testMarks: Number(m.testMarks) || 0,
          assignmentMarks: Number(m.assignmentMarks) || 0,
          seminarMarks: Number(m.seminarMarks) || 0,
          quizMarks: Number(m.quizMarks) || 0,
        },
      },
      upsert: true,
    },
  }));

  const result = await Marks.bulkWrite(operations);
  res.json({ message: 'Marks saved successfully', result });
});

// @route GET /api/marks/summary - for reports
router.get('/summary', protect, async (req, res) => {
  const summary = await Marks.aggregate([
    { $match: { staffId: req.staff._id } },
    {
      $group: {
        _id: { subject: '$subject', class: '$class', auditNo: '$auditNo' },
        count: { $sum: 1 },
        avgTest: { $avg: '$testMarks' },
        avgAssignment: { $avg: '$assignmentMarks' },
        avgSeminar: { $avg: '$seminarMarks' },
        avgQuiz: { $avg: '$quizMarks' },
      },
    },
    { $sort: { '_id.auditNo': 1, '_id.subject': 1 } },
  ]);
  res.json(summary);
});

module.exports = router;

// @route GET /api/marks/test - get test marks
router.get('/test', protect, async (req, res) => {
  const { subject, department, year, section } = req.query;
  const marks = await TestMark.find({
    staffId: req.staff._id,
    subject,
    department,
    year,
    section
  });
  res.json(marks);
});

// @route POST /api/marks/test - bulk save test marks
router.post('/test', protect, async (req, res) => {
  const { subject, department, year, section, testDate, deadlineDate, marks } = req.body;
  if (!marks || !Array.isArray(marks))
    return res.status(400).json({ message: 'Marks array is required' });

  const operations = marks.map((m) => ({
    updateOne: {
      filter: {
        staffId: req.staff._id,
        subject,
        regNo: m.regNo,
        testDate
      },
      update: {
        $set: {
          department,
          year,
          section,
          deadlineDate,
          marks: Number(m.marks)
        }
      },
      upsert: true,
    }
  }));

  const result = await TestMark.bulkWrite(operations);
  res.json({ message: 'Test marks saved successfully', result });
});
