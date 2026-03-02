import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, SubscriptionPlan } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import {
  Check, HelpCircle, CheckCircle2, XCircle, Zap, Shield,
  CreditCard, Loader2, Smartphone, ArrowRight, Sparkles, Star, Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import { createPayment } from '@/services/payment';
import { useToast } from '@/components/ui/use-toast';

interface Plan {
  name: string;
  id: string;
  description: string;
  price: { monthly: number; annual: number };
  featured?: boolean;
  badge?: string;
  gradient: string;
  borderColor: string;
  features: string[];
  notIncluded?: string[];
}

const Pricing: React.FC = () => {
  const { isAuthenticated, user, updateSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'bank_transfer' | 'upi'>('credit_card');
  const [paymentDetails, setPaymentDetails] = useState({ cardNumber: '', expiry: '', cvc: '', name: '', upiId: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [id]: value }));
  };

  const plans: Plan[] = [
    {
      name: 'Starter',
      id: 'starter',
      description: 'Perfect for small teams getting started.',
      price: { monthly: 49, annual: 39 },
      gradient: 'from-slate-800/50 to-slate-900/50',
      borderColor: 'border-white/[0.08]',
      features: ['Up to 5 users', 'Basic CRM pipeline', 'Standard reporting', 'Email support', '1GB document storage'],
      notIncluded: ['Advanced workflows', 'CPQ & E-Sign', 'API Access'],
    },
    {
      name: 'Professional',
      id: 'professional',
      description: 'For growing businesses with advanced revenue needs.',
      price: { monthly: 149, annual: 119 },
      featured: true,
      badge: 'Most Popular',
      gradient: 'from-emerald-950/80 to-teal-950/60',
      borderColor: 'border-emerald-500/40',
      features: ['Up to 25 users', 'Full CRM & CPQ modules', 'Advanced analytics & forecasting', 'Priority email & chat support', '10GB document storage', 'API access', 'Custom quoting templates'],
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      description: 'Full platform power for large organizations at scale.',
      price: { monthly: 399, annual: 319 },
      gradient: 'from-slate-800/50 to-slate-900/50',
      borderColor: 'border-white/[0.08]',
      features: ['Unlimited users', 'All modules (CRM, CPQ, CLM, E-Sign)', 'Custom integrations & webhooks', '24/7 dedicated success manager', 'Unlimited storage', 'SSO & advanced security', 'Audit logs & compliance'],
    },
  ];

  const handleSelectPlan = (plan: Plan) => {
    if (!isAuthenticated) { navigate('/signup'); return; }
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !user) return;
    setIsProcessing(true);
    try {
      await createPayment({
        userName: user?.name || 'Unknown User',
        planId: selectedPlan.id,
        paymentMethod,
        cardNumber: paymentMethod === 'credit_card' ? paymentDetails.cardNumber : undefined,
        expiryDate: paymentMethod === 'credit_card' ? paymentDetails.expiry : undefined,
        cvc: paymentMethod === 'credit_card' ? paymentDetails.cvc : undefined,
        cardholderName: paymentMethod === 'credit_card' ? paymentDetails.name : undefined,
        upiId: paymentMethod === 'upi' ? paymentDetails.upiId : undefined,
        amount: selectedPlan.price.monthly,
        currency: 'USD',
      });
      await updateSubscription(selectedPlan.id as SubscriptionPlan);
      toast({ title: 'Payment Successful', description: `Subscribed to ${selectedPlan.name} plan.` });
      setIsPaymentModalOpen(false);
      navigate('/dashboard');
    } catch {
      toast({ title: 'Payment Failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const faqs = [
    { q: 'Can I switch plans later?', a: 'Yes, upgrade or downgrade anytime. Changes apply to your next billing cycle.' },
    { q: 'Do you offer annual discounts?', a: 'Yes! Save 20% with annual billing. Contact sales for custom enterprise pricing.' },
    { q: 'Is there a free trial?', a: 'All plans include a 14-day free trial. No credit card required to start.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, UPI, and wire transfers for Enterprise.' },
    { q: 'Is my data secure?', a: 'Absolutely. We are SOC 2 Type II certified with end-to-end encryption and GDPR compliance.' },
    { q: 'Do you offer custom plans?', a: 'Yes, contact our sales team for custom pricing tailored to your organization.' },
  ];

  const currentPrice = (plan: Plan) => billing === 'annual' ? plan.price.annual : plan.price.monthly;

  return (
    <div className="flex flex-col min-h-screen bg-[#080C10] overflow-hidden">

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-[#0F1923] border border-white/10 text-white">
          <div className="bg-gradient-to-r from-emerald-950 to-teal-950 border-b border-white/10 p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Complete Subscription</DialogTitle>
              <DialogDescription className="text-slate-400">
                Securely upgrade to the {selectedPlan?.name} Plan
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex justify-between items-end border-t border-white/10 pt-4">
              <div>
                <p className="text-sm text-slate-400">Total due today</p>
                <p className="text-3xl font-black text-white">
                  ${selectedPlan ? currentPrice(selectedPlan) : 0}
                  <span className="text-lg text-slate-400 font-normal">/mo</span>
                </p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">14-Day Free Trial</Badge>
            </div>
          </div>
          <form onSubmit={handlePayment} className="p-6">
            <Tabs defaultValue="credit_card" onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/5 border border-white/10">
                <TabsTrigger value="credit_card" type="button" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Card</TabsTrigger>
                <TabsTrigger value="upi" type="button" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">UPI / QR</TabsTrigger>
                <TabsTrigger value="paypal" type="button" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">PayPal</TabsTrigger>
                <TabsTrigger value="bank_transfer" type="button" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Bank</TabsTrigger>
              </TabsList>
              <TabsContent value="credit_card" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="cardNumber" className="text-slate-300">Card Number</Label>
                  <div className="relative">
                    <Input id="cardNumber" placeholder="0000 0000 0000 0000" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50" required={paymentMethod === 'credit_card'} value={paymentDetails.cardNumber} onChange={handleInputChange} />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="expiry" className="text-slate-300">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50" required={paymentMethod === 'credit_card'} value={paymentDetails.expiry} onChange={handleInputChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cvc" className="text-slate-300">CVC</Label>
                    <Input id="cvc" placeholder="123" className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50" required={paymentMethod === 'credit_card'} value={paymentDetails.cvc} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-slate-300">Cardholder Name</Label>
                  <Input id="name" placeholder="John Doe" className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50" required={paymentMethod === 'credit_card'} value={paymentDetails.name} onChange={handleInputChange} />
                </div>
              </TabsContent>
              <TabsContent value="upi" className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="bg-white p-4 rounded-2xl border border-white/10 shadow-lg">
                    {selectedPlan && <QRCodeSVG value={`upi://pay?pa=sirius@upi&pn=Sirius&am=${currentPrice(selectedPlan).toFixed(2)}&cu=USD`} size={180} level="H" includeMargin />}
                  </div>
                  <p className="text-sm font-medium text-slate-400">Scan QR to Pay with any UPI App</p>
                  <div className="w-full flex items-center gap-4 text-xs text-slate-600">
                    <div className="h-px bg-white/10 flex-1" /><span>OR ENTER UPI ID</span><div className="h-px bg-white/10 flex-1" />
                  </div>
                  <div className="w-full relative">
                    <Input id="upiId" placeholder="username@upi" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50" required={paymentMethod === 'upi'} value={paymentDetails.upiId} onChange={handleInputChange} />
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="paypal" className="py-8 text-center space-y-4">
                <div className="bg-blue-950/30 p-6 rounded-2xl border border-blue-500/20">
                  <p className="text-blue-300 font-medium mb-2">Pay with PayPal</p>
                  <p className="text-sm text-blue-400/70 mb-4">You will be redirected to PayPal to complete your purchase securely.</p>
                  <Button type="button" variant="outline" className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10">Connect PayPal Account</Button>
                </div>
              </TabsContent>
              <TabsContent value="bank_transfer" className="py-4 space-y-4">
                <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/10 text-left space-y-3">
                  <h4 className="font-semibold text-white">Bank Transfer Instructions</h4>
                  <p className="text-sm text-slate-400">Transfer the amount to the following account:</p>
                  <div className="text-sm font-mono bg-black/20 p-3 rounded-xl border border-white/5 space-y-2">
                    {[['Bank', 'Sirius Bank Corp'], ['Account', '1234 5678 9012'], ['Routing', '987654321']].map(([k, v]) => (
                      <div key={k} className="flex justify-between"><span className="text-slate-500">{k}:</span><span className="text-white">{v}</span></div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Subscription active once funds are received (1-2 business days).</p>
                </div>
              </TabsContent>
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 mb-4 justify-center">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>256-bit Encrypted & Secure Payment</span>
              </div>
              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold text-base border-0 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all" disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : paymentMethod === 'bank_transfer' ? 'Confirm Transfer' : `Pay $${selectedPlan ? currentPrice(selectedPlan) : 0}`}
              </Button>
            </Tabs>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
              Plans for every
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">stage of growth</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Choose the plan that fits your business. Scale as you grow. No hidden fees, ever.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-semibold ${billing === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
              <button
                onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${billing === 'annual' ? 'bg-emerald-500' : 'bg-white/10'}`}
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                  animate={{ left: billing === 'annual' ? '1.75rem' : '0.25rem' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-semibold ${billing === 'annual' ? 'text-white' : 'text-slate-500'}`}>
                Annual
                <span className="ml-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Save 20%</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ PRICING CARDS ═══ */}
      <section className="pb-32 relative z-10">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative ${plan.featured ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-xs font-bold rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                      <Star className="h-3 w-3 fill-current" />
                      {plan.badge}
                    </div>
                  </div>
                )}
                <div className={`relative h-full flex flex-col bg-gradient-to-b ${plan.gradient} border ${plan.borderColor} rounded-3xl overflow-hidden transition-all duration-500 hover:border-emerald-500/30 hover:shadow-[0_20px_60px_rgba(16,185,129,0.1)] ${plan.featured ? 'shadow-[0_0_60px_rgba(16,185,129,0.15)]' : ''}`}>
                  {plan.featured && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,transparent_60%)]" />}
                  <div className="relative z-10 p-8 border-b border-white/[0.06]">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-400 min-h-[40px] leading-relaxed">{plan.description}</p>
                    <div className="mt-6 flex items-baseline gap-2">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${plan.id}-${billing}`}
                          className="text-5xl font-black text-white"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          ${currentPrice(plan)}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-slate-500 text-sm">/month</span>
                    </div>
                    {billing === 'annual' && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-400 mt-1">
                        Billed annually · Save ${(plan.price.monthly - plan.price.annual) * 12}/yr
                      </motion.p>
                    )}
                  </div>
                  <div className="relative z-10 flex-1 p-8">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">What's included</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${plan.featured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className={`font-medium ${plan.featured ? 'text-slate-200' : 'text-slate-400'}`}>{feature}</span>
                        </li>
                      ))}
                      {plan.notIncluded?.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm opacity-40">
                          <div className="mt-0.5 text-slate-600 flex-shrink-0"><XCircle size={14} /></div>
                          <span className="font-medium text-slate-600 line-through">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative z-10 p-8 pt-0">
                    <Button
                      className={`w-full h-12 text-base font-bold rounded-2xl transition-all duration-300 ${plan.featured ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white border-0 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'}`}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {isAuthenticated ? 'Choose Plan' : 'Get Started'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            {[
              { icon: Shield, text: 'SOC 2 Certified' },
              { icon: Lock, text: 'End-to-End Encrypted' },
              { icon: CheckCircle2, text: '30-Day Money Back' },
              { icon: Zap, text: 'Cancel Anytime' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-emerald-500" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-24 bg-[#0A0F14] border-t border-white/5">
        <div className="container px-4 mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-lg">Everything you need to know about our pricing.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                className="bg-[#0F1923]/80 border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-500/20 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              >
                <h3 className="font-bold text-white mb-3 flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed pl-6">{faq.a}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-slate-500 mb-4">Still have questions? We're here to help.</p>
            <Link to="/contact">
              <Button variant="outline" className="h-12 px-8 rounded-full border-white/10 text-white hover:bg-white/5 hover:border-white/20 font-semibold">
                Contact Sales Team <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
