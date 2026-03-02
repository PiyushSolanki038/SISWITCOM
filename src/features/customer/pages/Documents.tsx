import React, { useEffect, useState } from 'react';
import { 
  FolderOpen, 
  FileText, 
  Download, 
  Search,
  Filter,
  Eye,
  FileCheck,
  Receipt,
  Book
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { customerService, CustomerDocument } from '../services/customerService';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    (async () => {
      const rows = await customerService.getDocuments();
      setDocuments(rows);
    })();
  }, []);

  const getFilteredDocuments = () => {
    let filtered = documents;

    // Tab filtering
    if (activeTab !== 'all') {
      if (activeTab === 'contracts') {
        filtered = filtered.filter(d => d.category === 'Contract');
      } else if (activeTab === 'invoices') {
        filtered = filtered.filter(d => d.category === 'Invoice');
      } else if (activeTab === 'guides') {
        filtered = filtered.filter(d => d.category === 'Guide');
      }
    }

    // Search filtering
    return filtered.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.linkedEntity?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredDocuments = getFilteredDocuments();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Contract': return <FileCheck size={16} />;
      case 'Invoice': return <Receipt size={16} />;
      case 'Guide': return <Book size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Contract': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Contract</Badge>;
      case 'Invoice': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Invoice</Badge>;
      case 'Guide': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Guide</Badge>;
      default: return <Badge variant="outline">{category}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1A3C34]">Documents</h2>
        <p className="text-slate-500 mt-2">Access all your shared files and documents.</p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search documents..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter size={16} />
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Linked Entity</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${
                            doc.category === 'Contract' ? 'bg-blue-50 text-blue-600' :
                            doc.category === 'Invoice' ? 'bg-purple-50 text-purple-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {getCategoryIcon(doc.category)}
                          </div>
                          <span>{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                      <TableCell>
                        {doc.linkedEntity ? (
                          <Link to="#" className="text-blue-600 hover:underline text-sm">
                            {doc.linkedEntity}
                          </Link>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">v{doc.version}</Badge>
                      </TableCell>
                      <TableCell>{doc.date}</TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderOpen className="h-8 w-8 text-slate-300" />
                        <p>No documents found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents;
