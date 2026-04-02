import { useState, useEffect, useRef } from 'react';
import { getAudits, submitAudit } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdUploadFile, MdDescription, MdCheckCircle, MdCloudUpload } from 'react-icons/md';

const UploadZone = ({ label, accept, onChange, file, name }) => {
  const [drag, setDrag] = useState(false);
  const ref = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onChange({ target: { files: [dropped], name } });
  };

  return (
    <div>
      <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>{label}</label>
      <div
        className={`upload-zone ${drag ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => ref.current.click()}
      >
        <MdCloudUpload className="upload-icon" />
        <h3>{file ? file.name : 'Drop file here or click to browse'}</h3>
        <p>Supported: PDF, DOC, DOCX, PPT, PPTX, XLS (max 10MB)</p>
        <input ref={ref} type="file" name={name} style={{ display: 'none' }} accept={accept} onChange={onChange} />
      </div>
      {file && (
        <div className="file-info">
          <div>
            <div className="file-name">📄 {file.name}</div>
            <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <MdCheckCircle style={{ color: 'var(--success)', fontSize: 20 }} />
        </div>
      )}
    </div>
  );
};

export default function Audit1() {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: '', class: '' });
  const [lessonPlan, setLessonPlan] = useState(null);
  const [courseFile, setCourseFile] = useState(null);
  const [audit, setAudit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getAudits().then((r) => {
      const a1 = r.data.find((a) => a.auditNo === 1);
      if (a1) setAudit(a1);
    });
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFile = (e) => {
    if (e.target.name === 'lessonPlan') setLessonPlan(e.target.files[0]);
    else setCourseFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lessonPlan && !courseFile && !audit) {
      showToast('Please upload at least one file.', 'error'); return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('auditNo', 1);
      fd.append('subject', form.subject);
      fd.append('class', form.class);
      if (lessonPlan) fd.append('lessonPlan', lessonPlan);
      if (courseFile) fd.append('courseFile', courseFile);
      const res = await submitAudit(fd);
      setAudit(res.data.audit);
      showToast('Audit 1 submitted successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusClass = {
    Pending: 'badge-pending', Submitted: 'badge-submitted',
    Approved: 'badge-approved', Rejected: 'badge-rejected',
  };

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}><span>{toast.type === 'success' ? '✅' : '❌'}</span><span>{toast.msg}</span></div>
        </div>
      )}

      <div className="topbar">
        <div>
          <h1 className="page-title"><MdUploadFile style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--primary-light)' }} />Audit 1 — Lesson Plan</h1>
          <p className="page-subtitle">Upload lesson plan and course files for academic audit</p>
        </div>
        {audit && (
          <span className={`badge ${statusClass[audit.status]}`}>
            <span className="badge-dot" />{audit.status}
          </span>
        )}
      </div>

      {audit?.status === 'Submitted' && (
        <div className="alert alert-success">
          <MdCheckCircle style={{ fontSize: 20, flexShrink: 0 }} />
          <span>Audit 1 has been submitted on {new Date(audit.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. You can re-submit to update files.</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Subject & Class Details</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                <option value="">-- Select Subject --</option>
                {(user?.subjects || []).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Class</label>
              <select className="form-select" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
                <option value="">-- Select Class --</option>
                {(user?.classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ marginBottom: 6 }}>Upload Files</div>
          <p className="text-sm text-muted" style={{ marginBottom: 20 }}>Upload your lesson plan and course material files below.</p>
          <div className="grid-2">
            <UploadZone label="📋 Lesson Plan" accept=".pdf,.doc,.docx,.ppt,.pptx" name="lessonPlan" onChange={handleFile} file={lessonPlan} />
            <UploadZone label="📚 Course File / Syllabus" accept=".pdf,.doc,.docx,.xls,.xlsx" name="courseFile" onChange={handleFile} file={courseFile} />
          </div>
        </div>

        {audit && (
          <div className="card" style={{ marginBottom: 20, background: 'rgba(16,185,129,.06)', borderColor: 'rgba(16,185,129,.2)' }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Previously Submitted Files</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {audit.lessonPlanName && (
                <div className="file-info">
                  <div><div className="file-name">📋 {audit.lessonPlanName}</div><div className="file-size">Lesson Plan</div></div>
                  <MdCheckCircle style={{ color: 'var(--success)', fontSize: 20 }} />
                </div>
              )}
              {audit.courseFileName && (
                <div className="file-info">
                  <div><div className="file-name">📚 {audit.courseFileName}</div><div className="file-size">Course File</div></div>
                  <MdCheckCircle style={{ color: 'var(--success)', fontSize: 20 }} />
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <MdUploadFile />
            {submitting ? 'Submitting...' : audit ? 'Re-submit Audit 1' : 'Submit Audit 1'}
          </button>
        </div>
      </form>
    </div>
  );
}
