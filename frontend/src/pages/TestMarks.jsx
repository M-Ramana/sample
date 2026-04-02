import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../services/api';

export default function TestMarks() {
  const { user } = useAuth();
  
  // Form State
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [testDate, setTestDate] = useState('');
  const [totalMarks, setTotalMarks] = useState(25);
  
  // Data State
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Derived state
  const deadlineDate = testDate 
    ? new Date(new Date(testDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : '';
    
  const currentDate = new Date().toISOString().split('T')[0];
  const isDeadlinePassed = deadlineDate && currentDate > deadlineDate;

  const fetchStudents = async () => {
    if (!department || !year || !section) {
      return toast.error('Please select Department, Year, and Section to fetch students');
    }
    
    setLoading(true);
    try {
      // API call expects: GET /api/students?department=CSE&year=2&section=A
      const { data } = await API.get('/students', {
        params: { department, year, section }
      });
      
      if (data.length === 0) {
        toast.info(`No students found for ${department} Year ${year} Sec ${section}`);
      } else {
        toast.success(`Fetched ${data.length} students`);
      }
      
      setStudents(data);
      
      // Initialize marks state mapping avoiding undefined
      const initialMarks = {};
      data.forEach(s => {
        initialMarks[s.regNo] = '';
      });
      setMarksData(initialMarks);
      
      // Attempt to pre-fetch existing marks if any
      if (subject) {
          try {
              const res = await API.get('/marks/test', {
                  params: { subject, department, year, section }
              });
              if (res.data && res.data.length > 0) {
                  const fetchedMarks = { ...initialMarks };
                  res.data.forEach(m => {
                      if (m.regNo) fetchedMarks[m.regNo] = m.marks;
                  });
                  setMarksData(fetchedMarks);
              }
          } catch (err) {
              console.log('No previous marks found');
          }
      }
      
    } catch (error) {
      toast.error('Failed to fetch students. Please check your connection.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (regNo, value) => {
    if (value === '') {
      setMarksData(prev => ({ ...prev, [regNo]: '' }));
      return;
    }
    
    const num = Number(value);
    if (isNaN(num)) return;
    if (num < 0) return toast.warning('Marks cannot be negative');
    if (num > totalMarks) return toast.warning(`Marks cannot exceed ${totalMarks}`);
    
    setMarksData(prev => ({ ...prev, [regNo]: num }));
  };

  const handleSubmit = async (isUpdate = false) => {
    if (!subject || !department || !year || !section || !testDate) {
      return toast.error('Please fill all form fields before submitting');
    }
    
    if (students.length === 0) {
      return toast.error('Please fetch students first');
    }
    
    const marksPayload = students.map(s => ({
      regNo: s.regNo,
      marks: marksData[s.regNo] === '' ? 0 : Number(marksData[s.regNo])
    }));
    
    const payload = {
      subject,
      department,
      year,
      section,
      testDate,
      deadlineDate,
      marks: marksPayload
    };

    setSaving(true);
    try {
      // API call expects POST /api/marks with the payload
      const response = await API.post('/marks/test', payload);
      toast.success(isUpdate ? 'Marks updated successfully' : 'Marks submitted successfully');
    } catch (error) {
       toast.error(error.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Test Marks Entry</h1>
        <p>Faculty portal to enter and update test marks</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '15px', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Test Details
        </h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Subject Name</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}>
              <option value="">Select Subject...</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="DBMS">DBMS</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Software Engineering">Software Engineering</option>
            </select>
          </div>

          <div className="form-group">
            <label>Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)}>
              <option value="">Select Dept...</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
            </select>
          </div>

          <div className="form-group">
            <label>Year</label>
            <select value={year} onChange={e => setYear(e.target.value)}>
              <option value="">Select Year...</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          <div className="form-group">
            <label>Section</label>
            <select value={section} onChange={e => setSection(e.target.value)}>
              <option value="">Select Section...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div className="form-group">
            <label>Test Date</label>
            <input 
              type="date" 
              value={testDate} 
              onChange={e => setTestDate(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Total Marks</label>
            <input 
              type="number" 
              value={totalMarks} 
              onChange={e => setTotalMarks(Number(e.target.value))} 
              min="1"
            />
          </div>
        </div>
        
        <div style={{ marginTop: '15px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ padding: '10px 15px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                <strong style={{ color: '#c7d2fe' }}>Deadline: </strong> 
                {deadlineDate ? (
                  <span style={{ color: isDeadlinePassed ? '#ef4444' : '#a7f3d0' }}>
                    {deadlineDate.split('-').reverse().join('-')}
                    {isDeadlinePassed && ' (Closed)'}
                  </span>
                ) : 'Select Test Date'}
            </div>
            
            <button 
                className="btn btn-primary" 
                onClick={fetchStudents}
                disabled={loading}
                style={{ marginLeft: 'auto' }}
            >
                {loading ? 'Fetching...' : 'Fetch Students'}
            </button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Student Table</h2>
            <span className="badge badge-success">{students.length} Students</span>
          </div>
          
          {isDeadlinePassed && (
            <div style={{ padding: '12px 15px', marginBottom: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5' }}>
               Deadline closed. Marks cannot be edited.
            </div>
          )}

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th width="10%">#</th>
                  <th width="35%">Student Name</th>
                  <th width="25%">Register Number</th>
                  <th width="30%">Marks (Max: {totalMarks})</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, index) => (
                  <tr key={st.regNo}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 500 }}>{st.name}</td>
                    <td style={{ color: '#9ca3af' }}>{st.regNo}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: '100px', padding: '6px 12px' }}
                        value={marksData[st.regNo]}
                        onChange={(e) => handleMarkChange(st.regNo, e.target.value)}
                        disabled={isDeadlinePassed}
                        placeholder="--"
                        min="0"
                        max={totalMarks}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '25px', justifyContent: 'flex-end' }}>
            <button 
              className="btn" 
              style={{ background: '#3b82f6', color: 'white' }}
              onClick={() => handleSubmit(false)}
              disabled={saving || isDeadlinePassed}
            >
              {saving ? 'Submitting...' : 'Submit Marks'}
            </button>
            <button 
              className="btn" 
              style={{ background: '#f59e0b', color: 'white' }}
              onClick={() => handleSubmit(true)}
              disabled={saving || isDeadlinePassed}
            >
              Update Marks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
