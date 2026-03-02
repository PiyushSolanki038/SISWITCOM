import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { API_CONFIG } from '@/config/api';

type AttendanceRow = {
  id: string;
  date: string;
  checkInTime: string;
  ip?: string;
  tenantId?: string;
  user?: { email?: string };
};

const AdminAttendancePage: React.FC = () => {
  const [rows, setRows] = useState<AttendanceRow[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_CONFIG.baseUrl}/attendance/admin/all`);
      const data = await res.json();
      if (res.ok) setRows(data as AttendanceRow[]);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Tenants Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rows.map(r => (
              <div key={r.id} className="grid grid-cols-5 gap-2 border rounded p-2">
                <span>{new Date(r.date).toDateString()}</span>
                <span>{new Date(r.checkInTime).toLocaleTimeString()}</span>
                <span>{r.user?.email}</span>
                <span className="text-slate-500 text-xs">{r.tenantId}</span>
                <span className="text-slate-500 text-xs">{r.ip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAttendancePage;
