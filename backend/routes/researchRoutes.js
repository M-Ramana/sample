const express = require('express');
const router = express.Router();
const ResearchPaper = require('../models/ResearchPaper');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// @route GET /api/research - get all research papers for logged-in staff
router.get('/', protect, async (req, res) => {
  const papers = await ResearchPaper.find({ staffId: req.staff._id }).sort({ createdAt: -1 });
  res.json(papers);
});

// @route POST /api/research - upload a research paper
router.post('/', protect, upload.single('paper'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

  const { title, journal, authors, year, semester } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  // Check  2 paper limit per semester
  if (semester) {
    const count = await ResearchPaper.countDocuments({ staffId: req.staff._id, semester });
    if (count >= 2)
      return res.status(400).json({ message: 'Maximum 2 research papers allowed per semester' });
  }

  const paper = await ResearchPaper.create({
    staffId: req.staff._id,
    title,
    journal: journal || '',
    authors: authors || '',
    year: year || '',
    semester: semester || '',
    filePath: req.file.path,
    fileName: req.file.originalname,
  });

  res.status(201).json({ message: 'Research paper uploaded successfully', paper });
});

// @route DELETE /api/research/:id
router.delete('/:id', protect, async (req, res) => {
  const paper = await ResearchPaper.findOneAndDelete({
    _id: req.params.id,
    staffId: req.staff._id,
  });
  if (!paper) return res.status(404).json({ message: 'Research paper not found' });
  res.json({ message: 'Research paper deleted' });
});

module.exports = router;
