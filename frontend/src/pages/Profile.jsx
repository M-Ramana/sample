import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdSave, MdEdit } from 'react-icons/md';

export default function Profile() {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: '', department: '', designation: '', qualification: '',
    specialization: '', experience: '', phone: '',
    subjects: '', classes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getProfile().then((res) => {
      const d = res.data;
      setForm({
        name: d.name || '',
        department: d.department || '',
        designation: d.designation || '',
        qualification: d.qualification || '',
        specialization: d.specialization || '',
        experience: d.experience || '',
        phone: d.phone || '',
        subjects: (d.subjects || []).join(', '),
        classes: (d.classes || []).join(', '),
      });
    }).finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
        classes: form.classes.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await updateProfile(payload);
      await refreshUser();
      showToast('Profile updated successfully!');
    } catch {
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" />;

  const fields = [
    { name: 'name', label: 'Full Name', placeholder: 'Dr. Priya Sharma' },
    { name: 'department', label: 'Department', placeholder: 'Computer Science' },
    { name: 'designation', label: 'Designation', placeholder: 'Associate Professor' },
    { name: 'qualification', label: 'Qualification', placeholder: 'Ph.D. (Computer Science)' },
    { name: 'specialization', label: 'Specialization', placeholder: 'Machine Learning' },
    { name: 'experience', label: 'Experience', placeholder: '10 years' },
    { name: 'phone', label: 'Phone Number', placeholder: '9876543210' },
    { name: 'subjects', label: 'Subjects (comma separated)', placeholder: 'Data Structures, Algorithms' },
    { name: 'classes', label: 'Classes Handling (comma separated)', placeholder: 'CSE-A, CSE-B' },
  ];

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="topbar">
        <div>
          <h1 className="page-title"><MdPerson style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--primary-light)' }} />Faculty Profile</h1>
          <p className="page-subtitle">Update your personal and academic information</p>
        </div>
        <div className="topbar-right">
          <span className="badge-pill">Personal Info</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Personal Details</div>
              <div className="section-subtitle">Your information will appear in reports and audit records</div>
            </div>
            <MdEdit style={{ color: 'var(--text-dim)', fontSize: 20 }} />
          </div>
          <div className="form-grid">
            {fields.map((f) => (
              <div key={f.name} className="form-group">
                <label className="form-label">{f.label}</label>
                <input
                  className="form-input"
                  name={f.name}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <MdSave />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
