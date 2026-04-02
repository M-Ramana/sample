import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdPerson, MdUploadFile, MdBarChart,
  MdArticle, MdLogout, MdSchool, MdAssignment, MdTableChart
} from 'react-icons/md';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
      { to: '/profile', icon: <MdPerson />, label: 'Faculty Profile' },
    ],
  },
  {
    label: 'Audits',
    items: [
      { to: '/audit1', icon: <MdUploadFile />, label: 'Audit 1 — Lesson Plan' },
      { to: '/audit2', icon: <MdAssignment />, label: 'Audit 2 — IAT 1 Marks' },
      { to: '/audit3', icon: <MdAssignment />, label: 'Audit 3 — IAT 2 Marks' },
      { to: '/marks-view', icon: <MdTableChart />, label: 'Marks List' },
    ],
  },
  {
    label: 'Academic',
    items: [
      { to: '/test-marks', icon: <MdAssignment />, label: 'Test Marks Entry' },
      { to: '/research', icon: <MdArticle />, label: 'Research Papers' },
      { to: '/reports', icon: <MdBarChart />, label: 'Reports' },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <MdSchool style={{ fontSize: 26, color: '#6366f1' }} />
          <div>
            <h2>Academic Audit</h2>
            <h2>Management System</h2>
          </div>
        </div>
        <span className="logo-badge">Staff Portal</span>
      </div>

      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div className="user-info">
          <div className="name">{user?.name || 'Staff Member'}</div>
          <div className="role">{user?.designation || 'Faculty'}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="nav-section-title">{section.label}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <MdLogout />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
