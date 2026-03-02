import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  MoreHorizontal, 
  FileText, 
  Clock, 
  Link as LinkIcon,
  Tag,
  Info,
  Trash2,
  File,
  History,
  UploadCloud,
  Eye,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentItem } from './types';
import { documentService } from '@/features/employee/services/documentService';
import { toast } from 'sonner';

const placeholderDoc: DocumentItem = {
  id: '',
  name: 'Loading...',
  type: 'file',
  size: '-',
  created: '',
  modified: '',
  owner: '',
  category: 'Other',
  currentVersion: '1.0'
};

const DocumentViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preview');
  const [doc, setDoc] = useState<DocumentItem>(placeholderDoc);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }
        if (!id) {
          toast.error('Missing document id');
          return;
        }
        const d = await documentService.getDocument(id);
        setDoc(d);
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/signin');
          return;
        }
        toast.error('Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const getAuditIcon = (action: string) => {
    switch(action) {
      case 'upload': return <UploadCloud className="w-4 h-4 text-blue-500" />;
      case 'download': return <Download className="w-4 h-4 text-green-500" />;
      case 'view': return <Eye className="w-4 h-4 text-slate-500" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'version_update': return <History className="w-4 h-4 text-purple-500" />;
      case 'link_added': return <LinkIcon className="w-4 h-4 text-orange-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employee-dashboard/docs')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#1A3C34]">{doc.name}</h1>
              <Badge variant="outline">{doc.type.toUpperCase()}</Badge>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0">v{doc.currentVersion}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>{doc.size}</span>
              <span>•</span>
              <span>Updated {doc.modified}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <UploadCloud className="w-4 h-4 mr-2" />
            New Version
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <a href={doc.url || '#'} target="_blank" rel="noreferrer">
            <Button className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </a>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Preview) */}
        <div className="lg:col-span-2">
          <Card className="h-[800px] flex flex-col">
            <CardHeader className="border-b py-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Document Preview</CardTitle>
                <div className="flex gap-2">
                   {/* Zoom/Page controls would go here */}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-hidden relative">
              {/* Better Mock Preview */}
              <div className="bg-white shadow-lg w-full max-w-2xl h-full p-12 flex flex-col gap-4 overflow-hidden relative border">
                 <div className="w-1/3 h-6 bg-slate-200 rounded mb-8" />
                 <div className="space-y-3">
                   <div className="w-full h-3 bg-slate-100 rounded" />
                   <div className="w-full h-3 bg-slate-100 rounded" />
                   <div className="w-4/5 h-3 bg-slate-100 rounded" />
                   <div className="w-full h-3 bg-slate-100 rounded" />
                 </div>
                 <div className="space-y-3 mt-8">
                   <div className="w-full h-3 bg-slate-100 rounded" />
                   <div className="w-11/12 h-3 bg-slate-100 rounded" />
                   <div className="w-full h-3 bg-slate-100 rounded" />
                 </div>
                 
                 <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                    <div className="text-center">
                      <Button className="bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90 mb-2">
                         <Download className="w-4 h-4 mr-2" />
                         Download to View Full
                      </Button>
                      <p className="text-xs text-slate-500">Preview mode limited for secure documents</p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="preview" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="versions" className="flex-1">Versions</TabsTrigger>
              <TabsTrigger value="linked" className="flex-1">Linked</TabsTrigger>
              <TabsTrigger value="audit" className="flex-1">Audit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-medium uppercase">Description</span>
                    <p className="text-sm text-slate-700">{doc.description}</p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Owner</span>
                      <span className="text-sm font-medium">{doc.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Created</span>
                      <span className="text-sm font-medium">{doc.created}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Category</span>
                      <span className="text-sm font-medium">{doc.category}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-xs text-slate-500 font-medium uppercase">Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {doc.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="font-normal">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="versions" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Version History</CardTitle>
                  <CardDescription>Track changes and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {doc.versions?.map((version, index) => (
                      <div key={version.version} className="relative pl-6 border-l-2 border-slate-200 last:border-0 pb-6 last:pb-0">
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-[#1A3C34]' : 'bg-slate-300'}`} />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#1A3C34]">v{version.version}</span>
                            <span className="text-xs text-slate-500">{version.date}</span>
                          </div>
                          <p className="text-sm text-slate-600">{version.comment}</p>
                          <p className="text-xs text-slate-400">by {version.author}</p>
                          {index !== 0 && (
                             <Button variant="link" className="h-auto p-0 text-blue-600 text-xs mt-1">
                               Restore this version
                             </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="linked" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Linked Items</CardTitle>
                  <CardDescription>Related contracts and quotes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {doc.linkedItems?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white border rounded shadow-sm">
                            <LinkIcon className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                            <div className="font-medium text-sm text-[#1A3C34]">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.type}</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full text-xs">
                      <LinkIcon className="w-3 h-3 mr-2" />
                      Link to Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Audit Log</CardTitle>
                        <CardDescription>Activity tracking</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {doc.auditLogs?.map((log) => (
                                    <div key={log.id} className="flex gap-3 text-sm">
                                        <div className="mt-0.5">
                                            {getAuditIcon(log.action)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-slate-700">
                                                <span className="font-medium">{log.user}</span> {log.details}
                                            </p>
                                            <p className="text-xs text-slate-400">{log.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
