import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2,
  Users,
  Variable,
  Lock,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ContractTemplate } from './types';
import { clmService } from '@/features/employee/services/clmService';
import { toast } from 'sonner';

const TemplateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');

  const [template, setTemplate] = useState<ContractTemplate | null>(null);

  const applyPreset = (preset: 'MSA' | 'NDA' | 'SOW') => {
    if (!template) return;
    const contents: Record<string, string> = {
      MSA: [
        '# Master Services Agreement',
        'This Master Services Agreement ("Agreement") is entered into between {{CompanyName}} and {{VendorName}} effective {{StartDate}}.',
        '## Services',
        'Vendor will provide services as outlined in attached statements of work.',
        '## Payment',
        'Total contract value: {{ContractValue}}. Payment terms: {{PaymentTerms}}.',
        '## Term and Termination',
        'This Agreement remains in effect until terminated per the termination clause.',
      ].join('\n\n'),
      NDA: [
        '# Non-Disclosure Agreement',
        'This NDA is made between {{CompanyName}} and {{CounterpartyName}} effective {{StartDate}}.',
        '## Confidential Information',
        'Confidential information includes all non-public information disclosed.',
        '## Obligations',
        'Parties agree to keep information confidential and use only for permitted purposes.',
        '## Term',
        'This NDA is effective for {{TermMonths}} months from the effective date.',
      ].join('\n\n'),
      SOW: [
        '# Statement of Work',
        'Project for {{CompanyName}} commencing {{StartDate}}.',
        '## Scope',
        'Deliverables: {{Deliverables}}.',
        '## Schedule',
        'Milestones: {{Milestones}}.',
        '## Fees',
        'Total: {{ContractValue}}. Payment terms: {{PaymentTerms}}.',
      ].join('\n\n'),
    };
    setTemplate({ ...template, contract_type: preset, content: contents[preset] });
    toast.success(`${preset} preset applied`);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await clmService.getTemplate(id || '');
        setTemplate(data);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load template');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading || !template) {
    return <div className="p-8 text-center">Loading template...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/clm/templates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1A3C34]">{template.name}</h1>
            <Badge className={template.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}>
              {template.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <Badge variant="outline">v{template.version}</Badge>
            <span>•</span>
            <span>{template.contract_type}</span>
            <span>•</span>
            <span>Last updated {template.updated_at}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            if (!template) return;
            try {
              const updated = await clmService.updateTemplate(template.id, { name: template.name, contract_type: template.contract_type, content: template.content });
              setTemplate(updated);
              toast.success('Saved as draft');
            } catch (e) {
              console.error(e);
              toast.error('Failed to save');
            }
          }}>
            Save as Draft
          </Button>
          <Button className="bg-[#1A3C34] text-white" onClick={async () => {
            if (!template) return;
            try {
              const updated = await clmService.updateTemplate(template.id, { name: template.name, contract_type: template.contract_type, content: template.content });
              const nextVersion = (template.version || 1) + 1;
              const final = await clmService.updateTemplate(template.id, { version: nextVersion, name: template.name, contract_type: template.contract_type, content: template.content });
              setTemplate(final);
              toast.success(`Published v${final.version}`);
            } catch (e) {
              console.error(e);
              toast.error('Failed to publish');
            }
          }}>
            <Save className="h-4 w-4 mr-2" />
            Publish Version
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardHeader className="border-b py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Template Editor
                </CardTitle>
                <div className="text-xs text-slate-500">
                  Supports Markdown & Variables
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Textarea 
                className="w-full h-full resize-none border-0 p-4 focus-visible:ring-0 font-mono text-sm"
                value={template.content}
                onChange={(e) => setTemplate({...template, content: e.target.value})}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ready-made</CardTitle>
              <CardDescription>Quickly apply a preset layout.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => applyPreset('MSA')}>Use MSA</Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('NDA')}>Use NDA</Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('SOW')}>Use SOW</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Variable className="h-4 w-4" />
                Variables
              </CardTitle>
              <CardDescription>
                Placeholders to be replaced during contract creation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-2 bg-slate-50 rounded border text-sm font-mono text-[#1A3C34]">{'{{CompanyName}}'}</div>
                <div className="p-2 bg-slate-50 rounded border text-sm font-mono text-[#1A3C34]">{'{{StartDate}}'}</div>
                <div className="p-2 bg-slate-50 rounded border text-sm font-mono text-[#1A3C34]">{'{{ContractValue}}'}</div>
                <div className="p-2 bg-slate-50 rounded border text-sm font-mono text-[#1A3C34]">{'{{PaymentTerms}}'}</div>
              </div>
              <p className="text-xs text-slate-500">
                Tip: Use double curly braces to define a variable in the editor.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Permissions
              </CardTitle>
              <CardDescription>
                Who can use this template?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Legal Team</div>
                    <div className="text-xs text-slate-500">Full Access</div>
                  </div>
                </div>
                <Switch checked={true} disabled />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Sales Managers</div>
                    <div className="text-xs text-slate-500">Can Use</div>
                  </div>
                </div>
                <Switch checked={true} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 text-slate-600 rounded-full">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">All Employees</div>
                    <div className="text-xs text-slate-500">No Access</div>
                  </div>
                </div>
                <Switch checked={false} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetail;
