import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NotificationBell from '@/components/common/NotificationBell';
import ChatWidget from '@/components/common/ChatWidget';

const OrgSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <>
      <div className="od-topstrip">
        <div className="od-breadcrumb">SISWIT &nbsp;/&nbsp; <span>Settings</span></div>
        <div className="od-topstrip-right"><NotificationBell /><ChatWidget /></div>
      </div>
      <div className="od-content">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-white border border-black/10">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="numbering">Numbering</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="od-panel">
            <div className="od-panel-head">
              <div>
                <div className="od-panel-title">Company Details</div>
                <div className="od-panel-subtitle">Public information about your organization.</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Company Name</Label>
                <Input className="bg-white border-black/10 text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#3B82F6]" defaultValue="Acme Corp" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label>Default Currency</Label>
                    <Input className="bg-white border-black/10 text-[#64748B]" defaultValue="USD ($)" disabled />
                 </div>
                 <div className="grid gap-2">
                    <Label>Timezone</Label>
                    <Input className="bg-white border-black/10 text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#3B82F6]" defaultValue="UTC-5 (EST)" />
                 </div>
              </div>
              <div className="grid gap-2">
                <Label>Support Email</Label>
                <Input className="bg-white border-black/10 text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#3B82F6]" defaultValue="support@acme.com" />
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="bg-[#3B82F6] hover:bg-[#316fd1] text-white">Save Changes</Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="branding">
           <div className="od-panel">
              <div className="od-panel-head">
                 <div>
                   <div className="od-panel-title">Brand Assets</div>
                   <div className="od-panel-subtitle">Logos and colors for emails and PDFs.</div>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="p-8 border-2 border-dashed border-black/10 rounded-lg flex flex-col items-center justify-center text-[#64748B]">
                    <p>Drag and drop logo here</p>
                    <Button variant="link" className="text-[#3B82F6]">or browse files</Button>
                 </div>
              </div>
           </div>
        </TabsContent>
        
        <TabsContent value="numbering">
           <div className="od-panel">
              <div className="od-panel-head">
                 <div>
                   <div className="od-panel-title">Document Numbering</div>
                   <div className="od-panel-subtitle">Configure prefixes and sequences.</div>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="grid gap-2">
                    <Label>Quote Prefix</Label>
                    <Input className="bg-white border-black/10 text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#3B82F6]" defaultValue="Q-" />
                 </div>
                 <div className="grid gap-2">
                    <Label>Contract Prefix</Label>
                    <Input className="bg-white border-black/10 text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#3B82F6]" defaultValue="CTR-" />
                 </div>
                 <div className="pt-4 flex justify-end">
                   <Button className="bg-[#3B82F6] hover:bg-[#316fd1] text-white">Save Changes</Button>
                 </div>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="team">
          <div className="od-panel">
            <div className="od-panel-head">
              <div>
                <div className="od-panel-title">Team Settings</div>
                <div className="od-panel-subtitle">Defaults and access controls for team management.</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Default Role for New Invites</Label>
                <Select defaultValue="employee">
                  <SelectTrigger className="bg-white border-black/10 text-[#0F172A]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="z-[10001]">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#0F172A]">Allow external invites</p>
                  <p className="text-xs text-[#64748B]">Permit inviting users outside your domain.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator className="my-1" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#0F172A]">Require email verification</p>
                  <p className="text-xs text-[#64748B]">New users must verify email before access.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="grid gap-2">
                <Label>Auto-expire invites after (days)</Label>
                <Input type="number" className="bg-white border-black/10 text-[#0F172A]" defaultValue={7} />
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="bg-[#3B82F6] hover:bg-[#316fd1] text-white">Save Changes</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="od-panel">
            <div className="od-panel-head">
              <div>
                <div className="od-panel-title">Attendance Policies</div>
                <div className="od-panel-subtitle">Working hours and capture rules.</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Workday Start</Label>
                  <Input className="bg-white border-black/10 text-[#0F172A]" defaultValue="09:00" />
                </div>
                <div className="grid gap-2">
                  <Label>Workday End</Label>
                  <Input className="bg-white border-black/10 text-[#0F172A]" defaultValue="18:00" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Timezone</Label>
                <Input className="bg-white border-black/10 text-[#0F172A]" defaultValue="UTC" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#0F172A]">Require IP capture</p>
                  <p className="text-xs text-[#64748B]">Record public IP on check-in.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#0F172A]">Allow backdated check-ins</p>
                  <p className="text-xs text-[#64748B]">Permit manual entries for past dates.</p>
                </div>
                <Switch />
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="bg-[#3B82F6] hover:bg-[#316fd1] text-white">Save Changes</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="od-panel">
            <div className="od-panel-head">
              <div>
                <div className="od-panel-title">Billing Preferences</div>
                <div className="od-panel-subtitle">Cycles and payment options.</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Billing Cycle</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger className="bg-white border-black/10 text-[#0F172A]">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent className="z-[10001]">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#0F172A]">Auto-pay enabled</p>
                  <p className="text-xs text-[#64748B]">Automatically charge default payment method.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#0F172A]">Retry failed payments</p>
                  <p className="text-xs text-[#64748B]">Apply dunning schedule on failures.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="grid gap-2">
                <Label>Default Invoice Net Terms (days)</Label>
                <Input type="number" className="bg-white border-black/10 text-[#0F172A]" defaultValue={30} />
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="bg-[#3B82F6] hover:bg-[#316fd1] text-white">Save Changes</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approvals">
          <div className="od-panel">
            <div className="od-panel-head">
              <div>
                <div className="od-panel-title">Approval Rules</div>
                <div className="od-panel-subtitle">Thresholds and reviewers.</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>CPQ Approval Threshold ($)</Label>
                <Input type="number" className="bg-white border-black/10 text-[#0F172A]" defaultValue={5000} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#0F172A]">Require owner approval above threshold</p>
                  <p className="text-xs text-[#64748B]">Owner must approve high-value quotes.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#0F172A]">CLM requires dual approval</p>
                  <p className="text-xs text-[#64748B]">Two reviewers required for contracts.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#0F172A]">Notify by email on requests</p>
                  <p className="text-xs text-[#64748B]">Send notifications to approvers.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="bg-[#3B82F6] hover:bg-[#316fd1] text-white">Save Changes</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
};

export default OrgSettingsPage;
