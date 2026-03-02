import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  File, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Download, 
  Share2, 
  Trash2, 
  Folder,
  Plus,
  Grid,
  List as ListIcon,
  Link as LinkIcon,
  UploadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DocumentItem } from './types';
import { documentService } from '@/features/employee/services/documentService';
import { toast } from 'sonner';

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string | undefined>(undefined);
  const [uploadType, setUploadType] = useState<string | undefined>(undefined);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  React.useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }
        const docs = await documentService.getDocuments();
        setDocuments(docs);
    } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/signin');
          return;
        }
        console.error("Failed to fetch documents", error);
        toast.error("Failed to load documents");
    } finally {
        setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? doc.category === categoryFilter : true;
    const matchesType = typeFilter ? doc.type === typeFilter : true;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'zip': return <File className="w-5 h-5 text-yellow-500" />;
      default: return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!uploadName.trim()) {
        toast.error('Document name is required');
        return;
      }
      if (!uploadFile && !uploadUrl.trim()) {
        toast.error('Choose a file or provide a URL');
        return;
      }
      const fd = new FormData();
      fd.append('name', uploadName);
      if (uploadCategory) fd.append('category', uploadCategory);
      if (uploadFile) {
        fd.append('file', uploadFile);
        if (!uploadType) {
          const ext = uploadFile.name.split('.').pop()?.toLowerCase();
          if (ext) fd.append('type', ext);
        } else {
          fd.append('type', uploadType);
        }
      } else {
        if (uploadType) fd.append('type', uploadType);
        fd.append('url', uploadUrl);
      }
      const created = await documentService.uploadDocument(fd);
      setDocuments(prev => [created, ...prev]);
      toast.success('Document uploaded');
      setIsUploadOpen(false);
      setUploadName('');
      setUploadCategory(undefined);
      setUploadType(undefined);
      setUploadUrl('');
      setUploadFile(null);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Documents</h1>
          <p className="text-slate-500">Manage, version, and link your business files.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Folder className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90">
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Add a new file to the system. You can link it to records immediately.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4 py-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="name">Document Name</Label>
                  <Input id="name" placeholder="e.g. Q1 Sales Report" value={uploadName} onChange={(e) => setUploadName(e.target.value)} />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Select value={uploadCategory} onValueChange={(v) => setUploadCategory(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contracts">Contracts</SelectItem>
                      <SelectItem value="Quotes">Quotes</SelectItem>
                      <SelectItem value="Reports">Reports</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="type">File Type</Label>
                  <Select value={uploadType} onValueChange={(v) => setUploadType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">DOCX</SelectItem>
                      <SelectItem value="zip">ZIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="file">File</Label>
                  <Input id="file" type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="url">File URL</Label>
                  <Input id="url" placeholder="https://example.com/file.pdf" value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="link">Link to Record (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="quote">Quote</SelectItem>
                      <SelectItem value="opportunity">Opportunity</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="mt-2" placeholder="Search record..." />
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#1A3C34] text-white">Upload File</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search documents..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => { setCategoryFilter(null); setTypeFilter(null); }}>
                Clear Filters
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">Category</div>
              <DropdownMenuItem onClick={() => setCategoryFilter('Contracts')}>Contracts</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('Reports')}>Reports</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('Quotes')}>Quotes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('Templates')}>Templates</DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">File Type</div>
              <DropdownMenuItem onClick={() => setTypeFilter('pdf')}>PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('docx')}>DOCX</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('zip')}>ZIP</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 border-l pl-4">
          <Button 
            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Linked To</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.map((doc) => (
                <TableRow 
                  key={doc.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/employee-dashboard/docs/${doc.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.type)}
                      <span className="font-medium text-[#1A3C34]">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {doc.linkedItems && doc.linkedItems.length > 0 ? (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <LinkIcon className="w-3 h-3" />
                        {doc.linkedItems[0].name}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{doc.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-xs">v{doc.currentVersion}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">{doc.modified}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{doc.owner}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={async () => {
                          try {
                            await documentService.deleteDocument(doc.id);
                            setDocuments(prev => prev.filter(d => d.id !== doc.id));
                            toast.success('Document deleted');
                          } catch (e) {
                            console.error(e);
                            toast.error('Delete failed');
                          }
                        }}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => (
            <Card 
              key={doc.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/employee-dashboard/docs/${doc.id}`)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center relative">
                  {getFileIcon(doc.type)}
                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px]" variant="secondary">v{doc.currentVersion}</Badge>
                </div>
                <div className="w-full">
                  <h3 className="font-medium text-[#1A3C34] truncate" title={doc.name}>{doc.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{doc.size} • {doc.modified}</p>
                </div>
                {doc.linkedItems && doc.linkedItems.length > 0 && (
                   <div className="w-full bg-blue-50 text-blue-700 text-xs py-1 px-2 rounded flex items-center justify-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      Linked to {doc.linkedItems[0].type}
                   </div>
                )}
                <div className="w-full flex items-center justify-between pt-2 border-t mt-2">
                  <Badge variant="secondary" className="text-xs font-normal">{doc.category}</Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                    e.stopPropagation();
                  }}>
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
