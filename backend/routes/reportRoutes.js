const express = require('express');
const router = express.Router();
const Audit = require('../models/Audit');
const Marks = require('../models/Marks');
const ResearchPaper = require('../models/ResearchPaper');
const { protect } = require('../middleware/auth');

// @route GET /api/reports - aggregate report for logged-in staff
router.get('/', protect, async (req, res) => {
  const staffId = req.staff._id;

  const [audits, marksSummary, papers] = await Promise.all([
    Audit.find({ staffId }),
    Marks.aggregate([
      { $match: { staffId } },
      {
        $group: {
          _id: { subject: '$subject', class: '$class', auditNo: '$auditNo' },
          totalStudents: { $sum: 1 },
          avgTest: { $avg: '$testMarks' },
          avgAssignment: { $avg: '$assignmentMarks' },
          avgSeminar: { $avg: '$seminarMarks' },
          avgQuiz: { $avg: '$quizMarks' },
        },
      },
      { $sort: { '_id.auditNo': 1 } },
    ]),
    ResearchPaper.find({ staffId }).select('title journal year semester fileName createdAt'),
  ]);

  // Audit status summary
  const auditStatus = {
    audit1: audits.find((a) => a.auditNo === 1) || { status: 'Pending' },
    audit2: audits.find((a) => a.auditNo === 2) || { status: 'Pending' },
    audit3: audits.find((a) => a.auditNo === 3) || { status: 'Pending' },
  };

  res.json({
    auditStatus,
    marksSummary,
    researchPapers: papers,
    counts: {
      auditsSubmitted: audits.filter((a) => a.status !== 'Pending').length,
      totalStudentsWithMarks: await Marks.distinct('studentId', { staffId }).then((r) => r.length),
      researchPapersUploaded: papers.length,
    },
  });
});

module.exports = router;
