import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api';
import NotificationBell from '@/components/common/NotificationBell';

type AttendanceRow = {
  id: string;
  date: string;
  checkInTime: string;
  ip?: string;
  user?: { email?: string };
};

const OwnerAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<AttendanceRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_CONFIG.baseUrl}/attendance/tenant`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const rowsData = Array.isArray(data) ? (data as AttendanceRow[]) : [];
        setRows(rowsData);
      } catch {
        // silently ignore
      }
    })();
  }, [user?.id]);

  return (
    <>
      <div className="od-topstrip">
        <div className="od-breadcrumb">SISWIT &nbsp;/&nbsp; <span>Attendance</span></div>
        <div className="od-topstrip-right">
          <NotificationBell />
        </div>
      </div>
      <div className="od-content">
        <div className="od-panel">
          <div className="od-panel-head">
            <div>
              <div className="od-panel-title">Tenant Attendance</div>
              <div className="od-panel-subtitle">Latest check-ins across your organization</div>
            </div>
          </div>
          <table className="od-tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-in</th>
                <th>User</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><strong>{new Date(r.date).toDateString()}</strong></td>
                  <td>{new Date(r.checkInTime).toLocaleTimeString()}</td>
                  <td>{r.user?.email || '-'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{r.ip || '-'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4}><div className="od-empty">No attendance records</div></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default OwnerAttendancePage;
