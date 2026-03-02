import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { crmService, Contact, Account } from '@/features/employee/services/crmService';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import CreateContactDialog from './components/CreateContactDialog';

const STAGES = [
  { id: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { id: 'inactive', label: 'Inactive', color: 'bg-slate-100 text-slate-700' }
];

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const contactsData = await crmService.getContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const onCreatedContact = (created: Contact) => {
    setContacts([created, ...contacts]);
  };

  const handleDeleteContact = async () => {
    if (!deleteId) return;
    try {
      await crmService.deleteContact(deleteId);
      setContacts(contacts.filter(c => c._id !== deleteId));
      toast.success('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    } finally {
      setDeleteId(null);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as Contact['status'];
    const oldStatus = contacts.find(c => c._id === draggableId)?.status;

    if (newStatus === oldStatus) return;

    // Optimistic update
    const updatedContacts = contacts.map(c => 
      c._id === draggableId ? { ...c, status: newStatus } : c
    );
    setContacts(updatedContacts);

    try {
      await crmService.updateContact(draggableId, { status: newStatus });
      toast.success(`Moved to ${STAGES.find(s => s.id === newStatus)?.label}`);
    } catch (error) {
      // Revert on error
      fetchContacts();
      toast.error('Failed to update status');
    }
  };

  const filteredContacts = contacts.filter(contact =>  
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Contacts</h1>
          <p className="text-slate-500">Manage your business relationships</p>
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
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
          <CreateContactDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onCreated={onCreatedContact}
          />
      </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading contacts...</div>
      ) : viewMode === 'list' ? (
        <Card>
          <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search contacts..."
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
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden md:table-cell">Contact Info</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="hidden md:table-cell">Last Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No contacts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedContacts.map((contact) => (
                      <TableRow 
                        key={contact._id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(`/employee-dashboard/crm/contacts/${contact._id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1A3C34]/10 text-[#1A3C34] flex items-center justify-center font-medium text-xs">
                              {contact.avatar || contact.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-[#1A3C34]">{contact.name}</div>
                              <div className="text-xs text-slate-500 md:hidden">{contact.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{contact.company}</span>
                            <span className="text-xs text-slate-500">{contact.role}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-3 h-3" /> {contact.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-3 h-3" /> {contact.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-3 h-3" /> {contact.address || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-3 h-3" /> {contact.lastContacted}
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
                                navigate(`/employee-dashboard/crm/contacts/${contact._id}`);
                              }}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(contact._id);
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
            {!loading && filteredContacts.length > 0 && (
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
                const stageContacts = filteredContacts.filter(c => c.status === stage.id);
                
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
                            {stageContacts.length}
                          </Badge>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
                          {stageContacts.map((contact, index) => (
                            <Draggable key={contact._id} draggableId={contact._id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => navigate(`/employee-dashboard/crm/contacts/${contact._id}`)}
                                  className="bg-white p-3 rounded-md shadow-sm border hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                                >
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-[#1A3C34]/10 text-[#1A3C34] flex items-center justify-center font-medium text-xs flex-shrink-0">
                                      {contact.avatar || contact.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                      <div className="font-medium text-[#1A3C34] truncate">{contact.name}</div>
                                      <div className="text-xs text-slate-500 truncate">{contact.email}</div>
                                    </div>
                                  </div>
                                  <div className="text-sm text-slate-600 mb-2">
                                    <div className="font-medium">{contact.company}</div>
                                    <div className="text-xs text-slate-500">{contact.role}</div>
                                  </div>
                                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t">
                                    <div className="flex items-center gap-1">
                                       <Phone className="w-3 h-3" />
                                       <span>{contact.phone}</span>
                                    </div>
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
              This action cannot be undone. This will permanently delete the contact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Contacts;
