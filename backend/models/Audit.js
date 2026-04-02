const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  auditNo: { type: Number, required: true, enum: [1, 2, 3] },
  subject: { type: String, default: '' },
  class: { type: String, default: '' },
  lessonPlanPath: { type: String, default: '' },
  lessonPlanName: { type: String, default: '' },
  courseFilePath: { type: String, default: '' },
  courseFileName: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Submitted', 'Approved', 'Rejected'], default: 'Pending' },
  remarks: { type: String, default: '' },
  submittedAt: { type: Date },
}, { timestamps: true });

auditSchema.index({ staffId: 1, auditNo: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Audit', auditSchema);
