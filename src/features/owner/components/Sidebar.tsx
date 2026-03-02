import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export const OwnerSidebarContent: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="od-sidebar">
      {/* Logo */}
      <Link to="/app/dashboard" onClick={onClose} className="od-logo-block" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="od-logo-type">SISWIT</div>
        <div className="od-logo-sub">Owner · Command Center</div>
      </Link>

      {/* Navigation */}
      <div className="od-nav-block">
        {/* Overview */}
        <div className="od-nav-section-lbl">Overview</div>
        <Link to="/app/dashboard" onClick={onClose} className={`od-nav-link ${isActive('/app/dashboard') ? 'on' : ''}`}>
          <svg className="od-nav-ic" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.4" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.4" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.4" />
          </svg>
          Dashboard
        </Link>

        {/* Operations */}
        <div className="od-nav-section-lbl">Operations</div>
        <Link to="/app/team" onClick={onClose} className={`od-nav-link ${isActive('/app/team') ? 'on' : ''}`}>
          <svg className="od-nav-ic" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M1.5 12c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Team
        </Link>
        <Link to="/app/attendance" onClick={onClose} className={`od-nav-link ${isActive('/app/attendance') ? 'on' : ''}`}>
          <svg className="od-nav-ic" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M4 1v2M10 1v2M1 5.5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Attendance
        </Link>

        {/* Finance */}
        <div className="od-nav-section-lbl">Finance</div>
        <Link to="/app/billing" onClick={onClose} className={`od-nav-link ${isActive('/app/billing') ? 'on' : ''}`}>
          <svg className="od-nav-ic" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M4.5 3.5h4a2 2 0 010 4H4.5m0 0h3.5a2 2 0 010 4H4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Billing
        </Link>
        <Link to="/app/approvals/contracts" onClick={onClose} className={`od-nav-link ${isActive('/app/approvals/contracts') ? 'on' : ''}`}>
          <svg className="od-nav-ic" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L8.8 5H13L9.5 7.5L10.9 11.5L7 9L3.1 11.5L4.5 7.5L1 5H5.2L7 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          Approvals
          <div className="od-notif-badge">2</div>
        </Link>

        {/* Admin */}
        <div className="od-nav-section-lbl">Admin</div>
        <Link to="/app/settings" onClick={onClose} className={`od-nav-link ${isActive('/app/settings') ? 'on' : ''}`}>
          <svg className="od-nav-ic" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.64 2.64l1.41 1.41M9.95 9.95l1.41 1.41M2.64 11.36l1.41-1.41M9.95 4.05l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Settings
        </Link>

        {/* Account */}
        <div className="od-nav-section-lbl">Account</div>
        <Link to="/" onClick={onClose} className={`od-nav-link on`}>
          <svg className="od-nav-ic" viewBox="0 0 14 14" fill="none">
            <path d="M1 6.5L7 1l6 5.5v6.5H8.5v-4H5.5v4H1V6.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          Home
        </Link>
        <div
          className="od-nav-link on"
          onClick={() => {
            logout();
            onClose?.();
            navigate('/');
          }}
          role="button"
          aria-label="Logout"
        >
          <svg className="od-nav-ic" viewBox="0 0 14 14" fill="none">
            <path d="M5 2H2v10h3M9 10l3-3-3-3M6 7h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Logout
        </div>
      </div>

      {/* User block */}
      <div className="od-sidebar-bottom">
        <div className="od-user-block">
          <div className="od-ava">{user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'OW'}</div>
          <div>
            <div className="od-u-name">{user?.name || 'Owner'}</div>
            <div className="od-u-role">System Owner</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
