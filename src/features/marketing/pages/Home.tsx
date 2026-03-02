import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  FileText,
  ShoppingCart,
  PenTool,
  Building2,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
  LayoutDashboard,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  MessageSquare,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Home Page (Marketing)
 * 
 * The main landing page for the public website.
 * Features a hero section with abstract visuals and call-to-action buttons.
 */
const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('loginSuccess') === 'true') {
      setShowLoginSuccess(true);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('loginSuccess');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-[#F3F0EB]">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#1A3C34]/5 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#EB5E4C]/10 blur-3xl"></div>
          <div className="absolute top-[20%] left-[15%] w-64 h-64 rounded-full bg-blue-400/10 blur-3xl"></div>
        </div>

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column: Content */}
            <motion.div 
              className="flex flex-col items-start text-left space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge variant="outline" className="px-4 py-2 text-sm border-[#1A3C34]/20 bg-white text-[#1A3C34] rounded-full shadow-sm mb-4">
                  <span className="mr-2 flex h-2 w-2 rounded-full bg-[#EB5E4C]"></span> 
                  The Future of Business Management
                </Badge>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1A3C34] leading-[1.1]">
                Unified Control <br />
                <span className="relative inline-block">
                  <span className="relative z-10">For Your Growth</span>
                  <motion.div 
                    className="absolute bottom-2 left-0 w-full h-4 bg-[#EB5E4C]/20 -rotate-1 z-0"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  ></motion.div>
                </span>
              </h1>

              <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
                Stop juggling multiple tools. Experience the power of a single, intelligent platform for CRM, CPQ, and Analytics.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-[#1A3C34] hover:bg-[#122a25] text-white shadow-xl shadow-[#1A3C34]/20 transition-all duration-300 transform hover:-translate-y-1">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/solutions" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-2 border-[#1A3C34]/10 text-[#1A3C34] hover:bg-[#1A3C34]/5">
                    View Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-6 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#EB5E4C]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#EB5E4C]" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Visuals */}
            <motion.div 
              className="relative h-[600px] w-full hidden lg:block perspective-[2000px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Main Dashboard Card */}
              <motion.div 
                className="absolute top-10 left-10 right-0 bottom-20 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10"
                initial={{ rotateY: -10, rotateX: 5, z: -50 }}
                animate={{ rotateY: -5, rotateX: 2, z: 0 }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  ease: "easeInOut" 
                }}
              >
                {/* Mock Header */}
                <div className="h-14 border-b bg-slate-50/50 flex items-center justify-between px-6">
                   <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-400"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                     <div className="w-3 h-3 rounded-full bg-green-400"></div>
                   </div>
                   <div className="h-2 w-32 bg-slate-200 rounded-full"></div>
                </div>
                
                <div className="p-6 grid grid-cols-3 gap-6 h-full bg-slate-50/30">
                   {/* Sidebar */}
                   <div className="col-span-1 space-y-4">
                      <div className="h-24 bg-white rounded-xl shadow-sm p-4">
                        <div className="h-2 w-16 bg-slate-200 rounded mb-4"></div>
                        <div className="h-8 w-24 bg-[#1A3C34]/10 rounded"></div>
                      </div>
                      <div className="h-40 bg-white rounded-xl shadow-sm p-4">
                        <div className="h-2 w-20 bg-slate-200 rounded mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-slate-100 rounded"></div>
                          <div className="h-2 w-4/5 bg-slate-100 rounded"></div>
                          <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                   </div>
                   {/* Main Area */}
                   <div className="col-span-2 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="h-24 bg-[#1A3C34] rounded-xl shadow-lg p-4 text-white">
                            <TrendingUp className="h-6 w-6 mb-2 opacity-80" />
                            <div className="text-2xl font-bold">$24,500</div>
                            <div className="text-xs opacity-60">Total Revenue</div>
                         </div>
                         <div className="h-24 bg-white rounded-xl shadow-sm p-4 border border-slate-100">
                            <Users className="h-6 w-6 mb-2 text-[#EB5E4C]" />
                            <div className="text-2xl font-bold text-slate-800">1,240</div>
                            <div className="text-xs text-slate-500">Active Users</div>
                         </div>
                      </div>
                      <div className="h-48 bg-white rounded-xl shadow-sm border border-slate-100 p-4 relative overflow-hidden">
                         <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-between px-4 pb-4 gap-2">
                            {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                              <div key={i} className="w-full bg-[#1A3C34]/10 rounded-t-sm relative group overflow-hidden">
                                <motion.div 
                                  className="absolute bottom-0 left-0 right-0 bg-[#1A3C34] rounded-t-sm"
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h}%` }}
                                  transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                ></motion.div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>

              {/* Floating Element 1 (Top Right) */}
              <motion.div 
                className="absolute top-0 right-0 bg-white p-4 rounded-xl shadow-xl border border-slate-100 z-20 w-48"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                       <CheckCircle2 size={16} />
                    </div>
                    <div>
                       <div className="text-xs font-bold text-slate-700">Task Complete</div>
                       <div className="text-[10px] text-slate-400">Just now</div>
                    </div>
                 </div>
              </motion.div>

              {/* Floating Element 2 (Bottom Left) */}
              <motion.div 
                className="absolute bottom-10 -left-10 bg-white p-4 rounded-xl shadow-xl border border-slate-100 z-30 w-56"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700">Team Performance</span>
                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
                 </div>
                 <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          U{i}
                       </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-[#1A3C34] text-white flex items-center justify-center text-[10px]">
                       +5
                    </div>
                 </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y bg-white overflow-hidden">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-10">
            Trusted by innovative teams worldwide
          </p>
          
          <div className="relative flex overflow-hidden mask-gradient">
            <style>{`
              .mask-gradient {
                mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
              }
            `}</style>
            
            <motion.div 
              className="flex gap-20 items-center flex-nowrap whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ 
                duration: 40, 
                ease: "linear", 
                repeat: Infinity 
              }}
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-20 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  {[
                    { name: 'Acme Corp', font: 'font-serif', icon: Globe },
                    { name: 'Global Tech', font: 'font-mono', icon: Zap },
                    { name: 'Nebula Inc', font: 'font-sans tracking-widest', icon: Users },
                    { name: 'FastScale', font: 'italic font-bold', icon: TrendingUp },
                    { name: 'Trio Systems', font: 'font-serif font-light', icon: Database },
                    { name: 'Vortex AI', font: 'font-mono tracking-tighter', icon: Shield },
                    { name: 'BrightPath', font: 'font-sans font-black', icon: CheckCircle2 },
                    { name: 'Quantum', font: 'font-serif italic', icon: LayoutDashboard }
                  ].map((company, index) => (
                    <div 
                      key={`${i}-${index}`} 
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <company.icon className="h-6 w-6 text-[#1A3C34]" />
                      <span className={`text-2xl font-bold text-slate-700 ${company.font}`}>
                        {company.name}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid - Bento Style */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4 border-[#1A3C34]/20 bg-white text-[#1A3C34] px-4 py-1 rounded-full text-sm font-medium shadow-sm">
                Powerful Capabilities
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1A3C34]">
                Everything You Need to Scale
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                A complete revenue operations platform that grows with your business, 
                connecting every stage of the deal cycle.
              </p>
            </motion.div>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Feature 1: CRM (Large) */}
            <motion.div 
              className="md:col-span-2 group relative p-8 md:p-10 bg-white rounded-[2rem] border border-slate-200 hover:border-[#1A3C34]/20 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col justify-between"
              variants={itemVariants}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#1A3C34]/5 to-transparent rounded-bl-[10rem] -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#F3F0EB] flex items-center justify-center mb-6 group-hover:bg-[#1A3C34] transition-colors duration-300">
                  <Users className="h-7 w-7 text-[#1A3C34] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-[#1A3C34]">CRM</h3>
                <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                  Manage accounts, contacts, leads, and opportunities with a modern, intuitive pipeline view that puts your data to work.
                </p>
              </div>
              <div className="relative z-10 mt-8">
                 <div className="flex items-center text-[#EB5E4C] font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Explore CRM <ArrowRight className="ml-2 h-5 w-5" />
                 </div>
              </div>
            </motion.div>

            {/* Feature 2: CPQ */}
            <motion.div 
              className="group relative p-8 bg-white rounded-[2rem] border border-slate-200 hover:border-[#1A3C34]/20 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col"
              variants={itemVariants}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F3F0EB] flex items-center justify-center mb-6 group-hover:bg-[#1A3C34] transition-colors duration-300">
                <ShoppingCart className="h-7 w-7 text-[#1A3C34] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#1A3C34]">CPQ</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Configure, price, and quote products with automated workflows.
              </p>
            </motion.div>

            {/* Feature 3: CLM */}
            <motion.div 
              className="group relative p-8 bg-white rounded-[2rem] border border-slate-200 hover:border-[#1A3C34]/20 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col"
              variants={itemVariants}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F3F0EB] flex items-center justify-center mb-6 group-hover:bg-[#1A3C34] transition-colors duration-300">
                <FileText className="h-7 w-7 text-[#1A3C34] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#1A3C34]">CLM</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Automate contract creation, approvals, and renewals with full visibility into every agreement.
              </p>
            </motion.div>

            {/* Feature 4: Collaboration */}
            <motion.div 
              className="group relative p-8 bg-white rounded-[2rem] border border-slate-200 hover:border-[#1A3C34]/20 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col md:col-span-2"
              variants={itemVariants}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F3F0EB] flex items-center justify-center mb-6 group-hover:bg-[#1A3C34] transition-colors duration-300">
                <MessageSquare className="h-7 w-7 text-[#1A3C34] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#1A3C34]">Collaboration & Automation</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Simplify handoffs between sales, legal, and finance teams with shared context and automated workflows.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="rounded-full border-[#1A3C34]/20 text-xs">Approvals</Badge>
                <Badge variant="outline" className="rounded-full border-[#1A3C34]/20 text-xs">Playbooks</Badge>
                <Badge variant="outline" className="rounded-full border-[#1A3C34]/20 text-xs">Notifications</Badge>
                <Badge variant="outline" className="rounded-full border-[#1A3C34]/20 text-xs">Integrations</Badge>
              </div>
            </motion.div>

            {/* Feature 5: Analytics */}
            <motion.div 
              className="group relative p-8 bg-[#1A3C34] rounded-[2rem] border border-slate-200/20 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col text-white"
              variants={itemVariants}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white transition-colors duration-300">
                <BarChart3 className="h-7 w-7 text-white group-hover:text-[#1A3C34] transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Revenue Intelligence</h3>
              <p className="text-slate-100/90 leading-relaxed mb-6">
                Spot trends, forecast accurately, and make data-backed decisions with live dashboards.
              </p>
            </motion.div>

            {/* Feature 6: Security */}
            <motion.div 
              className="group relative p-8 bg-white rounded-[2rem] border border-slate-200 hover:border-[#1A3C34]/20 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col"
              variants={itemVariants}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F3F0EB] flex items-center justify-center mb-6 group-hover:bg-[#1A3C34] transition-colors duration-300">
                <Shield className="h-7 w-7 text-[#1A3C34] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#1A3C34]">Enterprise-Grade Security</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                SOC2-ready controls, granular permissions, and audit trails for every interaction.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1A3C34] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_#ffffff,_transparent_50%),radial-gradient(circle_at_bottom,_#EB5E4C,_transparent_50%)]"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="grid md:grid-cols-[2fr,1.5fr] gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Ready to unify your revenue operations?
              </h2>
              <p className="text-lg text-slate-100/90 mb-6">
                Start a free trial or talk to our team to see how Sirius can fit into your existing stack.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="rounded-full bg-white text-[#1A3C34] hover:bg-slate-100">
                    Start free trial
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10">
                    Talk to sales
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <LayoutDashboard className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-100/80">Platform Uptime</div>
                    <div className="text-xl font-bold">99.99%</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 rounded-full px-3 py-1 text-xs">
                  Live Status
                </Badge>
              </div>
              <div className="space-y-3 text-sm text-slate-100/90">
                <div className="flex justify-between">
                  <span>Average implementation time</span>
                  <span className="font-semibold">4-6 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Average ROI in year one</span>
                  <span className="font-semibold">+172%</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer satisfaction</span>
                  <span className="font-semibold">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

