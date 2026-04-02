import { useState, useEffect } from 'react';
import { getReport } from '../services/api';
import { MdBarChart, MdArticle, MdAssignment, MdUploadFile, MdCheckCircle, MdPending, MdWarning } from 'react-icons/md';

const StatusIcon = ({ status }) => {
  if (status === 'Approved') return <MdCheckCircle style={{ color: 'var(--success)', fontSize: 20 }} />;
  if (status === 'Submitted') return <MdCheckCircle style={{ color: 'var(--accent)', fontSize: 20 }} />;
  if (status === 'Rejected') return <MdWarning style={{ color: 'var(--danger)', fontSize: 20 }} />;
  return <MdPending style={{ color: 'var(--warning)', fontSize: 20 }} />;
};

const pct = (val, max) => Math.min(100, Math.round((val / max) * 100));

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReport()
      .then((r) => setReport(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  if (!report) return <div className="alert alert-error">Failed to load report data.</div>;

  const { auditStatus, marksSummary = [], researchPapers = [], counts } = report;

  const auditsArr = [
    { no: 1, name: 'Lesson Plan & Course Files', icon: <MdUploadFile />, data: auditStatus.audit1 },
    { no: 2, name: 'IAT 1 Marks Entry', icon: <MdAssignment />, data: auditStatus.audit2 },
    { no: 3, name: 'IAT 2 Marks Entry', icon: <MdAssignment />, data: auditStatus.audit3 },
  ];

  const statusBadgeClass = { Pending: 'badge-pending', Submitted: 'badge-submitted', Approved: 'badge-approved', Rejected: 'badge-rejected' };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title"><MdBarChart style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--success)' }} />Academic Reports</h1>
          <p className="page-subtitle">Comprehensive overview of your academic audit progress</p>
        </div>
        <span className="badge-pill" style={{ background: 'linear-gradient(135deg, #059669, var(--success))' }}>Reports</span>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue"><MdUploadFile /></div>
          <div>
            <div className="stat-value">{counts.auditsSubmitted}/3</div>
            <div className="stat-label">Audits Submitted</div>
          </div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><MdAssignment /></div>
          <div>
            <div className="stat-value">{counts.totalStudentsWithMarks}</div>
            <div className="stat-label">Students Evaluated</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><MdArticle /></div>
          <div>
            <div className="stat-value">{counts.researchPapersUploaded}/2</div>
            <div className="stat-label">Research Papers</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><MdCheckCircle /></div>
          <div>
            <div className="stat-value">
              {Math.round(((counts.auditsSubmitted / 3) * 60 + (Math.min(counts.researchPapersUploaded, 2) / 2) * 40))}%
            </div>
            <div className="stat-label">Overall Completion</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Audit Status Report */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 4 }}>Audit Status Report</div>
          <div className="section-subtitle" style={{ marginBottom: 18 }}>Current semester audit submission status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {auditsArr.map((a) => {
              const status = a.data?.status || 'Pending';
              return (
                <div key={a.no} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px', background: 'var(--bg)', borderRadius: 10,
                  border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: 'rgba(99,102,241,.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, color: 'var(--primary-light)',
                  }}>{a.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>Audit {a.no}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{a.name}</div>
                    {a.data?.submittedAt && (
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3 }}>
                        Submitted: {new Date(a.data.submittedAt).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span className={`badge ${statusBadgeClass[status]}`}>
                      <span className="badge-dot" />{status}
                    </span>
                    <StatusIcon status={status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Research Papers Report */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="section-title" style={{ marginBottom: 4 }}>Research Papers</div>
            <div className="section-subtitle" style={{ marginBottom: 16 }}>Publication and upload status</div>
            {researchPapers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                <MdArticle style={{ fontSize: 40, opacity: 0.3 }} />
                <p style={{ marginTop: 8 }}>No papers uploaded yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {researchPapers.map((p) => (
                  <div key={p._id} style={{
                    padding: '12px 14px',
                    background: 'var(--bg)',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {[p.journal, p.year, p.semester].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Marks Summary */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 4 }}>Marks Summary</div>
            <div className="section-subtitle" style={{ marginBottom: 16 }}>Average marks per subject / audit</div>
            {marksSummary.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                <MdAssignment style={{ fontSize: 40, opacity: 0.3 }} />
                <p style={{ marginTop: 8 }}>No marks entered yet</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Class</th>
                      <th>Audit</th>
                      <th>Students</th>
                      <th>Avg Test</th>
                      <th>Avg Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marksSummary.map((m, i) => {
                      const avgTotal = (m.avgTest + m.avgAssignment + m.avgSeminar + m.avgQuiz).toFixed(1);
                      const totalPct = pct(parseFloat(avgTotal), 225);
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{m._id.subject}</td>
                          <td>{m._id.class}</td>
                          <td>
                            <span className="badge badge-submitted" style={{ fontSize: 11 }}>IAT {m._id.auditNo === 2 ? '1' : '2'}</span>
                          </td>
                          <td>{m.totalStudents}</td>
                          <td>{m.avgTest?.toFixed(1)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, color: totalPct >= 70 ? 'var(--success)' : totalPct >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                                {avgTotal}
                              </span>
                              <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, minWidth: 60 }}>
                                <div style={{
                                  height: '100%', borderRadius: 3,
                                  width: `${totalPct}%`,
                                  background: totalPct >= 70 ? 'var(--success)' : totalPct >= 50 ? 'var(--warning)' : 'var(--danger)',
                                  transition: 'width 0.6s ease',
                                }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
