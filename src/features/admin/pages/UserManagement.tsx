import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Shield, Mail, Lock, Power, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { adminService } from '../services/adminService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { API_CONFIG } from '@/config/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  type: 'admin' | 'owner' | 'employee' | 'customer';
  status?: string;
  createdAt?: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'employees' | 'customers'>('all');
  const { toast } = useToast();
  const { user } = useAuth();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [waLink, setWaLink] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: (error instanceof Error ? error.message : 'Failed to load users'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'owner') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, []);

  const viewerRole = user?.role;
  const roleScoped = users;
  const filteredUsers = roleScoped.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const employeesFiltered = roleScoped.filter(u => u.role === 'employee').filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const customersFiltered = roleScoped.filter(u => u.role === 'customer').filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const listToRender = viewMode === 'employees' ? employeesFiltered : viewMode === 'customers' ? customersFiltered : filteredUsers;

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-slate-100 text-slate-700 hover:bg-slate-100'; // Default/Unknown
    if (status === 'active') return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
    if (status === 'inactive') return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
    return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const allowed = user?.role === 'admin' || user?.role === 'owner';
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-2">Control who can access the system. Admin controls access, not behavior.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers} disabled={loading || !allowed}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setInviteOpen(true)} disabled={!allowed}>
              <Plus className="mr-2 h-4 w-4" /> Invite Employee
            </Button>
        </div>
      </div>

      {!allowed && (
        <div className="rounded border p-4 bg-amber-50 text-amber-700">
          Access denied: Only Admin or Owner can view and manage users.
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border border-slate-200 overflow-hidden">
                <button
                  className={`px-3 py-1.5 text-sm ${viewMode === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}
                  onClick={() => setViewMode('all')}
                  disabled={loading}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1.5 text-sm border-l border-slate-200 ${viewMode === 'employees' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}
                  onClick={() => setViewMode('employees')}
                  disabled={loading}
                >
                  Employees
                </button>
                <button
                  className={`px-3 py-1.5 text-sm border-l border-slate-200 ${viewMode === 'customers' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}
                  onClick={() => setViewMode('customers')}
                  disabled={loading}
                >
                  Customers
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <CardDescription>
            Manage user accounts, roles, and access status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : listToRender.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">No users found.</TableCell>
                  </TableRow>
                ) : (
                  listToRender.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-medium text-slate-600">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal capitalize">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{user.status || 'Active'}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={async () => {
                                const newRole = window.prompt('Enter new role (admin, owner, employee, customer):', user.role);
                                if (!newRole) return;
                                const role = newRole.toLowerCase();
                                if (!['admin', 'owner', 'employee', 'customer'].includes(role)) {
                                  toast({ title: 'Invalid role', description: 'Allowed: admin, owner, employee, customer', variant: 'destructive' });
                                  return;
                                }
                                try {
                                  await adminService.updateUserRole(user._id, role as any);
                                  toast({ title: 'Role updated', description: `${user.email} → ${role}` });
                                  fetchUsers();
                                } catch (e: any) {
                                  toast({ title: 'Failed to update role', description: e.message || 'Error', variant: 'destructive' });
                                }
                              }}
                            >
                              <Shield className="mr-2 h-4 w-4" /> Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  await adminService.resetPassword(user.email);
                                  toast({ title: 'Reset link sent', description: `Email sent to ${user.email}` });
                                } catch (e: any) {
                                  toast({ title: 'Failed to send reset link', description: e.message || 'Error', variant: 'destructive' });
                                }
                              }}
                            >
                              <Mail className="mr-2 h-4 w-4" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  await adminService.forceLogout(user._id);
                                  toast({ title: 'User forced to logout', description: user.email });
                                  fetchUsers();
                                } catch (e: any) {
                                  toast({ title: 'Failed to force logout', description: e.message || 'Error', variant: 'destructive' });
                                }
                              }}
                            >
                              <Lock className="mr-2 h-4 w-4" /> Force Logout
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className={user.status === 'active' ? 'text-red-600' : 'text-emerald-600'}
                              onClick={async () => {
                                try {
                                  if (user.status === 'active') {
                                    await adminService.forceLogout(user._id);
                                    toast({ title: 'User disabled', description: user.email });
                                  } else {
                                    await adminService.enableUser(user._id);
                                    toast({ title: 'User enabled', description: user.email });
                                  }
                                  fetchUsers();
                                } catch (e: any) {
                                  toast({ title: 'Failed to update user', description: e.message || 'Error', variant: 'destructive' });
                                }
                              }}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {user.status === 'active' ? 'Disable User' : 'Enable User'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input placeholder="e.g. Jane Doe" value={inviteFullName} onChange={(e) => setInviteFullName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" placeholder="jane@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>WhatsApp Number (optional)</Label>
              <Input placeholder="e.g. 15551234567" value={invitePhone} onChange={(e) => setInvitePhone(e.target.value)} />
              <p className="text-xs text-muted-foreground">Enter country code without + (e.g., 919876543210)</p>
            </div>
            {waLink && (
              <div className="rounded border p-3 bg-slate-50">
                <p className="text-sm font-medium mb-2">WhatsApp Template Preview</p>
                <div className="text-xs whitespace-pre-wrap">
                  {decodeURIComponent(waLink.split('text=')[1] || '')}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" onClick={() => window.open(waLink!, '_blank')}>Open WhatsApp</Button>
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(waLink!)}>Copy Link</Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { setInviteOpen(false); setWaLink(null); }}>Cancel</Button>
            <Button
              disabled={inviteSending || !inviteEmail || !inviteFullName}
              onClick={async () => {
                if (!user?.id) {
                  toast({ title: 'Error', description: 'Missing admin context', variant: 'destructive' });
                  return;
                }
                setInviteSending(true);
                try {
                  const token = localStorage.getItem('token') || '';
                  const res = await fetch(`${API_CONFIG.baseUrl}/invitations/employee/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                      email: inviteEmail,
                      companyName: 'SISWIT',
                      fullName: inviteFullName
                    })
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data?.message || 'Invite failed');
                  toast({ title: 'Invitation sent', description: 'Email invite sent successfully' });
                  if (invitePhone) {
                    const sanitized = invitePhone.replace(/\s+/g, '');
                    const isValidPhone = /^[1-9]\d{7,14}$/.test(sanitized);
                    if (!isValidPhone) {
                      toast({ title: 'Invalid WhatsApp number', description: 'Include country code, digits only, 8-15 length', variant: 'destructive' });
                    } else {
                    const r2 = await fetch(`${API_CONFIG.baseUrl}/invitations/resend/${data.invitationId}`, { method: 'POST' });
                    const d2 = await r2.json();
                    if (r2.ok && d2?.token) {
                      const acceptUrl = `${window.location.origin}/accept-invite/${d2.token}`;
                      const message = `Hello ${inviteFullName},\n\nYou’ve been invited to join SISWIT as an employee.\n\nAccept Invitation: ${acceptUrl}\n\nThis invitation expires in 48 hours and is single-use.\n\nBest Regards,\nSISWIT Team`;
                      const link = `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
                      setWaLink(link);
                    }
                    }
                  }
                  setInviteEmail('');
                  setInviteFullName('');
                } catch (e: any) {
                  toast({ title: 'Error', description: e.message || 'Failed to send invite', variant: 'destructive' });
                } finally {
                  setInviteSending(false);
                }
              }}
            >
              {inviteSending ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
