const mongoose = require('mongoose');

const testMarkSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  subject: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  testDate: { type: String, required: true }, // Format YYYY-MM-DD
  deadlineDate: { type: String, required: true },
  regNo: { type: String, required: true },
  marks: { type: Number, required: true, min: 0 },
}, { timestamps: true });

testMarkSchema.index({ staffId: 1, subject: 1, regNo: 1, testDate: 1 }, { unique: true });

module.exports = mongoose.model('TestMark', testMarkSchema);
