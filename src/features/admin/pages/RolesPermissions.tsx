import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Shield, Lock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { adminService } from '../services/adminService';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { adminService as svc } from '../services/adminService';

const RolesPermissionsPage: React.FC = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<{ module: string; [key: string]: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [editRows, setEditRows] = useState<{ module: string; allowed: boolean }[]>([]);
  const [tenantUsers, setTenantUsers] = useState<Array<{ _id: string; email: string; name: string; role: string; status?: string }>>([]);
  const [invites, setInvites] = useState<Array<{ id: string; email: string; role: string; status: string; expiresAt?: string; createdById?: string; createdAt?: string }>>([]);
  const inviterNameById = React.useMemo(() => {
    const m: Record<string, string> = {};
    tenantUsers.forEach(u => {
      m[u._id] = u.name || u.email;
    });
    return m;
  }, [tenantUsers]);
  const invitedByForEmail = React.useMemo(() => {
    const m: Record<string, string> = {};
    const sorted = [...invites].sort((a, b) => {
      const ta = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
      const tb = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
      return tb - ta;
    });
    for (const inv of sorted) {
      const label = (inv.createdById && inviterNameById[inv.createdById]) || inv.createdById || '';
      if (inv.email && !m[inv.email]) m[inv.email] = label;
    }
    return m;
  }, [invites, inviterNameById]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, usersData, invData] = await Promise.all([
        adminService.getRolesPermissions(),
        svc.getUsers(),
        svc.getInvitations().catch(() => [])
      ]);
      setRoles(data.roles.map((r: string) => r.charAt(0).toUpperCase() + r.slice(1)));
      setModules(data.modules.map((m: string) => m.toUpperCase()));
      setMatrix(data.matrix);
      setTenantUsers(Array.isArray(usersData) ? usersData : []);
      setInvites(Array.isArray(invData) ? invData : []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to load roles & permissions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startEditRole = (roleLabel: string) => {
    const rLower = roleLabel.toLowerCase();
    setSelectedRole(roleLabel);
    const rows = modules.map((modLabel) => {
      const mLower = modLabel.toLowerCase();
      const row = matrix.find((r) => r.module === mLower) || { module: mLower };
      const allowed = !!row[rLower];
      return { module: mLower, allowed };
    });
    setEditRows(rows);
    setEditOpen(true);
  };

  const saveToggle = async (roleLower: string, moduleLower: string, next: boolean) => {
    await adminService.updateRolePermission(roleLower, moduleLower, next);
    const newMatrix = matrix.map((rowItem) =>
      rowItem.module === moduleLower ? { ...rowItem, [roleLower]: next } : rowItem
    );
    setMatrix(newMatrix);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Roles & Permissions</h1>
          <p className="text-slate-500 mt-2">Manage security and access control across the platform.</p>
        </div>
        <Button variant="outline">
          <Shield className="mr-2 h-4 w-4" /> Custom Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Overview of access levels for each system role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Module Access</TableHead>
                {roles.map((role) => (
                  <TableHead key={role} className="text-center">{role}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    <TableCell className="font-medium">...</TableCell>
                    {roles.map((r, j) => (
                      <TableCell key={`${i}-${j}`} className="text-center">...</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                modules.map((mod) => {
                  const mLower = mod.toLowerCase();
                  const row = matrix.find((r) => r.module === mLower) || { module: mLower };
                  return (
                    <TableRow key={mod}>
                      <TableCell className="font-medium">{mod}</TableCell>
                      {roles.map((role) => {
                        const rLower = role.toLowerCase();
                        const allowed = row[rLower];
                        return (
                          <TableCell
                            key={role}
                            className="text-center cursor-pointer"
                            onClick={async () => {
                              try {
                                const next = !allowed;
                                await adminService.updateRolePermission(rLower, mLower, next);
                                const newMatrix = matrix.map((rowItem) =>
                                  rowItem.module === mLower ? { ...rowItem, [rLower]: next } : rowItem
                                );
                                setMatrix(newMatrix);
                              } catch (e: any) {
                                toast({ title: 'Update failed', description: e.message || 'Could not update permission', variant: 'destructive' });
                              }
                            }}
                          >
                            {allowed ? (
                              <div className="flex justify-center"><Check className="h-4 w-4 text-emerald-600" /></div>
                            ) : (
                              <div className="flex justify-center"><X className="h-4 w-4 text-slate-300" /></div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>Define and edit role capabilities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {roles.map(role => (
                    <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline">{role}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditRole(role)}
                        >
                          Edit Permissions
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Security Policies</CardTitle>
                <CardDescription>Global security settings for roles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                        <Lock className="h-4 w-4 text-slate-500" />
                        <div>
                            <p className="text-sm font-medium">Critical Permissions Lock</p>
                            <p className="text-xs text-slate-500">Prevent accidental changes to Owner/Admin roles</p>
                        </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">Enabled</Badge>
                </div>
                 <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-slate-500" />
                        <div>
                            <p className="text-sm font-medium">2FA Enforcement</p>
                            <p className="text-xs text-slate-500">Require Two-Factor Auth for Admin/Owner</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                </div>
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tenant Users</CardTitle>
            <CardDescription>Employees, customers, and pending invites for this tenant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-sm font-medium mb-2">Owner</div>
              <div className="space-y-2">
                {tenantUsers.filter(u => u.role === 'owner').length === 0 ? (
                  <div className="text-sm text-slate-500">No owner listed.</div>
                ) : (
                  tenantUsers.filter(u => u.role === 'owner').map(u => (
                    <div key={u._id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-sm font-medium">{u.name || u.email}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                      <Badge variant="outline" className="capitalize">{u.role}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Employees</div>
              <div className="space-y-2">
                {tenantUsers.filter(u => u.role === 'employee').length === 0 ? (
                  <div className="text-sm text-slate-500">No employees yet.</div>
                ) : (
                  tenantUsers.filter(u => u.role === 'employee').slice(0, 6).map(u => (
                    <div key={u._id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-sm font-medium">{u.name || u.email}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                        {invitedByForEmail[u.email] ? (
                          <div className="text-xs text-slate-400">Invited by {invitedByForEmail[u.email]}</div>
                        ) : null}
                      </div>
                      <Badge variant="outline" className="capitalize">{u.status || 'active'}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Customers</div>
              <div className="space-y-2">
                {tenantUsers.filter(u => u.role === 'customer').length === 0 ? (
                  <div className="text-sm text-slate-500">No customers yet.</div>
                ) : (
                  tenantUsers.filter(u => u.role === 'customer').slice(0, 6).map(u => (
                    <div key={u._id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-sm font-medium">{u.name || u.email}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                        {invitedByForEmail[u.email] ? (
                          <div className="text-xs text-slate-400">Invited by {invitedByForEmail[u.email]}</div>
                        ) : null}
                      </div>
                      <Badge variant="outline" className="capitalize">{u.status || 'active'}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Invitations (Pending)</div>
              <div className="space-y-2">
                {invites.filter(i => i.status === 'PENDING').length === 0 ? (
                  <div className="text-sm text-slate-500">No pending invites.</div>
                ) : (
                  invites.filter(i => i.status === 'PENDING').slice(0, 6).map(i => (
                    <div key={i.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-sm font-medium">{i.email}</div>
                        <div className="text-xs text-slate-500 capitalize">
                          {i.role.toLowerCase()}
                          {i.createdAt ? ` • invited ${new Date(i.createdAt).toLocaleDateString()}` : ''}
                          {i.expiresAt ? ` • exp ${new Date(i.expiresAt).toLocaleDateString()}` : ''}
                          {i.createdById && inviterNameById[i.createdById] ? ` • by ${inviterNameById[i.createdById]}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await svc.resendInvitation(i.id);
                              toast({ title: 'Resent', description: `Invite resent to ${i.email}` });
                            } catch (e: any) {
                              toast({ title: 'Resend failed', description: e.message || 'Error', variant: 'destructive' });
                            }
                          }}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Resend
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await svc.revokeInvitation(i.id);
                              setInvites(prev => prev.map(x => x.id === i.id ? { ...x, status: 'REVOKED' } : x));
                              toast({ title: 'Revoked', description: `Invite revoked for ${i.email}` });
                            } catch (e: any) {
                              toast({ title: 'Revoke failed', description: e.message || 'Error', variant: 'destructive' });
                            }
                          }}
                        >
                          <X className="h-3 w-3 mr-1" /> Revoke
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permissions — {selectedRole || ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {editRows.map((row) => {
              const label = row.module.toUpperCase();
              const roleLower = (selectedRole || '').toLowerCase();
              return (
                <div key={row.module} className="flex items-center justify-between rounded border p-3">
                  <div className="text-sm font-medium">{label}</div>
                  <Switch
                    checked={row.allowed}
                    onCheckedChange={async (checked) => {
                      try {
                        setEditRows((prev) =>
                          prev.map((r) => (r.module === row.module ? { ...r, allowed: checked } : r))
                        );
                        await saveToggle(roleLower, row.module, checked);
                      } catch (e: any) {
                        toast({ title: 'Update failed', description: e.message || 'Could not update permission', variant: 'destructive' });
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPermissionsPage;
