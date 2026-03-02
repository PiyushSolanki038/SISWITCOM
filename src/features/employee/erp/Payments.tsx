import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { erpService } from './erpService';
import { ERPPayment } from './types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download, MoreHorizontal } from "lucide-react";
import { format } from 'date-fns';

const Payments = () => {
  const [payments, setPayments] = useState<ERPPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await erpService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredPayments = payments.filter(payment => 
    payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.accountId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track all received payments.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payments List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search payments..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-10">Loading payments...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment._id} className="cursor-pointer" onClick={() => navigate(`/employee-dashboard/erp/payments/${payment._id}`)}>
                      <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                      <TableCell>{payment.accountId?.name || 'Unknown'}</TableCell>
                      <TableCell>{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="capitalize">{(payment.method || 'bank_transfer').replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(payment.status) as any}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
