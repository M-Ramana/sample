const express = require('express');
const router = express.Router();
const Audit = require('../models/Audit');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// @route GET /api/audit - get all audits for logged-in staff
router.get('/', protect, async (req, res) => {
  const audits = await Audit.find({ staffId: req.staff._id });
  res.json(audits);
});

// @route POST /api/audit - create/update audit submission
// Accepts: lessonPlan (file), courseFile (file), auditNo, subject, class
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'lessonPlan', maxCount: 1 },
    { name: 'courseFile', maxCount: 1 },
  ]),
  async (req, res) => {
    const { auditNo, subject, class: cls } = req.body;

    if (!auditNo) return res.status(400).json({ message: 'auditNo is required' });

    const updateData = {
      subject: subject || '',
      class: cls || '',
      status: 'Submitted',
      submittedAt: new Date(),
    };

    if (req.files?.lessonPlan?.[0]) {
      updateData.lessonPlanPath = req.files.lessonPlan[0].path;
      updateData.lessonPlanName = req.files.lessonPlan[0].originalname;
    }
    if (req.files?.courseFile?.[0]) {
      updateData.courseFilePath = req.files.courseFile[0].path;
      updateData.courseFileName = req.files.courseFile[0].originalname;
    }

    const audit = await Audit.findOneAndUpdate(
      { staffId: req.staff._id, auditNo: Number(auditNo), subject: subject || '' },
      { $set: { ...updateData, staffId: req.staff._id, auditNo: Number(auditNo) } },
      { new: true, upsert: true }
    );

    res.status(201).json({ message: 'Audit submitted successfully', audit });
  }
);

// @route PUT /api/audit/:id/status
router.put('/:id/status', protect, async (req, res) => {
  const audit = await Audit.findById(req.params.id);
  if (!audit) return res.status(404).json({ message: 'Audit not found' });
  audit.status = req.body.status || audit.status;
  audit.remarks = req.body.remarks || audit.remarks;
  await audit.save();
  res.json(audit);
});

module.exports = router;
