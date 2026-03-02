import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api';

type AttendanceRow = {
  id: string;
  date: string;
  checkInTime: string;
};

const EmployeeAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [message, setMessage] = useState<string>('');

  const load = async () => {
    const token = localStorage.getItem('token') || '';
    const res = await fetch(`${API_CONFIG.baseUrl}/attendance/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setRows(data as AttendanceRow[]);
  };

  useEffect(() => { load(); }, []);

  const checkIn = async () => {
    const token = localStorage.getItem('token') || '';
    const res = await fetch(`${API_CONFIG.baseUrl}/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-device-info': 'web', Authorization: `Bearer ${token}` },
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Checked in successfully');
      load();
    } else {
      setMessage(data.message || 'Failed to check-in');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={checkIn}>Mark Attendance</Button>
          {message && <p className="mt-2 text-sm">{message}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>My Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rows.map(r => (
              <div key={r.id} className="flex justify-between border rounded p-2">
                <span>{new Date(r.date).toDateString()}</span>
                <span>Check-in: {new Date(r.checkInTime).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAttendancePage;
