import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, Search } from 'lucide-react';

const AuditLogsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Audit Logs</h1>
          <p className="text-slate-500 mt-2">Security & compliance trail. Read-only record of all system events.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search by user, IP, or event..." className="pl-8" />
             </div>
             <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="data">Data Access</SelectItem>
                    <SelectItem value="admin">Admin Action</SelectItem>
                </SelectContent>
             </Select>
             <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4" />
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { time: '2024-02-01 14:32:11', user: 'alice@company.com', event: 'Login', resource: '-', ip: '192.168.1.45', status: 'Success' },
                { time: '2024-02-01 14:30:05', user: 'bob@company.com', event: 'Update Quote', resource: 'Q-2024-001', ip: '192.168.1.12', status: 'Success' },
                { time: '2024-02-01 13:45:22', user: 'unknown', event: 'Failed Login', resource: '-', ip: '45.22.11.9', status: 'Failed' },
                { time: '2024-02-01 12:15:00', user: 'diana@company.com', event: 'Delete User', resource: 'evan@company.com', ip: '192.168.1.5', status: 'Success' },
                { time: '2024-02-01 11:30:15', user: 'system', event: 'Auto-Backup', resource: 'Database', ip: 'localhost', status: 'Success' },
                { time: '2024-02-01 10:10:45', user: 'charlie@company.com', event: 'View Document', resource: 'NDA-004.pdf', ip: '192.168.1.8', status: 'Success' },
              ].map((log, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{log.time}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.event}</TableCell>
                  <TableCell className="font-mono text-xs">{log.resource}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{log.ip}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${log.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {log.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
