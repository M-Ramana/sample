import { useState, useEffect } from 'react';
import { getStudents, getMarks, bulkSaveMarks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdAssignment, MdSearch, MdSave, MdEvent, MdWarning, MdLock } from 'react-icons/md';

// ─── Audit 3 Deadline Config ─────────────────────────────────────────────────
const AUDIT3_DEADLINE = new Date('2026-04-20T23:59:59'); // Change date as needed
// ─────────────────────────────────────────────────────────────────────────────

function DeadlineBanner({ deadline, auditLabel }) {
  const now = new Date();
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isPast = diffMs < 0;
  const isNear = !isPast && diffDays <= 2;
  const dateStr = deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  if (isPast) return (
    <div className="alert" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
      <MdLock style={{ fontSize: 20, flexShrink: 0, color: '#ef4444' }} />
      <span><strong>Deadline Passed.</strong> The marks update deadline was <strong>{dateStr}</strong>. Saving is now disabled. Contact admin if changes are needed.</span>
    </div>
  );
  if (isNear) return (
    <div className="alert alert-warning" style={{ marginBottom: 20 }}>
      <MdWarning style={{ fontSize: 20, flexShrink: 0 }} />
      <span><strong>Deadline Approaching!</strong> You have <strong>{diffDays} day{diffDays !== 1 ? 's' : ''}</strong> left to update IAT 2 marks. Deadline: <strong>{dateStr}</strong></span>
    </div>
  );
  return (
    <div className="alert alert-info" style={{ marginBottom: 20 }}>
      <MdEvent style={{ fontSize: 20, flexShrink: 0 }} />
      <span>Marks update deadline for <strong>{auditLabel}</strong>: <strong>{dateStr}</strong> ({diffDays} days remaining)</span>
    </div>
  );
}

// Reuse same marks entry pattern for Audit 3 (IAT 2)
function MarksPage({ auditNo, title, subtitle }) {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [cls, setCls] = useState('');
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudents = async () => {
    if (!subject || !cls) { showToast('Please select subject and class.', 'error'); return; }
    setLoading(true);
    try {
      const [studRes, marksRes] = await Promise.all([
        getStudents({ subject, class: cls }),
        getMarks({ subject, class: cls, auditNo }),
      ]);
      setStudents(studRes.data);
      const map = {};
      studRes.data.forEach((s) => {
        const existing = marksRes.data.find((m) => m.regNo === s.regNo);
        map[s._id] = {
          studentId: s._id,
          regNo: s.regNo,
          studentName: s.name,
          testMarks: existing?.testMarks ?? '',
          assignmentMarks: existing?.assignmentMarks ?? '',
          seminarMarks: existing?.seminarMarks ?? '',
          quizMarks: existing?.quizMarks ?? '',
        };
      });
      setMarksMap(map);
      setFetched(true);
    } catch {
      showToast('Failed to fetch students.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const isDeadlinePast = new Date() > AUDIT3_DEADLINE;

  const handleSave = async () => {
    if (isDeadlinePast) { showToast('Deadline has passed. Saving is disabled.', 'error'); return; }
    setSaving(true);
    try {
      const marksData = Object.values(marksMap);
      await bulkSaveMarks({ marksData, subject, class: cls, auditNo });
      showToast('Marks saved successfully!');
    } catch {
      showToast('Failed to save marks.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const cols = [
    { key: 'testMarks', label: 'Test Marks', max: 100 },
    { key: 'assignmentMarks', label: 'Assignment', max: 50 },
    { key: 'seminarMarks', label: 'Seminar', max: 50 },
    { key: 'quizMarks', label: 'Quiz', max: 25 },
  ];

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}><span>{toast.type === 'success' ? '✅' : '❌'}</span><span>{toast.msg}</span></div>
        </div>
      )}

      <div className="topbar">
        <div>
          <h1 className="page-title">
            <MdAssignment style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--accent)' }} />{title}
          </h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        <span className="badge-pill" style={{ background: 'linear-gradient(135deg, var(--accent-dark), var(--accent))' }}>Audit {auditNo}</span>
      </div>

      <DeadlineBanner deadline={AUDIT3_DEADLINE} auditLabel="Audit 3 — IAT 2" />

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Select Subject & Class</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Subject</label>
            <select className="form-select" value={subject} onChange={(e) => { setSubject(e.target.value); setFetched(false); }}>
              <option value="">-- Select Subject --</option>
              {(user?.subjects || []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Class</label>
            <select className="form-select" value={cls} onChange={(e) => { setCls(e.target.value); setFetched(false); }}>
              <option value="">-- Select Class --</option>
              {(user?.classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchStudents} disabled={loading} style={{ background: 'linear-gradient(135deg, var(--accent-dark), var(--accent))' }}>
            <MdSearch />{loading ? 'Fetching...' : 'Fetch Students'}
          </button>
        </div>
      </div>

      {loading && <div className="spinner" />}

      {fetched && students.length === 0 && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p>No students found for <strong>{subject}</strong> — <strong>{cls}</strong></p>
          </div>
        </div>
      )}

      {fetched && students.length > 0 && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <div>
              <div className="section-title">IAT 2 Marks Entry</div>
              <div className="section-subtitle">{students.length} students — {subject} / {cls}</div>
            </div>
            <button className="btn btn-success" onClick={handleSave} disabled={saving || isDeadlinePast} title={isDeadlinePast ? 'Deadline has passed' : ''}>
              {isDeadlinePast ? <MdLock /> : <MdSave />}{saving ? 'Saving...' : isDeadlinePast ? 'Deadline Passed' : 'Save All Marks'}
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Reg. Number</th>
                  <th>Student Name</th>
                  <th>Test Marks<br /><span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>/100</span></th>
                  <th>Assignment<br /><span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>/50</span></th>
                  <th>Seminar<br /><span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>/50</span></th>
                  <th>Quiz<br /><span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>/25</span></th>
                  <th>Total /225</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const m = marksMap[s._id] || {};
                  const total = (Number(m.testMarks) || 0) + (Number(m.assignmentMarks) || 0) + (Number(m.seminarMarks) || 0) + (Number(m.quizMarks) || 0);
                  return (
                    <tr key={s._id}>
                      <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{s.regNo}</td>
                      <td>{s.name}</td>
                      {cols.map((col) => (
                        <td key={col.key}>
                          <input
                            type="number"
                            className="marks-input"
                            min={0}
                            max={col.max}
                            value={m[col.key] ?? ''}
                            onChange={(e) => handleMarkChange(s._id, col.key, e.target.value)}
                          />
                        </td>
                      ))}
                      <td>
                        <span style={{ fontWeight: 700, color: total >= 157 ? 'var(--success)' : total >= 100 ? 'var(--warning)' : 'var(--text)' }}>
                          {total || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-success" onClick={handleSave} disabled={saving || isDeadlinePast} title={isDeadlinePast ? 'Deadline has passed' : ''}>
              {isDeadlinePast ? <MdLock /> : <MdSave />}{saving ? 'Saving...' : isDeadlinePast ? 'Deadline Passed' : 'Save All Marks'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Audit3() {
  return <MarksPage auditNo={3} title="Audit 3 — IAT 2 Marks" subtitle="Enter Internal Assessment Test 2 marks for all students" />;
}
