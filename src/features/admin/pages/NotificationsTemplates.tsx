import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Mail, Bell, Eye, Copy, Undo2, Redo2, ListChecks, FileText } from 'lucide-react';
import { adminService } from '../services/adminService';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import RichTemplateEditor, { RichTemplateEditorHandle } from '@/components/editor/RichTemplateEditor';
import { useToast } from '@/components/ui/use-toast';

const NotificationsTemplatesPage: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; is_active: boolean }>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [templateSearch, setTemplateSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<{ count: number; placeholders: string[] } | null>(null);
  const htmlRef = useRef<HTMLTextAreaElement | null>(null);
  const rteRef = useRef<RichTemplateEditorHandle | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const list = await adminService.getEmailTemplates();
      setTemplates(list);
      if (list.length > 0) {
        const first = await adminService.getEmailTemplate(list[0].id);
        setSelectedId(first.id);
        setSubject(first.subject || '');
        setHtml(first.html || '');
        setIsActive(typeof first.is_active === 'boolean' ? first.is_active : true);
      } else {
        setSelectedId(null);
        setSubject('');
        setHtml('');
        setIsActive(true);
      }
    } catch (e: any) {
      toast({ title: 'Failed to load templates', description: e.message || 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = async (id: string) => {
    try {
      const t = await adminService.getEmailTemplate(id);
      setSelectedId(t.id);
      setSubject(t.subject || '');
      setHtml(t.html || '');
      setIsActive(typeof t.is_active === 'boolean' ? t.is_active : true);
    } catch (e: any) {
      toast({ title: 'Failed to load template', description: e.message || 'Error', variant: 'destructive' });
    }
  };

  const saveTemplate = async () => {
    try {
      if (selectedId) {
        await adminService.updateEmailTemplate(selectedId, { subject, html, is_active: isActive });
        toast({ title: 'Template saved' });
      } else {
        const created = await adminService.createEmailTemplate({ name: 'New Template', subject, html });
        await loadTemplates();
        if (created?.id) await selectTemplate(created.id);
        toast({ title: 'Template created' });
      }
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message || 'Error', variant: 'destructive' });
    }
  };

  const sendTest = async () => {
    try {
      await adminService.sendTestEmailTemplate({ subject, html });
      toast({ title: 'Test email sent' });
    } catch (e: any) {
      toast({ title: 'Send failed', description: e.message || 'Error', variant: 'destructive' });
    }
  };

  const createNew = () => {
    setSelectedId(null);
    setSubject('Welcome to {{company_name}}');
    setHtml(
      `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{{company_name}}</title>
    <style>
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(16,24,40,0.06); }
      .brandbar { background: #2563eb; height: 6px; }
      .section { padding: 24px; }
      .title { font-size: 22px; line-height: 1.3; color: #0f172a; margin: 0 0 12px 0; }
      .text { font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 16px 0; }
      .btn { background: #2563eb; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 8px; display: inline-block; font-weight: 600; }
      .footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; line-height: 1.6; }
    </style>
  </head>
  <body style="margin:0;background:#f5f7fb;">
    <div class="brandbar"></div>
    <div style="width:100%; padding: 24px 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="container">
        <tr>
          <td class="section">
            <div style="font-size:12px;color:#64748b;">{{company_name}}</div>
            <h1 class="title">Welcome to {{company_name}}</h1>
            <p class="text">We’re excited to have you on board. Explore the latest features and start achieving more today.</p>
            <a href="{{cta_url}}" class="btn">Get Started</a>
          </td>
        </tr>
        <tr>
          <td class="footer">
            © {{company_name}} • Automated message
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`
    );
    setIsActive(true);
  };

  const duplicateCurrent = async () => {
    try {
      if (!selectedId) return;
      const base = templates.find(t => t.id === selectedId);
      const name = base ? `${base.name} Copy` : 'Template Copy';
      const created = await adminService.createEmailTemplate({ name, subject, html });
      await loadTemplates();
      if (created?.id) await selectTemplate(created.id);
      toast({ title: 'Template duplicated' });
    } catch (e: any) {
      toast({ title: 'Duplicate failed', description: e.message || 'Error', variant: 'destructive' });
    }
  };

  const deleteCurrent = async () => {
    if (!selectedId) return;
    try {
      await adminService.deleteEmailTemplate(selectedId);
      toast({ title: 'Template deleted' });
      await loadTemplates();
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message || 'Error', variant: 'destructive' });
    }
  };

  const insertVariable = (variable: string) => {
    const el = htmlRef.current;
    if (!el) {
      setHtml((prev) => prev + variable);
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const next = html.slice(0, start) + variable + html.slice(end);
    setHtml(next);
    setTimeout(() => {
      el.focus();
      const pos = start + variable.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const validateTemplate = async () => {
    try {
      const res = await adminService.validateEmailTemplate({ subject, html });
      setValidation({ count: res.count || 0, placeholders: res.placeholders || [] });
      toast({ title: 'Template validated', description: `${res.count || 0} placeholder(s) found` });
    } catch (e: any) {
      toast({ title: 'Validation failed', description: e.message || 'Error', variant: 'destructive' });
    }
  };

  const presets = [
    {
      name: 'User Welcome',
      subject: 'Welcome, {{user_name}}',
      html: `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /><title>Welcome</title><style>.container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(16,24,40,0.06)}.section{padding:24px}.title{font-size:22px;line-height:1.3;color:#0f172a;margin:0 0 12px 0}.text{font-size:16px;line-height:1.6;color:#334155;margin:0 0 16px 0}.btn{background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:600}.footer{padding:16px 24px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.6}</style></head><body style="margin:0;background:#f5f7fb;"><div style="width:100%; padding: 24px 0;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="container"><tr><td class="section"><div style="font-size:12px;color:#64748b;">{{company_name}}</div><h1 class="title">Welcome to {{company_name}}</h1><p class="text">Hello {{user_name}}, your account is ready.</p><a href="{{cta_url}}" class="btn">Get Started</a></td></tr><tr><td class="footer">© {{company_name}}</td></tr></table></div></body></html>`
    },
    {
      name: 'Quote Approved',
      subject: 'Quote {{quote_number}} approved',
      html: `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /><title>Quote Approved</title></head><body style="margin:0;background:#f5f7fb;"><div style="width:100%; padding: 24px 0;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(16,24,40,0.06)"><tr><td style="padding:24px;"><div style="font-size:12px;color:#64748b;">{{company_name}}</div><h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:#0f172a">Quote {{quote_number}} approved</h1><p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#334155">Your quote has been approved.</p><a href="{{cta_url}}" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:600">View Quote</a></td></tr><tr><td style="padding:16px 24px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">© {{company_name}}</td></tr></table></div></body></html>`
    },
    {
      name: 'Contract Expiring',
      subject: 'Contract {{contract_number}} expiring soon',
      html: `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /><title>Contract Expiring</title></head><body style="margin:0;background:#f5f7fb;"><div style="width:100%; padding: 24px 0;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(16,24,40,0.06)"><tr><td style="padding:24px;"><div style="font-size:12px;color:#64748b;">{{company_name}}</div><h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:#0f172a">Contract {{contract_number}} expiring</h1><p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#334155">Your contract will expire soon.</p><a href="{{cta_url}}" style="background:#ef4444;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:600">Review Contract</a></td></tr><tr><td style="padding:16px 24px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">© {{company_name}}</td></tr></table></div></body></html>`
    }
  ];

  const createPreset = async (preset: { name: string; subject: string; html: string }) => {
    try {
      setLoading(true);
      const created = await adminService.createEmailTemplate({ name: preset.name, subject: preset.subject, html: preset.html });
      await loadTemplates();
      if (created?.id) await selectTemplate(created.id);
      toast({ title: 'Template created', description: preset.name });
    } catch (e: any) {
      toast({ title: 'Create failed', description: e.message || 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const [triggers, setTriggers] = useState<any>({
    newLeadAssigned: { email: true, inApp: true },
    quoteApproved: { email: true, inApp: true },
    contractExpiring: { email: true, inApp: false },
    systemMaintenance: { email: false, inApp: true }
  });
  const loadTriggers = async () => {
    try {
      const t = await adminService.getNotificationTriggers();
      setTriggers(t);
    } catch (e: any) {}
  };
  const updateTrigger = async (key: string, field: 'email' | 'inApp' | 'templateId', value: boolean | string) => {
    const next = { ...triggers, [key]: { ...(triggers[key] || {}), [field]: value } };
    setTriggers(next);
    try {
      await adminService.updateNotificationTriggers(next);
    } catch (e: any) {}
  };

  useEffect(() => {
    loadTemplates();
    loadTriggers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notifications & Templates</h1>
        <p className="text-slate-500 mt-2">Manage professionally designed email templates with {'{{company_name}}'} placeholders.</p>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
            <TabsTrigger value="email">Email Templates</TabsTrigger>
            <TabsTrigger value="triggers">Notification Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Templates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start font-normal" onClick={createNew}>
                          + New Template
                        </Button>
                        <Input placeholder="Search templates..." value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} />
                        <Separator />
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start font-normal" onClick={() => createPreset(presets[0])} disabled={loading}>
                            + New User Welcome
                          </Button>
                          <Button variant="outline" className="w-full justify-start font-normal" onClick={() => createPreset(presets[1])} disabled={loading}>
                            + New Quote Approved
                          </Button>
                          <Button variant="outline" className="w-full justify-start font-normal" onClick={() => createPreset(presets[2])} disabled={loading}>
                            + New Contract Expiring
                          </Button>
                        </div>
                        {(templates.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase()))).map((t) => (
                          <Button key={t.id} variant={selectedId === t.id ? 'secondary' : 'ghost'} className="w-full justify-start font-normal" onClick={() => selectTemplate(t.id)}>
                              <Mail className="mr-2 h-4 w-4 text-slate-400" />
                              {t.name}
                              {t.is_active ? <Badge variant="outline" className="ml-auto">Active</Badge> : <Badge variant="outline" className="ml-auto">Inactive</Badge>}
                          </Button>
                        ))}
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Edit Template</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Subject Line</Label>
                            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
                        </div>
                         <div className="space-y-2">
                            <Label>Body Content (HTML)</Label>
                            <Textarea ref={htmlRef} className="font-mono h-64" value={html} onChange={(e) => setHtml(e.target.value)} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-1">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Eye className="h-4 w-4" /> Preview (Editable)
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Button variant="outline" size="sm" onClick={() => rteRef.current?.bold?.()}>Bold</Button>
                                <Button variant="outline" size="sm" onClick={() => rteRef.current?.italic?.()}>Italic</Button>
                                <Button variant="outline" size="sm" onClick={() => rteRef.current?.underline?.()}>Underline</Button>
                                <Separator orientation="vertical" />
                                <Button variant="outline" size="sm" onClick={() => rteRef.current?.heading1?.()}>H1</Button>
                                <Button variant="outline" size="sm" onClick={() => rteRef.current?.paragraph?.()}>Paragraph</Button>
                                <Separator orientation="vertical" />
                                <Button variant="outline" size="sm" onClick={() => rteRef.current?.bulletList?.()}>Bullet List</Button>
                                <Button variant="outline" size="sm" onClick={() => rteRef.current?.orderedList?.()}>Numbered List</Button>
                                <Separator orientation="vertical" />
                                <Button variant="outline" size="sm" onClick={() => { const url = window.prompt('Link URL', 'https://'); if (url) rteRef.current?.link?.(url); }}>Link</Button>
                                <Separator orientation="vertical" />
                                <Button variant="secondary" size="sm" onClick={() => rteRef.current?.insertCTA?.()}>Insert CTA</Button>
                                <Button variant="secondary" size="sm" onClick={() => rteRef.current?.insertDivider?.()}>Insert Divider</Button>
                                <Separator orientation="vertical" />
                                <Button variant="outline" size="sm" onClick={() => rteRef.current?.undo?.()}><Undo2 className="h-4 w-4" /></Button>
                                <Button variant="outline" size="sm" onClick={() => rteRef.current?.redo?.()}><Redo2 className="h-4 w-4" /></Button>
                              </div>
                              <RichTemplateEditor ref={rteRef} value={html} onChange={setHtml} />
                            </CardContent>
                          </Card>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Variables</CardTitle>
                              <CardDescription>Placeholders</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                              {['{{company_name}}','{{user_name}}','{{quote_number}}','{{contract_number}}','{{cta_url}}'].map(v => (
                                <Button key={v} variant="outline" size="sm" onClick={() => insertVariable(v)}>{v}</Button>
                              ))}
                              <div className="w-full mt-2">
                                <Button variant="secondary" onClick={validateTemplate}>Validate</Button>
                                {validation && (
                                  <div className="text-xs text-slate-500 mt-2">
                                    Found {validation.count} placeholder(s): {validation.placeholders.join(', ')}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="flex justify-end gap-2">
                            {selectedId && (
                              <Button variant="outline" onClick={async () => {
                                const next = !isActive;
                                setIsActive(next);
                                try {
                                  await adminService.updateEmailTemplate(selectedId, { is_active: next });
                                  await loadTemplates();
                                } catch (e: any) {}
                              }}>
                                {isActive ? 'Disable' : 'Enable'}
                              </Button>
                            )}
                            <Button variant="outline" onClick={sendTest} disabled={loading || !subject || !html}>Send Test Email</Button>
                            <Button onClick={saveTemplate} disabled={loading || !subject || !html}>{selectedId ? 'Save Changes' : 'Create Template'}</Button>
                            {selectedId && <Button variant="outline" onClick={duplicateCurrent}><Copy className="mr-2 h-4 w-4" /> Duplicate</Button>}
                            {selectedId && <Button variant="destructive" onClick={deleteCurrent}>Delete</Button>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="triggers">
             <Card>
                <CardHeader>
                    <CardTitle>System Triggers</CardTitle>
                    <CardDescription>Map events to templates</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-6">
                        {[
                          { key: 'newLeadAssigned', title: 'New Lead Assigned', desc: 'Notify sales rep when a lead is assigned.' },
                          { key: 'quoteApproved', title: 'Quote Approved', desc: 'Notify sales rep when their quote is approved.' },
                          { key: 'contractExpiring', title: 'Contract Expiring', desc: 'Notify owner before contract expiry.' },
                          { key: 'systemMaintenance', title: 'System Maintenance', desc: 'Notify all users of downtime.' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h3 className="font-medium">{item.title}</h3>
                              <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                <Mail className={`h-4 w-4 ${triggers?.[item.key]?.email ? 'text-blue-500' : 'text-slate-300'}`} />
                                <Switch checked={!!triggers?.[item.key]?.email} onCheckedChange={(v) => updateTrigger(item.key, 'email', v)} />
                              </div>
                              <div className="flex items-center gap-2">
                                <Bell className={`h-4 w-4 ${triggers?.[item.key]?.inApp ? 'text-blue-500' : 'text-slate-300'}`} />
                                <Switch checked={!!triggers?.[item.key]?.inApp} onCheckedChange={(v) => updateTrigger(item.key, 'inApp', v)} />
                              </div>
                              <div className="w-60">
                                <Select value={triggers?.[item.key]?.templateId || ''} onValueChange={(val) => updateTrigger(item.key, 'templateId', val)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select template" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {templates.map(t => (
                                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        ))}
                     </div>
                </CardContent>
             </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsTemplatesPage;
