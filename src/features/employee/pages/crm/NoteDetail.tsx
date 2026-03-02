import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  StickyNote, 
  Calendar, 
  Clock, 
  User,
  Pencil,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { crmService, Note } from '@/features/employee/services/crmService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<Note | null>(null);
  
  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    date: '',
    time: ''
  });

  const fetchNoteDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const fetchedNote = await crmService.getNote(id);
      if (fetchedNote) {
        setNote(fetchedNote);
        setEditForm({
          title: fetchedNote.title,
          content: fetchedNote.content,
          date: fetchedNote.date,
          time: fetchedNote.time
        });
      } else {
        toast.error('Note not found');
        navigate('/employee-dashboard/crm/notes');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      toast.error('Failed to load note details');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchNoteDetails();
  }, [fetchNoteDetails]);

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const updated = await crmService.updateNote(id, editForm);
      setNote(updated);
      setIsEditDialogOpen(false);
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await crmService.deleteNote(id);
      toast.success('Note deleted successfully');
      navigate('/employee-dashboard/crm/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Loading note details...</div>;
  }

  if (!note) {
    return <div className="p-6 text-center text-slate-500">Note not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/crm/notes')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A3C34]">{note.title}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <StickyNote className="w-4 h-4" />
              <span>Note</span>
              <span>•</span>
              <span>{note.date}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteAlert(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Date</div>
                  <div className="text-sm text-slate-500">{note.date}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Time</div>
                  <div className="text-sm text-slate-500">{note.time}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Created By</div>
                  <div className="text-sm text-slate-500">Current User</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateNote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input 
                id="edit-title" 
                value={editForm.title} 
                onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea 
                id="edit-content" 
                value={editForm.content} 
                onChange={(e) => setEditForm({...editForm, content: e.target.value})} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input 
                  id="edit-date" 
                  type="date" 
                  value={editForm.date} 
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input 
                  id="edit-time" 
                  type="time" 
                  value={editForm.time} 
                  onChange={(e) => setEditForm({...editForm, time: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NoteDetail;
