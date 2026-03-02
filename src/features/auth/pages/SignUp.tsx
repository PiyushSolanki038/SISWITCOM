import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Check, PieChart, TrendingUp, Users, ArrowLeft, Eye, EyeOff, AlertCircle, Rocket, Shield, Zap } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { API_CONFIG } from '@/config/api';

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

/**
 * SignUp Page
 * 
 * Registration page for new users.
 * Allows creating an account as 'Employee', 'Customer', 'Admin', or 'Owner'.
 */
const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { updateSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState<0 | 1 | 2 | 3>(0);
  const [companyName, setCompanyName] = useState('');
  const [plan, setPlan] = useState<'starter' | 'professional' | 'enterprise' | null>(null);
  const [setupMessage, setSetupMessage] = useState('');

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Default signup role is Owner (no selector shown)
  const defaultRole = 'owner';

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await signup(data.email, data.password, data.name, defaultRole);
      
      toast({
        title: "Account created!",
        description: "Welcome to Sirius Infra.",
      });

      // Open workspace setup popup flow
      setShowSetup(true);
      setSetupStep(0);
      setSetupMessage('Creating your workspace...');
      setTimeout(() => {
        setSetupStep(1);
        setSetupMessage('');
      }, 2000);
    } catch (error) {
      console.error('Signup failed:', error);
      const errorMessage = (error as Error).message || "Registration failed";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E0F2F1] flex items-center justify-center p-4 md:p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row w-full max-w-[1000px] min-h-[600px] relative"
      >
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-between relative z-10 bg-white">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(-1)} 
                  className="pl-0 hover:bg-transparent text-slate-500 hover:text-[#1A3C34] group"
              >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
                  Back
              </Button>
              <div className="h-4 w-px bg-slate-300"></div>
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/')} 
                  className="hover:bg-transparent text-slate-500 hover:text-[#1A3C34]"
              >
                  Home
              </Button>
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-6 w-fit hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-[#1A3C34] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-xl text-[#1A3C34]">Sirius Infra</span>
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#1A3C34] mb-2">Create Account</h1>
                <p className="text-slate-500 text-sm">
                    Join Sirius Infra 2.0 and start scaling your business today
                </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Role Selector removed — sign up defaults to Owner */}

                   {/* Error Alert */}
                   <AnimatePresence>
                     {error && (
                       <motion.div
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         exit={{ opacity: 0, height: 0 }}
                         className="overflow-hidden"
                       >
                         <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-800">
                           <AlertCircle className="h-4 w-4" />
                           <AlertTitle>Registration Failed</AlertTitle>
                           <AlertDescription>
                             {error}
                           </AlertDescription>
                         </Alert>
                       </motion.div>
                     )}
                   </AnimatePresence>

                  <div className="space-y-3">
                       <FormField
                         control={form.control}
                         name="name"
                         render={({ field }) => (
                           <FormItem>
                             <FormControl>
                               <Input 
                                  {...field}
                                  type="text" 
                                  placeholder="Full Name"
                                  className="h-10 rounded-lg border-slate-200 bg-slate-50 px-3 text-sm placeholder:text-slate-400 focus:border-[#1A3C34] focus:ring-[#1A3C34] focus:bg-white transition-all"
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />

                       <FormField
                         control={form.control}
                         name="email"
                         render={({ field }) => (
                           <FormItem>
                             <FormControl>
                               <Input 
                                  {...field}
                                  type="email" 
                                  placeholder="name@company.com"
                                  className="h-10 rounded-lg border-slate-200 bg-slate-50 px-3 text-sm placeholder:text-slate-400 focus:border-[#1A3C34] focus:ring-[#1A3C34] focus:bg-white transition-all"
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />

                       <FormField
                         control={form.control}
                         name="password"
                         render={({ field }) => (
                           <FormItem>
                             <FormControl>
                               <div className="relative">
                                 <Input 
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    className="h-10 rounded-lg border-slate-200 bg-slate-50 px-3 pr-10 text-sm placeholder:text-slate-400 focus:border-[#1A3C34] focus:ring-[#1A3C34] focus:bg-white transition-all"
                                 />
                                 <button
                                   type="button"
                                   onClick={() => setShowPassword(!showPassword)}
                                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                 >
                                   {showPassword ? (
                                     <EyeOff className="h-4 w-4" />
                                   ) : (
                                     <Eye className="h-4 w-4" />
                                   )}
                                 </button>
                               </div>
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                  </div>

                  <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-10 bg-[#1A3C34] hover:bg-[#122a25] text-white font-medium text-base rounded-lg shadow-md shadow-[#1A3C34]/20 transition-all transform hover:-translate-y-0.5"
                  >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                  </Button>

                  {/* Social Login */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500 text-[10px]">Or sign up with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" type="button" className="h-9 border-slate-200 hover:bg-slate-50 hover:text-[#1A3C34] text-xs">
                      <svg className="mr-2 h-3 w-3" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button" className="h-9 border-slate-200 hover:bg-slate-50 hover:text-[#1A3C34] text-xs">
                      <svg className="mr-2 h-3 w-3" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="microsoft" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                         <path fill="currentColor" d="M0 32h214.6v214.6H0V32zm233.4 0H448v214.6H233.4V32zM0 265.4h214.6V480H0V265.4zm233.4 0H448V480H233.4V265.4z"></path>
                      </svg>
                      Microsoft
                    </Button>
                  </div>

                  <p className="text-center text-xs text-slate-500 mt-4">
                      Already have an account?{' '}
                      <Link to="/signin" className="font-semibold text-[#1A3C34] hover:underline">
                          Sign in
                      </Link>
                  </p>
              </form>
            </Form>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
              <span>© 2024 Sirius Infra</span>
              <div className="flex gap-4">
                  <a href="#" className="hover:text-[#1A3C34]">Privacy</a>
                  <a href="#" className="hover:text-[#1A3C34]">Terms</a>
              </div>
          </div>
        </div>

        {/* Right Side - Visuals */}
        <div className="hidden md:flex w-1/2 bg-[#1A3C34] relative overflow-hidden flex-col justify-center p-12 lg:p-16 text-white">
            {/* Background Abstract Shapes */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#EB5E4C] opacity-10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
            
            <div className="relative z-10">
                <div className="mb-10">
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10"
                   >
                      <Rocket className="w-8 h-8 text-[#EB5E4C]" />
                   </motion.div>
                   <motion.h2 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.3 }}
                     className="text-3xl font-bold mb-4 leading-tight"
                   >
                     Start your journey with Sirius Infra
                   </motion.h2>
                   <motion.p 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.4 }}
                     className="text-white/70 text-lg leading-relaxed"
                   >
                     Join thousands of businesses that trust us to power their infrastructure and drive growth.
                   </motion.p>
                </div>

                <div className="space-y-4">
                    {[
                        { icon: Zap, text: "Instant setup & deployment" },
                        { icon: Shield, text: "Enterprise-grade security" },
                        { icon: Users, text: "Unlimited team members" }
                    ].map((item, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#EB5E4C]/20 flex items-center justify-center shrink-0">
                                <item.icon className="w-5 h-5 text-[#EB5E4C]" />
                            </div>
                            <span className="font-medium">{item.text}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
            
            {/* Floating Element */}
            <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-24 right-12 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-[200px]"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">JD</div>
                    <div className="text-xs">
                        <div className="font-bold">John Doe</div>
                        <div className="text-white/60">Just signed up!</div>
                    </div>
                </div>
            </motion.div>
        </div>
      </motion.div>

      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogOverlay className="bg-[rgba(30,58,138,0.35)] backdrop-blur-md" />
        <DialogContent className="max-w-md rounded-2xl bg-gradient-to-br from-white via-[#E0F2F1] to-[#B3E5FC] border-none shadow-2xl">
          {setupStep === 0 && (
            <div className="text-center py-6">
              <DialogTitle className="text-[#1A3C34]">Setting up your workspace</DialogTitle>
              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#1A3C34]/30 border-t-[#1A3C34] rounded-full animate-spin" />
                <p className="text-sm text-slate-600">{setupMessage}</p>
              </div>
            </div>
          )}

          {setupStep === 1 && (
            <div className="py-4">
              <DialogTitle className="text-[#1A3C34] mb-2">Name your company</DialogTitle>
              <p className="text-xs text-slate-600 mb-4">We’ll create your workspace with this name.</p>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Sirius Infra Pvt Ltd"
                className="h-10"
              />
              <div className="mt-4 flex justify-end">
                <Button
                  disabled={!companyName.trim()}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token') || '';
                      const res = await fetch(`${API_CONFIG.baseUrl}/admin/workspace`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                        body: JSON.stringify({ companyName: companyName.trim() }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.message || 'Workspace creation failed');
                      setSetupStep(2);
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                  className="bg-[#1A3C34]"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {setupStep === 2 && (
            <div className="py-4">
              <DialogTitle className="text-[#1A3C34] mb-2">Select a plan</DialogTitle>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPlan('starter')}
                  className={`p-4 rounded-lg text-xs border ${plan==='starter' ? 'bg-white border-[#1A3C34] text-[#1A3C34]' : 'bg-white/60 border-slate-200 text-slate-700'}`}>
                  <div className="font-semibold mb-1">Starter</div>
                  <div className="text-slate-600">$49/month</div>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
                    <li>Up to 5 users</li>
                    <li>Basic CRM pipeline</li>
                    <li>Standard reporting</li>
                    <li>Email support</li>
                    <li>1GB document storage</li>
                  </ul>
                </button>
                <button
                  onClick={() => setPlan('professional')}
                  className={`p-4 rounded-lg text-xs border ${plan==='professional' ? 'bg-white border-[#1A3C34] text-[#1A3C34]' : 'bg-white/60 border-slate-200 text-slate-700'}`}>
                  <div className="font-semibold mb-1">Professional</div>
                  <div className="text-slate-600">$149/month</div>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
                    <li>Up to 25 users</li>
                    <li>Full CRM & CPQ modules</li>
                    <li>Advanced analytics & forecasting</li>
                    <li>Priority email & chat support</li>
                    <li>10GB document storage</li>
                    <li>API access</li>
                    <li>Custom quoting templates</li>
                  </ul>
                </button>
                <button
                  onClick={() => setPlan('enterprise')}
                  className={`p-4 rounded-lg text-xs border ${plan==='enterprise' ? 'bg-white border-[#1A3C34] text-[#1A3C34]' : 'bg-white/60 border-slate-200 text-slate-700'}`}>
                  <div className="font-semibold mb-1">Enterprise</div>
                  <div className="text-slate-600">$399/month</div>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
                    <li>Unlimited users</li>
                    <li>All modules (CRM, CPQ, CLM, E-Sign)</li>
                    <li>Custom integrations & webhooks</li>
                    <li>24/7 dedicated success manager</li>
                    <li>Unlimited storage</li>
                    <li>SSO & advanced security</li>
                    <li>Audit logs & compliance</li>
                  </ul>
                </button>
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={() => setSetupStep(1)}>Back</Button>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={!plan}
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token') || '';
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const amountMap: Record<string, number> = { starter: 49, professional: 149, enterprise: 399 };
                        const res = await fetch(`${API_CONFIG.baseUrl}/payments/paytm/create-order`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                          body: JSON.stringify({
                            amount: amountMap[plan as string],
                            userId: currentUser.id,
                            plan,
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || 'Unable to create Paytm order');
                        const form = document.createElement('form');
                        form.method = 'post';
                        form.action = data.gatewayUrl;
                        Object.entries(data.params).forEach(([k, v]) => {
                          const input = document.createElement('input');
                          input.type = 'hidden';
                          input.name = k;
                          input.value = String(v);
                          form.appendChild(input);
                        });
                        const cs = document.createElement('input');
                        cs.type = 'hidden';
                        cs.name = 'CHECKSUMHASH';
                        cs.value = data.checksum;
                        form.appendChild(cs);
                        document.body.appendChild(form);
                        form.submit();
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                    className="bg-[#1A3C34]"
                  >
                    Pay with Paytm
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!plan}
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token') || '';
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const amountMap: Record<string, number> = { starter: 49, professional: 149, enterprise: 399 };
                        const res = await fetch(`${API_CONFIG.baseUrl}/payments/paytm/dev-bypass`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                          body: JSON.stringify({
                            amount: amountMap[plan as string],
                            userId: currentUser.id,
                            plan,
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || 'Bypass failed');
                        setShowSetup(false);
                        navigate('/owner-dashboard', { replace: true });
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    Dev Payment Bypass
                  </Button>
                </div>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div className="py-6 text-center">
              <DialogTitle className="text-[#1A3C34]">Workspace Ready</DialogTitle>
              <p className="text-sm text-slate-700 mt-2">Welcome to {companyName}!</p>
              <Button
                className="mt-4 bg-[#1A3C34]"
                onClick={() => {
                  setShowSetup(false);
                  navigate('/owner-dashboard', { replace: true });
                }}
              >
                Go to Owner Dashboard
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignUp;
