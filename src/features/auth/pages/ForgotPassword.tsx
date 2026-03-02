import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, CheckCircle2, Shield, Lock, Key, AlertCircle, Check } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const { watch } = form;
  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setSubmitted(true);
      
      // Simulate "Real" Email experience
      toast({
        title: "Email Sent",
        description: `We've sent a password reset link to ${data.email}`,
      });
      
      // Optional: Open mail client to make it feel "real"
      // window.location.href = `mailto:${data.email}?subject=Reset Your Password&body=Click here to reset your password...`;
      
    } catch (error) {
       console.error(error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Something went wrong. Please try again.",
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
            {!submitted && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/signin')} 
                    className="mb-4 pl-0 hover:bg-transparent text-slate-500 hover:text-[#1A3C34] group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
                    Back to Sign In
                </Button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-6 w-fit hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-[#1A3C34] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-xl text-[#1A3C34]">Sirius Infra</span>
            </Link>

            {submitted ? (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                >
                    <div className="w-16 h-16 bg-[#1A3C34] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#1A3C34]/20 mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1A3C34] mb-3 tracking-tight">Check your email</h3>
                    <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                        If an account exists with <span className="font-bold text-[#1A3C34]">{email}</span>, you'll receive password reset instructions shortly.
                    </p>
                    <Link to="/signin">
                        <Button className="w-full h-10 bg-[#1A3C34] hover:bg-[#122a25] text-white font-medium text-base rounded-lg shadow-md shadow-[#1A3C34]/20 transition-all transform hover:-translate-y-0.5">
                            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Sign In
                        </Button>
                    </Link>
                </motion.div>
            ) : (
                <>
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-[#1A3C34] mb-2">Reset Password</h1>
                        <p className="text-slate-500 text-sm">
                            Enter your email address and we'll send you a link to reset your password
                        </p>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative">
                                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                      <Input 
                                          {...field}
                                          type="email" 
                                          placeholder="name@company.com"
                                          className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-10 px-3 text-sm placeholder:text-slate-400 focus:border-[#1A3C34] focus:ring-[#1A3C34] focus:bg-white transition-all"
                                      />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                              type="submit" 
                              disabled={isLoading}
                              className="w-full h-10 bg-[#1A3C34] hover:bg-[#122a25] text-white font-medium text-base rounded-lg shadow-md shadow-[#1A3C34]/20 transition-all transform hover:-translate-y-0.5"
                          >
                              {isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Sending Link...</span>
                                </div>
                              ) : (
                                'Send Reset Link'
                              )}
                          </Button>
                      </form>
                    </Form>
                </>
            )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
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
            
            <div className="relative z-10 mb-12">
                <h2 className="text-2xl font-bold mb-8">Secure Account Recovery:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    {[
                        "End-to-End Encryption",
                        "Instant Reset Link",
                        "24/7 Security Monitoring",
                        "Verified Identity"
                    ].map((perk, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-5 h-5 bg-[#EB5E4C] rounded flex items-center justify-center text-white shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                            <span className="text-white/80 font-medium text-sm">{perk}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Security Visuals */}
            <div className="relative h-[300px] w-full z-10 perspective-[1000px] flex items-center justify-center">
                {/* Main Security Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 w-64 h-64 flex flex-col items-center justify-center relative z-20"
                >
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 relative">
                        <Shield className="w-12 h-12 text-white" />
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8, type: "spring" }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-[#EB5E4C] rounded-full flex items-center justify-center border-4 border-[#1A3C34]"
                        >
                            <Check className="w-4 h-4 text-white stroke-[3]" />
                        </motion.div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white mb-1">Secure System</h3>
                        <p className="text-xs text-white/60">Your data is protected with enterprise-grade encryption</p>
                    </div>
                </motion.div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;