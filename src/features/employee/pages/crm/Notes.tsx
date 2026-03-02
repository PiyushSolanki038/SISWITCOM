import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StickyNote, Plus, Search, MoreHorizontal, Edit, Trash2, LayoutList, LayoutGrid } from 'lucide-react';
import { crmService, Note } from '@/features/employee/services/crmService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

const Notes: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const noteSchema = z.object({
    title: z.string().min(2, 'Title is required'),
    content: z.string().min(2, 'Content is required'),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
  });
  type NoteForm = z.infer<typeof noteSchema>;
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await crmService.getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const onCreateNote = async (values: NoteForm) => {
    try {
      const created = await crmService.createNote(values);
      setNotes([created, ...notes]);
      setIsAddDialogOpen(false);
      reset();
      toast.success('Note created successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create note';
      console.error('Error creating note:', error);
      toast.error(msg);
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteId) return;
    try {
      await crmService.deleteNote(deleteId);
      setNotes(notes.filter(n => n._id !== deleteId));
      setDeleteId(null);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Notes & Timeline</h1>
          <p className="text-slate-500">Manage your notes and view activity timeline.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center mr-2">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}
            >
              <LayoutList className="w-4 h-4 mr-2" /> List
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Grid
            </Button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) reset(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onCreateNote)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...register('title')} />
                  {errors.title && <div className="text-sm text-red-600">{errors.title.message}</div>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" {...register('content')} />
                  {errors.content && <div className="text-sm text-red-600">{errors.content.message}</div>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" {...register('date')} />
                    {errors.date && <div className="text-sm text-red-600">{errors.date.message}</div>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" {...register('time')} />
                    {errors.time && <div className="text-sm text-red-600">{errors.time.message}</div>}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : 'Save Note'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search notes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading notes and timeline details...</div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedNotes.map((note) => (
            <Card 
              key={note._id} 
              className="cursor-pointer hover:shadow-md transition-all hover:border-[#1A3C34]/20"
              onClick={() => navigate(`/employee-dashboard/crm/notes/${note._id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-semibold">{note.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/employee-dashboard/crm/notes/${note._id}`);
                        }}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(note._id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-xs text-slate-500">{note.date}, {note.time}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 line-clamp-3">
                  {note.content}
                </p>
              </CardContent>
            </Card>
          ))}
          {filteredNotes.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No notes found. Create a new note to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Content</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {paginatedNotes.map((note) => (
                  <tr 
                    key={note._id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                    onClick={() => navigate(`/employee-dashboard/crm/notes/${note._id}`)}
                  >
                    <td className="p-4 align-middle font-medium">{note.title}</td>
                    <td className="p-4 align-middle max-w-[500px] truncate text-slate-600">{note.content}</td>
                    <td className="p-4 align-middle text-slate-500">{note.date} {note.time}</td>
                    <td className="p-4 align-middle text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employee-dashboard/crm/notes/${note._id}`);
                          }}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(note._id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredNotes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500 py-12">
                      No notes found. Create a new note to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredNotes.length > 0 && (
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notes;
