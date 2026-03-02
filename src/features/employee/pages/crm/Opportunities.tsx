import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  DollarSign,
  Calendar,
  Building2,
  User,
  ArrowUpRight,
  Edit,
  Trash2,
  LayoutList,
  LayoutGrid,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { crmService, Deal, Account } from '@/features/employee/services/crmService';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import CreateOpportunityDialog from './components/CreateOpportunityDialog';

const DEFAULT_STAGES = [
  { id: 'qualification', label: 'Qualification', color: 'bg-blue-100 text-blue-700' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-100 text-purple-700' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-green-100 text-green-700' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100 text-red-700' }
];

const Opportunities: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Deal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsAddDialogOpen(true);
    }
  }, [searchParams]);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await crmService.getDeals({ q: searchQuery });
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await crmService.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
    fetchAccounts();
  }, [fetchOpportunities, fetchAccounts]);

  const [pipelineStages, setPipelineStages] = useState<{ _id: string; name: string }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const stages = await crmService.getStages();
        setPipelineStages(stages);
      } catch (e) {
        setPipelineStages([]);
      }
    })();
  }, []);

  const onCreatedOpportunity = (newOp: Deal) => {
    setOpportunities([newOp, ...opportunities]);
  };

  const handleDeleteOpportunity = async () => {
    if (!deleteId) return;
    try {
      await crmService.deleteDeal(deleteId);
      setOpportunities(opportunities.filter(op => op._id !== deleteId));
      toast.success('Opportunity deleted successfully');
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    } finally {
      setDeleteId(null);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStageName = destination.droppableId;
    const newStage = newStageName as Deal['stage'];
    const oldStage = opportunities.find(op => op._id === draggableId)?.stage;

    if (newStage === oldStage) return;

    // Optimistic update
    const updatedOpportunities = opportunities.map(op => 
      op._id === draggableId ? { ...op, stage: newStage } : op
    );
    setOpportunities(updatedOpportunities);

    try {
      const stageObj = pipelineStages.find(s => s.name.toLowerCase() === newStageName.toLowerCase());
      if (stageObj) {
        await crmService.moveOpportunity(draggableId, stageObj._id);
      } else {
        await crmService.updateDeal(draggableId, { stage: newStage });
      }
      toast.success(`Moved to ${newStageName}`);
    } catch (error) {
      // Revert on error
      fetchOpportunities();
      toast.error('Failed to update stage');
    }
  };

  const getStageColor = (stage: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (stage) {
      case 'qualification': return 'secondary';
      case 'proposal': return 'default'; // blue-ish usually
      case 'negotiation': return 'secondary'; // orange/yellow often
      case 'closed_won': return 'default'; // green
      case 'closed_lost': return 'destructive'; // red
      default: return 'outline';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const filteredOpportunities = opportunities.filter(op => 
    op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    op.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
  const paginatedOpportunities = filteredOpportunities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Opportunities</h1>
          <p className="text-slate-500">Manage your deals and pipeline</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-slate-100 p-1 rounded-lg flex items-center">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}
            >
              <LayoutList className="w-4 h-4 mr-2" /> List
            </Button>
            <Button 
              variant={viewMode === 'board' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('board')}
              className={viewMode === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Board
            </Button>
          </div>
          <Button className="bg-[#1A3C34] hover:bg-[#1A3C34]/90" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Opportunity
          </Button>
          <CreateOpportunityDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onCreated={onCreatedOpportunity}
            defaultCompanyName={searchParams.get('company') || undefined}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search opportunities..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading opportunities...</div>
      ) : viewMode === 'list' ? (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden md:table-cell">Stage</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="hidden md:table-cell">Close Date</TableHead>
                    <TableHead className="hidden md:table-cell">Owner</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpportunities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No opportunities found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOpportunities.map((op) => (
                      <TableRow 
                        key={op._id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(`/employee-dashboard/crm/opportunities/${op._id}`)}
                      >
                        <TableCell>
                          <div className="font-medium text-[#1A3C34]">{op.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {op.company}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getStageColor(op.stage)} className="capitalize">
                            {op.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-[#1A3C34]">
                            {formatCurrency(op.value)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-3 h-3" />
                            {op.closingDate}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                              {op.owner.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-600">{op.owner}</span>
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
                                navigate(`/employee-dashboard/crm/opportunities/${op._id}`);
                              }}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(op._id);
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
            </div>

            {/* Pagination Controls */}
            {filteredOpportunities.length > 0 && (
              <div className="flex items-center justify-end space-x-2 p-4">
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
          </CardContent>
        </Card>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full min-w-[1000px] pb-4">
              {(pipelineStages.length ? pipelineStages.map(ps => ({ id: ps.name, label: ps.name, color: 'bg-slate-100 text-slate-700' })) : DEFAULT_STAGES).map((stage) => {
                const stageDeals = filteredOpportunities.filter(op => op.stage === stage.id);
                const totalValue = stageDeals.reduce((sum, op) => sum + op.value, 0);

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
                            {stageDeals.length}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 mb-2 font-medium">
                          {formatCurrency(totalValue)}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
                          {stageDeals.map((op, index) => (
                            <Draggable key={op._id} draggableId={op._id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => navigate(`/employee-dashboard/crm/opportunities/${op._id}`)}
                                  className="bg-white p-3 rounded-md shadow-sm border hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                                >
                                  <div className="font-medium text-[#1A3C34] mb-1">{op.title}</div>
                                  <div className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                                    <Building2 className="w-3 h-3" />
                                    {op.company}
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-emerald-700">
                                      {formatCurrency(op.value)}
                                    </span>
                                    <span className="text-slate-400">
                                      {new Date(op.closingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
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
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this opportunity and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOpportunity} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Opportunities;
