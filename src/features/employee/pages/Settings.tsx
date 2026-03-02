import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Lock, Globe, Moon } from 'lucide-react';

const EmployeeSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">Settings</h2>
        <p className="text-slate-500">Manage your application preferences.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#1A3C34]" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-slate-500">Receive emails about your account activity.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-slate-500">Receive push notifications on your device.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-slate-500">Receive emails about new features and offers.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#1A3C34]" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-factor Authentication</Label>
                <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Change Password</Label>
                <p className="text-sm text-slate-500">Update your password regularly.</p>
              </div>
              <Button variant="outline">Update</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#1A3C34]" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize the look and feel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-slate-500">Switch between light and dark themes.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeSettings;
