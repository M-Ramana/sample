import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReport } from '../services/api';
import {
  MdDashboard, MdUploadFile, MdAssignment, MdArticle,
  MdBarChart, MdPerson, MdCheckCircle, MdPending, MdArrowForward, MdTableChart
} from 'react-icons/md';

const StatusBadge = ({ status }) => {
  const map = {
    Pending: 'badge-pending',
    Submitted: 'badge-submitted',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected',
  };
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      <span className="badge-dot" />
      {status || 'Pending'}
    </span>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReport()
      .then((r) => setReport(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const auditStatus = report?.auditStatus || {};
  const counts = report?.counts || {};

  const quickLinks = [
    { label: 'Audit 1 — Lesson Plan', icon: <MdUploadFile />, path: '/audit1', color: 'blue' },
    { label: 'Audit 2 — IAT 1 Marks', icon: <MdAssignment />, path: '/audit2', color: 'cyan' },
    { label: 'Audit 3 — IAT 2 Marks', icon: <MdAssignment />, path: '/audit3', color: 'green' },
    { label: 'Marks List', icon: <MdTableChart />, path: '/marks-view', color: 'cyan' },
    { label: 'Research Papers', icon: <MdArticle />, path: '/research', color: 'amber' },
    { label: 'Reports', icon: <MdBarChart />, path: '/reports', color: 'blue' },
    { label: 'My Profile', icon: <MdPerson />, path: '/profile', color: 'cyan' },
  ];

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <h1 className="page-title">
            <span style={{ color: 'var(--primary-light)' }}>👋 </span>
            Welcome, {user?.name?.split(' ')[0] || 'Staff'}
          </h1>
          <p className="page-subtitle">Academic Audit Management — {user?.department || 'Department'}</p>
        </div>
        <div className="topbar-right">
          <span className="badge-pill">{user?.staffId || 'STF'}</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <MdDashboard style={{ fontSize: 20, flexShrink: 0 }} />
        <span>Complete all 3 audits and upload at least 2 research papers to meet the academic semester requirements.</span>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue"><MdUploadFile /></div>
          <div>
            <div className="stat-value">{counts.auditsSubmitted ?? '—'}</div>
            <div className="stat-label">Audits Submitted</div>
          </div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><MdAssignment /></div>
          <div>
            <div className="stat-value">{counts.totalStudentsWithMarks ?? '—'}</div>
            <div className="stat-label">Students with Marks</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><MdArticle /></div>
          <div>
            <div className="stat-value">{counts.researchPapersUploaded ?? '—'}</div>
            <div className="stat-label">Research Papers</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><MdPending /></div>
          <div>
            <div className="stat-value">{3 - (counts.auditsSubmitted || 0)}</div>
            <div className="stat-label">Audits Pending</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Audit Status */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Audit Status</div>
              <div className="section-subtitle">Current semester audit completion</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { no: 1, name: 'Lesson Plan & Course Files', status: auditStatus.audit1?.status },
              { no: 2, name: 'IAT 1 Marks Entry', status: auditStatus.audit2?.status },
              { no: 3, name: 'IAT 2 Marks Entry', status: auditStatus.audit3?.status },
            ].map((a) => (
              <div key={a.no} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'var(--bg)',
                borderRadius: 10,
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'rgba(99,102,241,.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, color: 'var(--primary-light)'
                  }}>A{a.no}</div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>Audit {a.no}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{a.name}</div>
                  </div>
                </div>
                <StatusBadge status={a.status || 'Pending'} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Quick Actions</div>
              <div className="section-subtitle">Navigate to key pages</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {quickLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 16px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-light)';
                  e.currentTarget.style.color = 'var(--text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <span style={{ fontSize: 18, color: 'var(--primary-light)' }}>{link.icon}</span>
                <span style={{ flex: 1 }}>{link.label}</span>
                <MdArrowForward style={{ fontSize: 16 }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Info */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Staff Information</div>
        <div className="form-grid">
          {[
            { label: 'Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Department', value: user?.department },
            { label: 'Designation', value: user?.designation },
            { label: 'Staff ID', value: user?.staffId },
            { label: 'Subjects', value: user?.subjects?.join(', ') },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
