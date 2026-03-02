import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Building2, 
  Globe, 
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { crmService, Account } from '@/features/employee/services/crmService';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import CreateAccountDialog from './components/CreateAccountDialog';

const STAGES = [
  { id: 'prospect', label: 'Prospect', color: 'bg-blue-100 text-blue-700' },
  { id: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { id: 'inactive', label: 'Inactive', color: 'bg-slate-100 text-slate-700' },
  { id: 'churned', label: 'Churned', color: 'bg-red-100 text-red-700' }
];

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await crmService.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const onCreatedAccount = (created: Account) => {
    setAccounts([created, ...accounts]);
  };

  const handleDeleteAccount = async () => {
    if (!deleteId) return;
    try {
      await crmService.deleteAccount(deleteId);
      setAccounts(accounts.filter(a => a._id !== deleteId));
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setDeleteId(null);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as Account['status'];
    const oldStatus = accounts.find(a => a._id === draggableId)?.status;

    if (newStatus === oldStatus) return;

    // Optimistic update
    const updatedAccounts = accounts.map(a => 
      a._id === draggableId ? { ...a, status: newStatus } : a
    );
    setAccounts(updatedAccounts);

    try {
      await crmService.updateAccount(draggableId, { status: newStatus });
      toast.success(`Moved to ${STAGES.find(s => s.id === newStatus)?.label}`);
    } catch (error) {
      // Revert on error
      fetchAccounts();
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'; // dark green in this theme usually
      case 'inactive': return 'secondary';
      case 'churned': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Accounts</h1>
          <p className="text-slate-500">Manage your customer accounts and companies</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Account
          </Button>
          <CreateAccountDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onCreated={onCreatedAccount}
          />
      </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading accounts...</div>
      ) : viewMode === 'list' ? (
        <Card>
          <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search accounts..."
                className="pl-8 max-w-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Revenue</TableHead>
                    <TableHead className="hidden md:table-cell">Owner</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No accounts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAccounts.map((account) => (
                      <TableRow 
                        key={account._id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(`/employee-dashboard/crm/accounts/${account._id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium text-[#1A3C34]">{account.name}</div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 md:hidden">
                                {account.industry}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                            {account.industry}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getStatusColor(account.status)} className="capitalize">
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm text-slate-600 font-medium">
                            {account.annualRevenue}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                              {account.owner.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-600">{account.owner}</span>
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
                                navigate(`/employee-dashboard/crm/accounts/${account._id}`);
                              }}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(account._id);
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
            {!loading && filteredAccounts.length > 0 && (
              <div className="flex items-center justify-end space-x-2 py-4">
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
          </div>
        </CardContent>
      </Card>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full min-w-[1000px] pb-4">
              {STAGES.map((stage) => {
                const stageAccounts = filteredAccounts.filter(a => a.status === stage.id);
                const totalRevenue = stageAccounts.reduce((sum, a) => {
                  const revenue = parseFloat(String(a.annualRevenue).replace(/[^0-9.-]+/g, "")) || 0;
                  return sum + revenue;
                }, 0);

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
                            {stageAccounts.length}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 mb-2 font-medium">
                          Est. Revenue: ${totalRevenue.toLocaleString()}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
                          {stageAccounts.map((account, index) => (
                            <Draggable key={account._id} draggableId={account._id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => navigate(`/employee-dashboard/crm/accounts/${account._id}`)}
                                  className="bg-white p-3 rounded-md shadow-sm border hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                                >
                                  <div className="font-medium text-[#1A3C34] mb-1">{account.name}</div>
                                  <div className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                                    <Building2 className="w-3 h-3" />
                                    {account.industry}
                                  </div>
                                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                                    <span className="font-semibold text-slate-600">
                                      {account.annualRevenue}
                                    </span>
                                    <span className="text-slate-400">
                                      {account.owner}
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
              This action cannot be undone. This will permanently delete the account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Accounts;
