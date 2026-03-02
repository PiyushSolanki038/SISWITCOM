import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Globe, Clock, DollarSign } from 'lucide-react';

const SystemSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Settings</h1>
        <p className="text-slate-500 mt-2">Global system behavior and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Localization</CardTitle>
                <CardDescription>Timezone, currency, and language settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label>Default Timezone</Label>
                    <Select defaultValue="utc">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                            <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                            <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label>Currency</Label>
                    <Select defaultValue="usd">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="usd">USD ($)</SelectItem>
                            <SelectItem value="eur">EUR (€)</SelectItem>
                            <SelectItem value="gbp">GBP (£)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label>Date Format</Label>
                    <Select defaultValue="mdy">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                            <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                            <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription>Enable or disable experimental features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>AI Contract Analysis (Beta)</Label>
                        <p className="text-sm text-muted-foreground">Use AI to suggest redlines.</p>
                    </div>
                    <Switch />
                </div>
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Allow users to switch themes.</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Public Sign-up</Label>
                        <p className="text-sm text-muted-foreground">Allow anyone to register an account.</p>
                    </div>
                    <Switch />
                </div>
            </CardContent>
        </Card>

        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Customize the look and feel of the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input defaultValue="Acme Corp" />
                    </div>
                     <div className="space-y-2">
                        <Label>Support Email</Label>
                        <Input defaultValue="support@acme.com" />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-2">
                    <Button>Save Changes</Button>
                    <Button variant="ghost">Reset Defaults</Button>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
