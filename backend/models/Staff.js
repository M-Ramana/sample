const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  staffId: { type: String, unique: true },
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  qualification: { type: String, default: '' },
  specialization: { type: String, default: '' },
  experience: { type: String, default: '' },
  phone: { type: String, default: '' },
  subjects: [{ type: String }],
  classes: [{ type: String }],
  profilePhoto: { type: String, default: '' },
}, { timestamps: true });

staffSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

staffSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Staff', staffSchema);
