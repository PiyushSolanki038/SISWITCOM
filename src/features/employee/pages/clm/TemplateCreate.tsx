import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { clmService } from '@/features/employee/services/clmService';
import { toast } from 'sonner';

const TemplateCreate: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [contractType, setContractType] = useState('MSA');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const applyPreset = (preset: 'MSA' | 'NDA' | 'SOW') => {
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
    setContractType(preset);
    if (!name.trim()) setName(preset);
    setContent(contents[preset]);
    toast.success(`${preset} preset applied`);
  };

  const submit = async () => {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }
    setSaving(true);
    try {
      const created = await clmService.createTemplate({
        name,
        contract_type: contractType,
        content
      });
      toast.success('Template created');
      navigate(`/employee-dashboard/clm/templates/${created.id}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/clm/templates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#1A3C34]">Create Template</h1>
          <p className="text-slate-500">Define a reusable contract template.</p>
        </div>
        <Button className="bg-[#1A3C34] text-white" onClick={submit} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving…' : 'Create Template'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Template Details
          </CardTitle>
          <CardDescription>Basic information and content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => applyPreset('MSA')}>Use MSA</Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset('NDA')}>Use NDA</Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset('SOW')}>Use SOW</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Template Name</Label>
              <Input placeholder="Master Services Agreement" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contract Type</Label>
              <Input placeholder="MSA" value={contractType} onChange={(e) => setContractType(e.target.value)} />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea className="min-h-[240px] font-mono text-sm" placeholder="Enter template content (Markdown/HTML supported)" value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateCreate;
