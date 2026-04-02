import { useState, useEffect } from 'react';
import { getResearchPapers, uploadResearchPaper, deleteResearchPaper } from '../services/api';
import { MdArticle, MdUploadFile, MdDelete, MdCloudUpload, MdCheckCircle } from 'react-icons/md';

export default function ResearchPapers() {
  const [papers, setPapers] = useState([]);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', journal: '', authors: '', year: new Date().getFullYear().toString(), semester: 'Sem-IV' });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPapers = () => {
    getResearchPapers()
      .then((r) => setPapers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPapers(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { showToast('Please select a file to upload.', 'error'); return; }
    if (!form.title) { showToast('Please enter a paper title.', 'error'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('paper', file);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await uploadResearchPaper(fd);
      showToast('Research paper uploaded successfully!');
      setFile(null);
      setForm({ title: '', journal: '', authors: '', year: new Date().getFullYear().toString(), semester: 'Sem-IV' });
      fetchPapers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this research paper?')) return;
    try {
      await deleteResearchPaper(id);
      setPapers((prev) => prev.filter((p) => p._id !== id));
      showToast('Paper deleted.');
    } catch {
      showToast('Failed to delete.', 'error');
    }
  };

  const semesterPapers = (sem) => papers.filter((p) => p.semester === sem);
  const currentSem = 'Sem-IV';
  const semCount = semesterPapers(currentSem).length;
  const limit = 2;

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}><span>{toast.type === 'success' ? '✅' : '❌'}</span><span>{toast.msg}</span></div>
        </div>
      )}

      <div className="topbar">
        <div>
          <h1 className="page-title"><MdArticle style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--warning)' }} />Research Papers</h1>
          <p className="page-subtitle">Upload and manage your research publications per semester</p>
        </div>
        <div className="topbar-right">
          <span className={`badge ${semCount >= limit ? 'badge-approved' : 'badge-pending'}`}>
            <span className="badge-dot" />{semCount}/{limit} this semester
          </span>
        </div>
      </div>

      {semCount < limit && (
        <div className="alert alert-warning">
          <MdArticle style={{ fontSize: 20, flexShrink: 0 }} />
          <span>You need to upload <strong>{limit - semCount} more</strong> research paper{limit - semCount > 1 ? 's' : ''} for {currentSem} to meet requirements.</span>
        </div>
      )}
      {semCount >= limit && (
        <div className="alert alert-success">
          <MdCheckCircle style={{ fontSize: 20, flexShrink: 0 }} />
          <span>Research paper requirement for {currentSem} is complete! ({semCount}/{limit} uploaded)</span>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Upload Form */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 4 }}>Upload New Paper</div>
          <div className="section-subtitle" style={{ marginBottom: 18 }}>Upload a PDF or Word document of your research paper</div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Paper Title *</label>
              <input className="form-input" name="title" placeholder="Paper title" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Journal / Conference Name</label>
              <input className="form-input" name="journal" placeholder="IEEE, Springer, etc." value={form.journal} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Authors</label>
              <input className="form-input" name="authors" placeholder="Dr. A, Prof. B, ..." value={form.authors} onChange={handleChange} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Year</label>
                <input className="form-input" name="year" type="number" value={form.year} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Semester</label>
                <select className="form-select" name="semester" value={form.semester} onChange={handleChange}>
                  {['Sem-I','Sem-II','Sem-III','Sem-IV','Sem-V','Sem-VI','Sem-VII','Sem-VIII'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Research Paper File *</label>
              <div
                className="upload-zone"
                style={{ padding: '28px 20px' }}
                onClick={() => document.getElementById('paper-upload').click()}
              >
                <MdCloudUpload className="upload-icon" style={{ fontSize: 32, marginBottom: 8 }} />
                <h3 style={{ fontSize: 14 }}>{file ? file.name : 'Click to select file'}</h3>
                <p>PDF, DOC, DOCX (max 10MB)</p>
                <input id="paper-upload" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={uploading || semCount >= limit}>
              <MdUploadFile />{uploading ? 'Uploading...' : 'Upload Paper'}
            </button>
            {semCount >= limit && <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: -6 }}>Maximum papers for this semester reached.</p>}
          </form>
        </div>

        {/* Papers List */}
        <div>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>Uploaded Papers ({papers.length})</div>
            {loading && <div className="spinner" style={{ margin: '20px auto' }} />}
            {!loading && papers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                <MdArticle style={{ fontSize: 44, opacity: 0.3, marginBottom: 8 }} />
                <p>No research papers uploaded yet.</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {papers.map((p, i) => (
                <div key={p._id} className="paper-card">
                  <div className="paper-icon">
                    <MdArticle />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="paper-title">{p.title}</div>
                    <div className="paper-meta">
                      {[p.journal, p.authors, p.year, p.semester].filter(Boolean).join(' · ')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                      📄 {p.fileName} · {new Date(p.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(p._id)}
                    title="Delete"
                  >
                    <MdDelete />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
