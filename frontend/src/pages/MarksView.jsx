import { useState, useEffect } from 'react';
import { getMarks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdTableChart, MdSearch, MdAssignment, MdRefresh } from 'react-icons/md';

const COLS = [
  { key: 'testMarks', label: 'Test', max: 100 },
  { key: 'assignmentMarks', label: 'Assignment', max: 50 },
  { key: 'seminarMarks', label: 'Seminar', max: 50 },
  { key: 'quizMarks', label: 'Quiz', max: 25 },
];

function MarksTable({ marks, auditLabel, color }) {
  if (marks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
        <MdAssignment style={{ fontSize: 40, opacity: 0.25, marginBottom: 8 }} />
        <p>No marks entered yet for <strong>{auditLabel}</strong>.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Reg. No</th>
            <th>Student Name</th>
            <th>Subject</th>
            <th>Class</th>
            <th>Test<br /><span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>/100</span></th>
            <th>Assignment<br /><span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>/50</span></th>
            <th>Seminar<br /><span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>/50</span></th>
            <th>Quiz<br /><span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>/25</span></th>
            <th>Total<br /><span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>/225</span></th>
          </tr>
        </thead>
        <tbody>
          {marks.map((m, i) => {
            const total = (m.testMarks || 0) + (m.assignmentMarks || 0) + (m.seminarMarks || 0) + (m.quizMarks || 0);
            const pct = Math.round((total / 225) * 100);
            return (
              <tr key={m._id}>
                <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>{i + 1}</td>
                <td style={{ fontWeight: 600, color: color }}>{m.regNo}</td>
                <td>{m.studentName}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.subject}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.class}</td>
                <td>{m.testMarks ?? '—'}</td>
                <td>{m.assignmentMarks ?? '—'}</td>
                <td>{m.seminarMarks ?? '—'}</td>
                <td>{m.quizMarks ?? '—'}</td>
                <td>
                  <span style={{
                    fontWeight: 700,
                    color: pct >= 70 ? 'var(--success)' : pct >= 45 ? 'var(--warning)' : 'var(--danger, #ef4444)',
                  }}>
                    {total}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4 }}>({pct}%)</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function MarksView() {
  const { user } = useAuth();
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [audit2Marks, setAudit2Marks] = useState([]);
  const [audit3Marks, setAudit3Marks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMarks = async (overrideSubject, overrideClass) => {
    setLoading(true);
    setFetched(false);
    try {
      const params = {};
      const subj = overrideSubject !== undefined ? overrideSubject : filterSubject;
      const cls  = overrideClass  !== undefined ? overrideClass  : filterClass;
      if (subj) params.subject = subj;
      if (cls)  params.class   = cls;

      const [r2, r3] = await Promise.all([
        getMarks({ ...params, auditNo: 2 }),
        getMarks({ ...params, auditNo: 3 }),
      ]);
      setAudit2Marks(r2.data);
      setAudit3Marks(r3.data);
      setFetched(true);
    } catch {
      showToast('Failed to fetch marks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch all marks on first load
  useEffect(() => { fetchMarks('', ''); }, []);

  const totalStudents = new Set([...audit2Marks.map(m => m.regNo), ...audit3Marks.map(m => m.regNo)]).size;

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}><span>{toast.type === 'success' ? '✅' : '❌'}</span><span>{toast.msg}</span></div>
        </div>
      )}

      {/* Header */}
      <div className="topbar">
        <div>
          <h1 className="page-title">
            <MdTableChart style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--primary-light)' }} />
            Marks List — Audit 2 &amp; 3
          </h1>
          <p className="page-subtitle">View all entered IAT 1 &amp; IAT 2 marks submitted by you</p>
        </div>
        <div className="topbar-right" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="badge badge-submitted"><span className="badge-dot" />{totalStudents} Students</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Filter Marks</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
            <label className="form-label">Subject</label>
            <select className="form-select" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {(user?.subjects || []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
            <label className="form-label">Class</label>
            <select className="form-select" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="">All Classes</option>
              {(user?.classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchMarks} disabled={loading} style={{ marginBottom: 0 }}>
            <MdSearch />{loading ? 'Loading...' : 'Apply Filter'}
          </button>
          <button
            className="btn"
            style={{ marginBottom: 0, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            onClick={() => { setFilterSubject(''); setFilterClass(''); fetchMarks('', ''); }}
            title="Reset filters"
          >
            <MdRefresh />
          </button>
        </div>
      </div>

      {loading && <div className="spinner" style={{ margin: '30px auto' }} />}

      {!loading && fetched && (
        <>
          {/* Audit 2 — IAT 1 */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: 'rgba(99,102,241,0.15)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, color: 'var(--primary-light)',
                  }}>A2</span>
                  Audit 2 — IAT 1 Marks
                </div>
                <div className="section-subtitle" style={{ marginTop: 4 }}>{audit2Marks.length} record{audit2Marks.length !== 1 ? 's' : ''} found</div>
              </div>
              <span className="badge-pill" style={{ fontSize: 12 }}>{audit2Marks.length} entries</span>
            </div>
            <MarksTable marks={audit2Marks} auditLabel="Audit 2 — IAT 1" color="var(--primary-light)" />
          </div>

          {/* Audit 3 — IAT 2 */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: 'rgba(16,185,129,0.15)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, color: 'var(--accent)',
                  }}>A3</span>
                  Audit 3 — IAT 2 Marks
                </div>
                <div className="section-subtitle" style={{ marginTop: 4 }}>{audit3Marks.length} record{audit3Marks.length !== 1 ? 's' : ''} found</div>
              </div>
              <span className="badge-pill" style={{ background: 'linear-gradient(135deg, var(--accent-dark), var(--accent))', fontSize: 12 }}>{audit3Marks.length} entries</span>
            </div>
            <MarksTable marks={audit3Marks} auditLabel="Audit 3 — IAT 2" color="var(--accent)" />
          </div>
        </>
      )}
    </div>
  );
}
