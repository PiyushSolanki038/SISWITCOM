import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Check, PieChart, TrendingUp, BarChart3, Activity, ArrowUpRight, Users, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(['employee', 'customer', 'admin', 'owner']),
});

type SignInFormValues = z.infer<typeof signInSchema>;

/**
 * SignIn Page
 * 
 * Handles user login functionality.
 * Users can sign in as 'Employee', 'Customer', 'Admin', or 'Owner'.
 * Includes a "Back to Home" button for easy navigation.
 */
const SignIn: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'employee',
    },
  });

  const { watch, setValue } = form;
  const role = watch('role');

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password, data.role);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      if (data.role === 'customer') {
        // Redirect customers to home page where the pricing modal will appear
        navigate('/', { replace: true });
      } else if (data.role === 'employee') {
        navigate('/employee-dashboard', { replace: true });
      } else if (data.role === 'owner') {
        navigate('/owner-dashboard', { replace: true });
      } else if (data.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = (error as Error).message || "Login failed";
      setError(errorMessage);
      
      // Show error popup/toast
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: (
          <div className="flex flex-col gap-1">
            <p>{errorMessage}</p>
            <p className="text-xs opacity-90">Tip: Ensure you selected the correct role ({data.role.charAt(0).toUpperCase() + data.role.slice(1)}).</p>
          </div>
        ),
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
                <h1 className="text-3xl font-bold text-[#1A3C34] mb-2">Welcome Back</h1>
                <p className="text-slate-500 text-sm">
                    Sign in to access your dashboard
                </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Role Selector - Enhanced Visuals */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-slate-700 mb-1.5 block">I am a...</label>
                    <Tabs value={role} onValueChange={(val) => setValue('role', val as SignInFormValues['role'])} className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 h-9">
                        <TabsTrigger value="employee" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#1A3C34] data-[state=active]:shadow-sm">Employee</TabsTrigger>
                        <TabsTrigger value="customer" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#1A3C34] data-[state=active]:shadow-sm">Customer</TabsTrigger>
                        <TabsTrigger value="admin" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#1A3C34] data-[state=active]:shadow-sm">Admin</TabsTrigger>
                        <TabsTrigger value="owner" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#1A3C34] data-[state=active]:shadow-sm">Owner</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

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
                          <AlertTitle>Login Failed</AlertTitle>
                          <AlertDescription>
                            {error}. Are you signing in as the correct role?
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
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
                                    placeholder="Password"
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

                  <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                          <Checkbox id="remember" className="h-4 w-4 border-slate-300 data-[state=checked]:bg-[#1A3C34] data-[state=checked]:border-[#1A3C34]" />
                          <label
                              htmlFor="remember"
                              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-500 cursor-pointer"
                          >
                              Remember me
                          </label>
                      </div>
                      <Link to="/forgot-password">
                          <Button variant="link" className="px-0 font-normal text-xs text-[#1A3C34] hover:no-underline hover:opacity-80 h-auto">
                              Forgot password?
                          </Button>
                      </Link>
                  </div>

                  <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-10 bg-[#1A3C34] hover:bg-[#122a25] text-white font-medium text-base rounded-lg shadow-md shadow-[#1A3C34]/20 transition-all transform hover:-translate-y-0.5"
                  >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        'Sign In'
                      )}
                  </Button>

                  {/* Social Login */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500 text-[10px]">Or continue with</span>
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
                      Don't have an account?{' '}
                      <Link to="/signup" className="font-semibold text-[#1A3C34] hover:underline">
                          Create an account
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
                      <BarChart3 className="w-8 h-8 text-[#EB5E4C]" />
                   </motion.div>
                   <motion.h2 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.3 }}
                     className="text-3xl font-bold mb-4 leading-tight"
                   >
                     Manage your infrastructure with precision
                   </motion.h2>
                   <motion.p 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.4 }}
                     className="text-white/70 text-lg leading-relaxed"
                   >
                     Access real-time insights, track performance, and optimize your workflows from one central hub.
                   </motion.p>
                </div>

                <div className="space-y-4">
                    {[
                        { icon: Activity, text: "Real-time monitoring & analytics" },
                        { icon: Users, text: "Collaborative team workspaces" },
                        { icon: PieChart, text: "Automated reporting tools" }
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
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 right-12 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-[200px]"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-xs font-medium">System Status</span>
                </div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-xs text-white/60">Uptime this month</div>
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
