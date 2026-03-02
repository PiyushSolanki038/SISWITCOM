import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  LayoutTemplate,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { ContractTemplate } from './types';
import { useEffect } from 'react';
import { clmService } from '@/features/employee/services/clmService';
import { toast } from 'sonner';

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineName, setInlineName] = useState('');
  const [inlineType, setInlineType] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }
        const data = await clmService.getTemplates();
        setTemplates(data);
      } catch (e) {
        console.error(e);
        const status = (e as any)?.response?.status;
        if (status === 401) {
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch {}
          navigate('/signin');
          return;
        }
        toast.error('Failed to load templates');
      }
    };
    load();
  }, []);

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.contract_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClone = async (t: ContractTemplate) => {
    try {
      const created = await clmService.createTemplate({
        name: `Copy of ${t.name}`,
        contract_type: t.contract_type,
        content: t.content
      });
      toast.success('Template cloned');
      setTemplates(prev => [created, ...prev]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to clone template');
    }
  };

  const handleToggleActive = async (t: ContractTemplate) => {
    // optimistic update
    setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, is_active: !x.is_active } : x));
    try {
      const updated = await clmService.updateTemplate(t.id, { is_active: !t.is_active });
      setTemplates(prev => prev.map(x => x.id === t.id ? updated : x));
      toast.success(updated.is_active ? 'Template activated' : 'Template deactivated');
    } catch (e: any) {
      // revert on error
      setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, is_active: t.is_active } : x));
      const status = e?.response?.status;
      if (status === 401) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch {}
        navigate('/signin');
        return;
      }
      console.error(e);
      toast.error('Failed to update status');
    }
  };

  const openRename = (t: ContractTemplate) => {
    setSelectedTemplate(t);
    setRenameName(t.name);
    setRenameOpen(true);
  };

  const submitRename = async () => {
    if (!selectedTemplate) return;
    try {
      const updated = await clmService.updateTemplate(selectedTemplate.id, { name: renameName });
      setTemplates(prev => prev.map(x => x.id === updated.id ? updated : x));
      toast.success('Template renamed');
      setRenameOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to rename');
    }
  };

  const openDelete = (t: ContractTemplate) => {
    setSelectedTemplate(t);
    setDeleteOpen(true);
  };

  const submitDelete = async () => {
    if (!selectedTemplate) return;
    try {
      await clmService.deleteTemplate(selectedTemplate.id);
      setTemplates(prev => prev.filter(x => x.id !== selectedTemplate.id));
      toast.success('Template deleted');
      setDeleteOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete');
    }
  };

  const startInlineEdit = (t: ContractTemplate) => {
    setInlineEditId(t.id);
    setInlineName(t.name);
    setInlineType(t.contract_type);
  };

  const saveInlineEdit = async () => {
    const t = templates.find(x => x.id === inlineEditId);
    if (!t) return;
    try {
      const updated = await clmService.updateTemplate(t.id, { name: inlineName, contract_type: inlineType });
      setTemplates(prev => prev.map(x => x.id === t.id ? updated : x));
      setInlineEditId(null);
      toast.success('Template updated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update');
    }
  };

  const cancelInlineEdit = () => {
    setInlineEditId(null);
  };

  const handleDuplicateActive = async (t: ContractTemplate) => {
    try {
      const created = await clmService.createTemplate({
        name: `Copy of ${t.name}`,
        contract_type: t.contract_type,
        content: t.content,
        is_active: true
      });
      toast.success('Active copy created');
      setTemplates(prev => [created, ...prev]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to duplicate');
    }
  };

  const createPreset = async (preset: 'MSA' | 'NDA' | 'SOW') => {
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
    try {
      const created = await clmService.createTemplate({
        name: preset,
        contract_type: preset,
        content: contents[preset],
        is_active: true
      });
      toast.success(`${preset} template created`);
      setTemplates(prev => [created, ...prev]);
      navigate(`/employee-dashboard/clm/templates/${created.id}`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to create ${preset}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Contract Templates</h1>
          <p className="text-slate-500">Standardize contracts with reusable templates.</p>
        </div>
        <Button 
          className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90"
          onClick={() => navigate('/employee-dashboard/clm/templates/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Total Templates</div>
              <div className="text-2xl font-bold text-[#1A3C34]">{templates.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Active Templates</div>
              <div className="text-2xl font-bold text-[#1A3C34]">
                {templates.filter(t => t.is_active).length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-slate-500">Ready-made</div>
              <Badge variant="outline" className="bg-slate-50">Quick Start</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => createPreset('MSA')}>Use MSA</Button>
              <Button variant="outline" size="sm" onClick={() => createPreset('NDA')}>Use NDA</Button>
              <Button variant="outline" size="sm" onClick={() => createPreset('SOW')}>Use SOW</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search templates..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Contract Type</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.map((template) => (
              <TableRow key={template.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">
                  {inlineEditId === template.id ? (
                    <div className="flex items-center gap-2">
                      <Input value={inlineName} onChange={(e) => setInlineName(e.target.value)} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/employee-dashboard/clm/templates/${template.id}`)}>
                      <FileText className="h-4 w-4 text-slate-400" />
                      {template.name}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {inlineEditId === template.id ? (
                    <Input value={inlineType} onChange={(e) => setInlineType(e.target.value)} />
                  ) : (
                    template.contract_type
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-slate-50">v{template.version}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={template.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-700 hover:bg-slate-100"}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500">
                  {template.updated_at}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/employee-dashboard/clm/templates/${template.id}`)}>
                        Edit Template
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClone(template)}>Clone Template</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateActive(template)}>Duplicate as Active</DropdownMenuItem>
                      {inlineEditId === template.id ? (
                        <>
                          <DropdownMenuItem onClick={saveInlineEdit}>Save Inline</DropdownMenuItem>
                          <DropdownMenuItem onClick={cancelInlineEdit}>Cancel Inline</DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem onClick={() => startInlineEdit(template)}>Edit Inline</DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => openRename(template)}>Rename</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => openDelete(template)}>Delete</DropdownMenuItem>
                      <DropdownMenuItem className={template.is_active ? 'text-red-600' : ''} onClick={() => handleToggleActive(template)}>
                        {template.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} placeholder="New template name" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button className="bg-[#1A3C34] text-white" onClick={submitRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={submitDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Templates;
