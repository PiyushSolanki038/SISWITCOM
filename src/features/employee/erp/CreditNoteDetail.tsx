import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { erpService } from './erpService';
import { ERPCreditNote } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CreditNoteDetail = () => {
  const { id } = useParams();
  const [note, setNote] = useState<ERPCreditNote | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const n = await erpService.getCreditNote(id);
      setNote(n);
      setLoading(false);
    };
    load();
  }, [id]);
  
  if (loading) return <div className="p-6">Loading...</div>;
  if (!note) return <div className="p-6">Not found</div>;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Note {note.creditNoteNumber}</h1>
          <p className="text-muted-foreground">{note.accountId?.name}</p>
        </div>
        <div>
          <Badge>{note.status}</Badge>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div>Amount</div>
              <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(note.amount))}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Reason</div>
              <div className="text-right">{note.reason}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Linked</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/employee-dashboard/erp/invoices/${note.invoiceId}`)}>View Invoice</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default CreditNoteDetail;
