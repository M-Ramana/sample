const mongoose = require('mongoose');

const researchPaperSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  title: { type: String, required: true },
  journal: { type: String, default: '' },
  authors: { type: String, default: '' },
  year: { type: String, default: '' },
  semester: { type: String, default: '' },
  filePath: { type: String, required: true },
  fileName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ResearchPaper', researchPaperSchema);
