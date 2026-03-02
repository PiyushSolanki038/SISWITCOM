import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  MoreHorizontal, 
  Filter, 
  Clock,
  CheckCircle2,
  Activity as ActivityIcon,
  Trash2,
  Edit,
  LayoutGrid,
  List
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { crmService, Activity as CRMActivity } from '@/features/employee/services/crmService';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
import CreateActivityDialog from './components/CreateActivityDialog';

interface Activity extends Omit<CRMActivity, 'relatedTo'> {
  contact: string;
}

interface Contact {
  id: string;
  name: string;
  company: string;
}

const Activities: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterType, setFilterType] = useState<string>('all');
  const [view, setView] = useState<'list' | 'board'>('list');

  const ACTIVITY_STAGES = [
    { id: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-700' },
    { id: 'scheduled', label: 'Scheduled', color: 'bg-purple-100 text-purple-700' },
    { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
    { id: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-700' },
    { id: 'cancelled', label: 'Cancelled', color: 'bg-slate-100 text-slate-700' }
  ];

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [newActivity, setNewActivity] = useState({
    type: 'call',
    title: '',
    description: '',
    contact: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    duration: '',
    priority: 'medium',
    status: 'scheduled',
    owner: 'Current User'
  });

  useEffect(() => {
    fetchActivities();
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await crmService.getContacts();
      setContacts(data.map(c => ({
        id: c._id,
        name: c.name,
        company: c.company || ''
      })));
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await crmService.getActivities();
      
      // Map CRMService Activity to Component Activity
      const mappedActivities: Activity[] = data.map(a => {
        const contactName =
          (a?.relatedTo && (a.relatedTo as any)?.name) ||
          (a?.relatedTo && (a.relatedTo as any)?.title) ||
          (a?.relatedTo && (a.relatedTo as any)?.id) ||
          '';
        return {
          ...a,
          contact: contactName || '—',
          status: a.status
        };
      });
      
      setActivities(mappedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const onCreatedActivity = (created: CRMActivity) => {
    const mapped: Activity = { 
      ...created, 
      contact: ((created as any)?.relatedTo?.name) || ((created as any)?.relatedTo?.title) || ((created as any)?.relatedTo?.id) || '—' 
    };
    setActivities([mapped, ...activities]);
  };

  const handleDeleteActivity = async () => {
    if (!deleteId) return;
    try {
      await crmService.deleteActivity(deleteId);
      setActivities(activities.filter(a => a._id !== deleteId));
      toast.success('Activity deleted successfully');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
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

    const newStatus = destination.droppableId as CRMActivity['status'];
    const activity = activities.find(a => a._id === draggableId);
    
    if (!activity) return;

    // Optimistic update
    const updatedActivities = activities.map(a => 
      a._id === draggableId ? { ...a, status: newStatus } : a
    );
    setActivities(updatedActivities);

    try {
      await crmService.updateActivity(draggableId, { status: newStatus });
      toast.success(`Activity moved to ${ACTIVITY_STAGES.find(s => s.id === newStatus)?.label}`);
    } catch (error) {
      console.error('Error updating activity status:', error);
      // Revert on error
      fetchActivities();
      toast.error('Failed to update activity status');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'email': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'meeting': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.contact || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || activity.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours > 0 && diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 0 && diffInHours > -24) {
      return `In ${Math.floor(Math.abs(diffInHours))} hours`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Activities</h1>
          <p className="text-slate-500">Track and manage your customer interactions</p>
        </div>
        <Button className="bg-[#1A3C34] hover:bg-[#1A3C34]/90" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Log Activity
        </Button>
        <CreateActivityDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onCreated={onCreatedActivity}
        />
      </div>

      {/* Main Content Card */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search activities..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="call">Calls</SelectItem>
              <SelectItem value="email">Emails</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
              <SelectItem value="note">Notes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md transition-all ${
              view === 'list' 
                ? 'bg-white shadow-sm text-[#1A3C34]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('board')}
            className={`p-2 rounded-md transition-all ${
              view === 'board' 
                ? 'bg-white shadow-sm text-[#1A3C34]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading activity details...</div>
          ) : (
            <div className="rounded-md border-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No activities found. Log a new activity to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedActivities.map((activity) => (
                      <TableRow 
                        key={activity._id} 
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(`/employee-dashboard/crm/activities/${activity._id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getColor(activity.type)}`}>
                              {getIcon(activity.type)}
                            </div>
                            <div>
                              <div className="font-medium text-[#1A3C34]">{activity.title}</div>
                              <div className="text-xs text-slate-500 capitalize">{activity.type}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {activity.contact}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`
                              ${activity.priority === 'high' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                              ${activity.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                              ${activity.priority === 'low' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                              ${!activity.priority ? 'bg-slate-50 text-slate-700 border-slate-100' : ''}
                            `}
                          >
                            {(activity.priority || 'medium').charAt(0).toUpperCase() + (activity.priority || 'medium').slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(activity.date)}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {activity.duration || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={`
                              ${activity.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                              ${activity.status === 'upcoming' ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                            `}
                          >
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-slate-400 hover:text-[#1A3C34]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/employee-dashboard/crm/activities/${activity._id}`);
                              }}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(activity._id);
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 p-4 border-t">
              <div className="flex-1 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex overflow-x-auto gap-4 pb-4 min-h-[calc(100vh-250px)]">
            {ACTIVITY_STAGES.map(stage => {
              const stageActivities = filteredActivities.filter(a => a.status === stage.id);
              
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
                          {stageActivities.length}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
                        {stageActivities.map((activity, index) => (
                          <Draggable key={activity._id} draggableId={activity._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-3 rounded-md shadow-sm border hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-full ${getColor(activity.type)} bg-opacity-20`}>
                                      {getIcon(activity.type)}
                                    </div>
                                    <span className="font-medium text-[#1A3C34] truncate max-w-[120px]">{activity.title}</span>
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={`
                                      text-[10px] px-1.5 py-0 h-5 whitespace-nowrap
                                      ${activity.priority === 'high' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                                      ${activity.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                                      ${activity.priority === 'low' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                                      ${!activity.priority ? 'bg-slate-50 text-slate-700 border-slate-100' : ''}
                                    `}
                                  >
                                    {(activity.priority || 'medium').charAt(0).toUpperCase() + (activity.priority || 'medium').slice(1)}
                                  </Badge>
                                </div>
                                <div className="text-sm text-slate-500 mb-2 line-clamp-2">
                                  {activity.description}
                                </div>
                                <div className="text-xs text-slate-500 flex flex-col gap-1 mb-2">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(activity.date).toLocaleDateString()} at {activity.time}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ActivityIcon className="w-3 h-3" />
                                    {activity.contact}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                  <Badge variant={
                                    activity.status === 'completed' ? 'default' : 
                                    activity.status === 'overdue' ? 'destructive' : 'secondary'
                                  } className="capitalize text-xs">
                                    {activity.status}
                                  </Badge>
                                  
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteId(activity._id);
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3 text-red-500" />
                                    </Button>
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
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteActivity} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Activities;
