import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Link as LinkIcon, 
  FileText, 
  CheckCircle2,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const SendQuote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('client@example.com');
  const [subject, setSubject] = useState(`Quote #${id} from Our Company`);
  const [message, setMessage] = useState('Please find attached the quote we discussed. Let me know if you have any questions.');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    // Simulate sending
    setSent(true);
    // In real app, update quote status to 'Sent'
  };

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#1A3C34]">Quote Sent Successfully!</h1>
        <p className="text-slate-500">
          Quote #{id} has been sent to {email}.<br/>
          You can track the status in the quote details page.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button variant="outline" onClick={() => navigate('/employee-dashboard/cpq/quotes')}>
            Back to Quotes
          </Button>
          <Button className="bg-[#1A3C34]" onClick={() => navigate(`/employee-dashboard/cpq/quotes/${id}`)}>
            View Quote Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/employee-dashboard/cpq/quotes/${id}`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C34]">Send Quote</h1>
          <p className="text-slate-500">Deliver quote #{id} to customer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
              <CardDescription>Choose how you want to send the quote</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="email">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="link">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Secure Link
                  </TabsTrigger>
                  <TabsTrigger value="pdf">
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Recipient Email</Label>
                    <Input 
                      id="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <Button className="w-full bg-[#1A3C34] hover:bg-[#1A3C34]/90" onClick={handleSend}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </TabsContent>

                <TabsContent value="link" className="space-y-4 mt-4">
                  <div className="p-4 bg-slate-50 border rounded-lg text-center space-y-4">
                    <div className="text-sm text-slate-500">Share this secure link with your customer</div>
                    <div className="flex gap-2">
                      <Input value={`https://portal.company.com/q/${id}`} readOnly />
                      <Button variant="outline">Copy</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pdf" className="space-y-4 mt-4">
                  <div className="p-4 bg-slate-50 border rounded-lg text-center space-y-4">
                    <div className="text-sm text-slate-500">Download a PDF version of the quote</div>
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-white shadow-sm h-[300px] flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Quote PDF Preview</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tracking Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Sent Time</p>
                    <p className="text-xs text-slate-500">Not sent yet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Viewed</p>
                    <p className="text-xs text-slate-500">-</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ThumbsUp className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-xs text-slate-500">Draft</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SendQuote;
