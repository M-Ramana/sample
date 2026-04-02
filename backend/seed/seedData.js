const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '../.env' });

const Staff = require('../models/Staff');
const Student = require('../models/Student');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academicauditdb';

const staffData = [
  {
    name: 'Dr. Priya Sharma',
    email: 'priya@college.edu',
    password: 'password123',
    staffId: 'STF-001',
    department: 'Computer Science',
    designation: 'Associate Professor',
    qualification: 'Ph.D. (Computer Science)',
    specialization: 'Machine Learning',
    experience: '10 years',
    phone: '9876543210',
    subjects: ['Data Structures', 'Algorithms', 'Machine Learning'],
    classes: ['CSE-A', 'CSE-B'],
  },
  {
    name: 'Prof. Rajesh Kumar',
    email: 'rajesh@college.edu',
    password: 'password123',
    staffId: 'STF-002',
    department: 'Information Technology',
    designation: 'Assistant Professor',
    qualification: 'M.Tech (IT)',
    specialization: 'Database Systems',
    experience: '7 years',
    phone: '9876543211',
    subjects: ['Database Management', 'Web Technologies', 'Cloud Computing'],
    classes: ['IT-A', 'IT-B'],
  },
];

const classesData = [
  { class: 'CSE-A', subjects: ['Data Structures', 'Algorithms', 'Machine Learning', 'Mathematics'] },
  { class: 'CSE-B', subjects: ['Data Structures', 'Algorithms', 'Machine Learning', 'Mathematics'] },
  { class: 'IT-A', subjects: ['Database Management', 'Web Technologies', 'Cloud Computing', 'Networking'] },
  { class: 'IT-B', subjects: ['Database Management', 'Web Technologies', 'Cloud Computing', 'Networking'] },
];

const firstNames = ['Aarav', 'Ananya', 'Arjun', 'Bhavya', 'Chetan', 'Deepika', 'Divya', 'Esha', 'Farhan', 'Ganesh',
  'Harini', 'Ishaan', 'Jaya', 'Karan', 'Lakshmi', 'Madhav', 'Nandita', 'Omkar', 'Pallavi', 'Qasim',
  'Riya', 'Sanjay', 'Tanish', 'Uma', 'Vivek', 'Waqar', 'Xena', 'Yash', 'Zara', 'Aditya',
  'Bharati', 'Chandan', 'Disha', 'Evan', 'Fatima'];

const lastNames = ['Sharma', 'Kumar', 'Patel', 'Singh', 'Reddy', 'Nair', 'Verma', 'Gupta', 'Jain', 'Mehta'];

const generateStudents = () => {
  const students = [];
  let regCounter = 1;

  classesData.forEach(({ class: cls, subjects }) => {
    for (let i = 0; i < 35; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const regNo = `2024${String(regCounter).padStart(4, '0')}`;
      regCounter++;
      students.push({
        regNo,
        name: `${firstName} ${lastName}`,
        class: cls,
        section: cls.split('-')[1],
        semester: 'Sem-IV',
        subjects,
      });
    }
  });
  return students;
};

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Staff.deleteMany({});
    await Student.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed staff - use plain password, the pre-save hook will hash it once
    for (const s of staffData) {
      await Staff.create({ ...s }); // password is plain text, pre-save hook hashes it
    }
    console.log(`✅ Seeded ${staffData.length} staff members`);

    // Seed students
    const students = generateStudents();
    await Student.insertMany(students);
    console.log(`✅ Seeded ${students.length} students`);

    console.log('\n🎉 Seed complete!');
    console.log('📧 Login: priya@college.edu / password123');
    console.log('📧 Login: rajesh@college.edu / password123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedDB();
