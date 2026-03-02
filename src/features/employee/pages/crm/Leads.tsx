import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building2,
  Calendar,
  User,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  Loader2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { crmService, Lead } from '@/features/employee/services/crmService';
import CreateLeadDialog from './components/CreateLeadDialog';

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [view, setView] = useState<'list' | 'board'>('list');

  const LEAD_STAGES = [
    { id: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
    { id: 'contacted', label: 'Contacted', color: 'bg-indigo-100 text-indigo-700' },
    { id: 'qualified', label: 'Qualified', color: 'bg-emerald-100 text-emerald-700' },
    { id: 'unqualified', label: 'Unqualified', color: 'bg-gray-100 text-gray-700' }
  ];
  
  // Add Lead Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsAddDialogOpen(true);
    }
  }, [searchParams]);
  const leadSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    title: z.string().optional(),
    company: z.string().min(1, 'Company is required'),
    email: z.string().email('Valid email required'),
    phone: z.string().optional(),
    source: z.string().min(1, 'Source is required'),
  });
  type LeadForm = z.infer<typeof leadSchema>;
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, control } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: '', title: '', company: '', email: '', phone: '', source: 'Website' }
  });

  const fetchLeads = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await crmService.getLeads(searchTerm);
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const onCreateLead = async (values: LeadForm) => {
    try {
      const createdLead = await crmService.createLead({
        name: values.name,
        title: values.title || '',
        company: values.company,
        email: values.email,
        phone: values.phone || '',
        source: values.source,
        status: 'new',
        owner: 'Current User',
        score: 10,
        lastContacted: new Date().toISOString(),
        address: ''
      });
      setLeads([createdLead, ...leads]);
      setIsAddDialogOpen(false);
      reset();
      toast.success('Lead created successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create lead';
      toast.error(msg);
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteId) return;
    try {
      await crmService.deleteLead(deleteId);
      setLeads(leads.filter(l => l._id !== deleteId));
      toast.success('Lead deleted successfully');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    } finally {
      setDeleteId(null);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Optimistic update
    const newStatus = destination.droppableId as Lead['status'];
    const updatedLeads = leads.map(lead => 
      lead._id === draggableId ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);

    try {
      await crmService.updateLead(draggableId, { status: newStatus });
      toast.success('Lead status updated');
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
      // Revert on error
      fetchLeads();
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'secondary';
      case 'contacted': return 'secondary';
      case 'qualified': return 'default';
      case 'proposal': return 'default';
      case 'negotiation': return 'default';
      case 'won': return 'default';
      case 'lost': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading leads...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Leads</h1>
          <p className="text-slate-500">Manage and track your potential customers</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#1A3C34] hover:bg-[#122a25]">
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search leads..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
        <div className="flex bg-slate-100 p-1 rounded-lg border">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 ${view === 'list' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            onClick={() => setView('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 ${view === 'board' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            onClick={() => setView('board')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <>
          <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => (
                  <TableRow 
                    key={lead._id} 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate(`/employee-dashboard/crm/leads/${lead._id}`)}
                  >
                    <TableCell>
                      <div className="font-medium text-[#1A3C34]">{lead.name}</div>
                      <div className="text-xs text-slate-500">{lead.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {lead.company}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(lead.status)} className="capitalize">
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`font-bold ${lead.score >= 80 ? 'text-green-600' : lead.score >= 50 ? 'text-amber-600' : 'text-slate-600'}`}>
                        {lead.score}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                          {lead.owner.charAt(0)}
                        </div>
                        <span className="text-sm">{lead.owner}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="w-4 h-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employee-dashboard/crm/leads/${lead._id}`);
                          }}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(lead._id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
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
        {/* Pagination Controls */}
        {!loading && filteredLeads.length > 0 && (
          <div className="flex items-center justify-end space-x-2 p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLead} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex overflow-x-auto gap-4 pb-4 min-h-[calc(100vh-250px)]">
            {LEAD_STAGES.map(stage => {
              const stageLeads = filteredLeads.filter(l => l.status === stage.id);
              
              return (
                <Droppable droppableId={stage.id} key={stage.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 min-w-[280px] bg-slate-50 rounded-lg p-3 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-700">{stage.label}</h3>
                        <Badge variant="secondary" className="bg-white">
                          {stageLeads.length}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
                        {stageLeads.map((lead, index) => (
                          <Draggable key={lead._id} draggableId={lead._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => navigate(`/employee-dashboard/crm/leads/${lead._id}`)}
                                className="bg-white p-3 rounded-md shadow-sm border hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="font-medium text-[#1A3C34]">{lead.name}</div>
                                  <div className={`text-xs font-bold ${lead.score >= 80 ? 'text-green-600' : lead.score >= 50 ? 'text-amber-600' : 'text-slate-600'}`}>
                                    {lead.score}
                                  </div>
                                </div>
                                <div className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                                  <Building2 className="w-3 h-3" />
                                  {lead.company}
                                </div>
                                <div className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate max-w-[180px]">{lead.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t">
                                  <span>{lead.owner}</span>
                                  <span>{new Date(lead.lastContacted).toLocaleDateString()}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}

      <CreateLeadDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => { setIsAddDialogOpen(open); }}
        onCreated={(lead) => setLeads([lead, ...leads])}
      />
    </div>
  );
};

export default Leads;
