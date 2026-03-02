import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  XCircle,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { customerService, CustomerQuote } from '../services/customerService';
import { useToast } from '@/components/ui/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const QuoteDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quote, setQuote] = useState<CustomerQuote | null>(null);
  const [isPriceBreakdownOpen, setIsPriceBreakdownOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (id) {
      const fetchQuote = async () => {
        try {
          const data = await customerService.getQuoteById(id);
          if (data) {
            setQuote(data);
            
            // Calculate countdown
            if (data.status === 'Sent' && data.validUntil) {
               const calculateTimeLeft = () => {
                 const end = new Date(data.validUntil).getTime();
                 const now = new Date().getTime();
                 const distance = end - now;
                 
                 if (distance < 0) {
                   return 'Expired';
                 }
                 
                 const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                 const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                 return `${days}d ${hours}h left`;
               };
               setTimeLeft(calculateTimeLeft());
            }
          } else {
            toast({ title: "Error", description: "Quote not found", variant: "destructive" });
            navigate('/customer-dashboard/quotes');
          }
        } catch (error) {
           console.error(error);
           toast({ title: "Error", description: "Failed to load quote", variant: "destructive" });
        }
      };
      fetchQuote();
    }
  }, [id, navigate, toast]);

  const handleStatusChange = async (status: 'Accepted' | 'Rejected') => {
    if (quote) {
      try {
        const updated = await customerService.updateQuoteStatus(quote.id, status);
        if (updated) {
            setQuote(updated);
            toast({
                title: `Quote ${status}`,
                description: `Quote has been ${status.toLowerCase()}.`,
            });
            if (status === 'Accepted') {
                 // Maybe navigate to contract or stay here
            } else {
                 navigate('/customer-dashboard/quotes');
            }
        }
      } catch (error) {
          toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      }
    }
  };

  if (!quote) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/customer-dashboard/quotes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-[#1A3C34]">{quote.title}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            <span>{quote.id}</span>
            <span>•</span>
            <span>{quote.date}</span>
            <span>•</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {quote.status}
            </Badge>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Validity Countdown */}
          {quote.status === 'Sent' && timeLeft && timeLeft !== 'Expired' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Offer expires in {timeLeft}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Items & Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 text-sm font-medium text-slate-500 pb-2 border-b">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                {quote.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 text-sm py-2">
                    <div className="col-span-6 font-medium">{item.desc}</div>
                    <div className="col-span-2 text-center text-slate-500">{item.qty}</div>
                    <div className="col-span-2 text-right text-slate-500">{item.price}</div>
                    <div className="col-span-2 text-right font-medium">{item.total}</div>
                  </div>
                ))}
                <Separator className="my-4" />
                
                {/* Expandable Price Breakdown */}
                {quote.priceBreakdown && (
                  <Collapsible 
                    open={isPriceBreakdownOpen} 
                    onOpenChange={setIsPriceBreakdownOpen}
                    className="space-y-2 border rounded-md p-3 bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Detailed Breakdown</span>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {isPriceBreakdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="space-y-2 text-sm text-slate-600 pt-2">
                      <div className="flex justify-between">
                        <span>Recurring Fees</span>
                        <span>{quote.priceBreakdown.recurring}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>One-Time Fees</span>
                        <span>{quote.priceBreakdown.oneTime}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Discounts</span>
                        <span>{quote.priceBreakdown.discounts}</span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span>{quote.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax</span>
                    <span>{quote.tax}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-[#1A3C34] pt-2 border-t">
                    <span>Total</span>
                    <span>{quote.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Terms Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Legal Terms Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {quote.legalTerms ? (
                <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-700 whitespace-pre-line">
                  {quote.legalTerms}
                </div>
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed">
                  1. Payment is due within 30 days of invoice date.<br/>
                  2. This quote is valid until {quote.validUntil}.<br/>
                  3. Subject to the Master Services Agreement.<br/>
                  4. All prices are in USD.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Actions Card */}
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">
                Please review the quote details. Accepting this quote will generate a binding contract.
              </p>
              {quote.status === 'Sent' && (
                <div className="grid gap-3">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 gap-2"
                    onClick={() => handleStatusChange('Accepted')}
                  >
                    <CheckCircle2 size={16} />
                    Accept Quote
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 gap-2"
                    onClick={() => handleStatusChange('Rejected')}
                  >
                    <XCircle size={16} />
                    Reject Quote
                  </Button>
                </div>
              )}
              {quote.status !== 'Sent' && (
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-700">Quote {quote.status}</p>
                  <p className="text-xs text-slate-500">No further actions available.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* What Happens Next */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-4 space-y-4">
                 <div className="absolute left-1.5 top-1.5 bottom-1.5 w-px bg-slate-200"></div>
                 <div className="relative flex items-start gap-3">
                   <div className="h-3 w-3 rounded-full bg-green-500 mt-1.5 z-10"></div>
                   <div className="text-sm">
                     <p className="font-medium text-slate-900">Accept Quote</p>
                     <p className="text-slate-500">You confirm the commercial terms.</p>
                   </div>
                 </div>
                 <div className="relative flex items-start gap-3">
                   <div className="h-3 w-3 rounded-full bg-slate-300 mt-1.5 z-10"></div>
                   <div className="text-sm">
                     <p className="font-medium text-slate-900">Contract Generated</p>
                     <p className="text-slate-500">We'll prepare the official agreement.</p>
                   </div>
                 </div>
                 <div className="relative flex items-start gap-3">
                   <div className="h-3 w-3 rounded-full bg-slate-300 mt-1.5 z-10"></div>
                   <div className="text-sm">
                     <p className="font-medium text-slate-900">Sign Contract</p>
                     <p className="text-slate-500">Digital signature required.</p>
                   </div>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-4">
                Have questions about this quote? Contact your account manager or support.
              </p>
              <Button variant="link" className="p-0 h-auto text-primary">Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;
