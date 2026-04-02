const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  regNo: { type: String, required: true },
  studentName: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  auditNo: { type: Number, required: true, enum: [2, 3] }, // 2=IAT1, 3=IAT2
  testMarks: { type: Number, default: 0, min: 0, max: 100 },
  assignmentMarks: { type: Number, default: 0, min: 0, max: 50 },
  seminarMarks: { type: Number, default: 0, min: 0, max: 50 },
  quizMarks: { type: Number, default: 0, min: 0, max: 25 },
}, { timestamps: true });

marksSchema.index({ staffId: 1, studentId: 1, subject: 1, auditNo: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
