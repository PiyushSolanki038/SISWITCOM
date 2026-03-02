import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Download, 
  Type, 
  PenTool, 
  Eraser, 
  ArrowRight,
  ShieldCheck,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_CONFIG } from '@/config/api';
import axios from 'axios';

const PublicSigner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [step, setStep] = useState<'review' | 'sign' | 'completed'>('review');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Extract token from URL path: /public/sign/:token or /sign/:token
        const pathParts = window.location.pathname.split('/');
        const token = pathParts[pathParts.length - 1];

        if (!token) {
          setError('Invalid signing link');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_CONFIG.baseUrl}/esign/session/${token}`);
        setSession(response.data.session);
        setContract(response.data.contract);
        
        if (response.data.session.status === 'signed') {
          setStep('completed');
        }
      } catch (err: any) {
        console.error('Error fetching session:', err);
        setError(err.response?.data?.message || 'Failed to load signing session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
      }
    }
  }, [step, signatureType]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).nativeEvent.offsetX;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).nativeEvent.offsetY;
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).nativeEvent.offsetX;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).nativeEvent.offsetY;
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleComplete = async () => {
    if (!session || !contract) return;
    
    setSubmitting(true);
    try {
      let signatureData = '';
      
      if (signatureType === 'draw' && canvasRef.current) {
        signatureData = canvasRef.current.toDataURL();
      } else {
        // Create an image from text (simplified for now, just sending text)
        // In a real app, you'd convert text to image or store as text
        signatureData = `text:${typedSignature}`;
      }

      await axios.post(`${API_CONFIG.baseUrl}/esign/sign/${session.token}`, {
        signatureData
      });

      setStep('completed');
    } catch (err: any) {
      console.error('Error signing:', err);
      // You might want to show a toast or error message here
      alert('Failed to sign document: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#1A3C34] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading secure session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-red-200">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-8">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (step === 'completed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#1A3C34] mb-2">You're All Set!</h1>
          <p className="text-slate-600 mb-8">
            The document has been successfully signed. A copy has been sent to your email.
          </p>
          <div className="space-y-3">
            <Button className="w-full bg-[#1A3C34] hover:bg-[#1A3C34]/90">
              <Download className="w-4 h-4 mr-2" />
              Download Signed Copy
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#1A3C34]" />
          <span className="font-bold text-[#1A3C34]">SecureSign</span>
        </div>
        <div className="text-sm text-slate-500 hidden sm:block">
          {contract?.name}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 flex flex-col md:flex-row gap-6">
        {/* Document Preview */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border p-8 min-h-[500px] flex flex-col">
           <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h2 className="font-semibold text-lg">Document Preview</h2>
              <Badge variant="outline">Page 1 of 1</Badge>
           </div>
           <div className="flex-1 bg-slate-50 rounded border border-slate-200 overflow-auto p-8">
              {contract?.content ? (
                <div dangerouslySetInnerHTML={{ __html: contract.content }} className="prose max-w-none" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <FileText className="w-16 h-16 mb-3" />
                  <p>Document Content Not Available</p>
                </div>
              )}
           </div>
        </div>

        {/* Action Panel */}
        <div className="w-full md:w-[350px] space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 'review' ? `Review & Sign` : 'Create Signature'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 'review' ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                     <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded text-sm">
                        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p>By signing, you agree to be legally bound by the terms of this document.</p>
                     </div>
                     <div className="flex items-start gap-2">
                        <Checkbox 
                          id="terms" 
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                        />
                        <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                          I have read and agree to the <span className="text-blue-600 underline">Terms of Service</span> and <span className="text-blue-600 underline">Electronic Disclosure</span>.
                        </Label>
                     </div>
                  </div>
                  <Button 
                    className="w-full bg-[#1A3C34]" 
                    disabled={!acceptedTerms}
                    onClick={() => setStep('sign')}
                  >
                    Start Signing <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as 'draw' | 'type')}>
                    <TabsList className="w-full">
                      <TabsTrigger value="draw" className="flex-1"><PenTool className="w-4 h-4 mr-2"/> Draw</TabsTrigger>
                      <TabsTrigger value="type" className="flex-1"><Type className="w-4 h-4 mr-2"/> Type</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="draw" className="mt-4 space-y-2">
                      <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white touch-none">
                        <canvas
                          ref={canvasRef}
                          width={300}
                          height={150}
                          className="w-full cursor-crosshair"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-slate-500">
                          <Eraser className="w-3 h-3 mr-1" /> Clear
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="type" className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input 
                          placeholder="Type your name" 
                          value={typedSignature}
                          onChange={(e) => setTypedSignature(e.target.value)}
                        />
                      </div>
                      {typedSignature && (
                         <div className="p-4 bg-slate-50 border rounded text-center">
                            <p className="font-dancing-script text-2xl italic text-[#1A3C34]">{typedSignature}</p>
                         </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <div className="pt-4 border-t flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('review')} disabled={submitting}>
                      Back
                    </Button>
                    <Button 
                      className="flex-1 bg-[#1A3C34]"
                      onClick={handleComplete}
                      disabled={submitting || (signatureType === 'type' && !typedSignature)}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing...
                        </>
                      ) : (
                        'Adopt & Sign'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PublicSigner;
