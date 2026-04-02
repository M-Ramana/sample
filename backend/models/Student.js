const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  class: { type: String, required: true },   // e.g. "CSE-A", "IT-B"
  section: { type: String, default: '' },
  semester: { type: String, default: '' },
  subjects: [{ type: String }],              // subjects this student has
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
