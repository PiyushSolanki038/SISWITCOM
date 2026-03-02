import React, { useEffect, useState } from 'react';
import { 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  FileText,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { customerService, SupportTicket } from '../services/customerService';

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    setTickets(customerService.getTickets());
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
      case 'In Progress': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
      case 'Resolved': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      case 'Closed': return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-[#1A3C34]">How can we help you?</h2>
        <p className="text-slate-500">Browse our documentation, view your tickets, or contact support.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
          <CardHeader>
            <FileText className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle className="text-lg">Documentation</CardTitle>
            <CardDescription>Read our guides and API docs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto gap-1">
              Visit Knowledge Base <ExternalLink size={12} />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500">
          <CardHeader>
            <MessageSquare className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle className="text-lg">Live Chat</CardTitle>
            <CardDescription>Chat with our support team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto gap-1">
              Start Chat <ExternalLink size={12} />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500">
          <CardHeader>
            <Mail className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle className="text-lg">Email Support</CardTitle>
            <CardDescription>Get help via email.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto gap-1">
              support@example.com <ExternalLink size={12} />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="request">Submit Request</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>We usually respond within 24 hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What is this regarding?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Describe your issue..." className="min-h-[120px]" />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full sm:w-auto">Send Message</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Past Requests</CardTitle>
              <CardDescription>Track the status of your support tickets.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Last Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>{ticket.subject}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{ticket.date}</TableCell>
                        <TableCell>{ticket.lastUpdate}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No tickets found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                  <AccordionContent>
                    You can reset your password by going to the Profile page, selecting the Security tab, and entering your new password details.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Where can I find my invoices?</AccordionTrigger>
                  <AccordionContent>
                    All your invoices are located in the Documents page under the "Invoices" category. You can download them as PDF files.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How do I sign a contract?</AccordionTrigger>
                  <AccordionContent>
                    Navigate to the Contracts page, find the contract with status "Pending Signature", and click the "Sign" button.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I add more users to my account?</AccordionTrigger>
                  <AccordionContent>
                    Yes, if your subscription plan supports it. Please contact support to upgrade your plan or add more seats.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
