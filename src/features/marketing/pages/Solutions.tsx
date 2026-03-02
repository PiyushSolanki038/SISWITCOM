import React from 'react';
import { 
  Check, 
  Users, 
  ShoppingCart, 
  FileText, 
  PenTool, 
  ArrowRight, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Shield,
  Globe,
  LayoutDashboard,
  BarChart3,
  Database,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const Solutions: React.FC = () => {
  const solutions = [
    {
      title: 'Customer Relationship Management',
      description: 'Manage your entire customer lifecycle from lead to loyal customer with our intuitive CRM. Track every interaction and close deals faster.',
      icon: <Users className="h-6 w-6 text-[#1A3C34]" />,
      color: 'bg-[#F3F0EB]',
      features: [
        'Account & contact management',
        'Lead scoring and routing',
        'Opportunity pipeline',
        'Activity tracking',
        'Email integration',
      ],
      mockup: (
        <div className="w-full h-full bg-slate-50 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#1A3C34]">Pipeline</h3>
              <Badge variant="secondary" className="bg-white text-[#1A3C34]">12 Opportunities</Badge>
            </div>
            <div className="flex gap-2">
               <div className="p-2 bg-white rounded-md shadow-sm border border-slate-200">
                 <Filter size={14} className="text-slate-500" />
               </div>
               <div className="p-2 bg-[#1A3C34] rounded-md shadow-sm text-white">
                 <Plus size={14} />
               </div>
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
             {/* Column 1 */}
             <div className="flex-1 min-w-[140px] flex flex-col gap-3">
               <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                 <span className="text-xs font-semibold text-slate-500 uppercase">New Leads</span>
                 <span className="text-xs font-medium text-slate-400">3</span>
               </div>
               <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 space-y-2 hover:shadow-md transition-shadow cursor-pointer">
                 <div className="flex justify-between items-start">
                   <div className="text-sm font-semibold text-slate-800">Acme Corp</div>
                   <div className="w-2 h-2 rounded-full bg-[#EB5E4C]" />
                 </div>
                 <div className="text-xs text-slate-500">$24,000</div>
                 <div className="flex items-center gap-1 mt-2">
                   <div className="w-5 h-5 rounded-full bg-[#EB5E4C]/10 text-[#EB5E4C] flex items-center justify-center text-[10px] font-bold">JD</div>
                 </div>
               </div>
               <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 space-y-2 hover:shadow-md transition-shadow cursor-pointer">
                 <div className="flex justify-between items-start">
                   <div className="text-sm font-semibold text-slate-800">Global Tech</div>
                   <div className="w-2 h-2 rounded-full bg-[#1A3C34]" />
                 </div>
                 <div className="text-xs text-slate-500">$12,500</div>
                 <div className="flex items-center gap-1 mt-2">
                   <div className="w-5 h-5 rounded-full bg-[#1A3C34]/10 text-[#1A3C34] flex items-center justify-center text-[10px] font-bold">AS</div>
                 </div>
               </div>
             </div>
             {/* Column 2 */}
             <div className="flex-1 min-w-[140px] flex flex-col gap-3">
               <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                 <span className="text-xs font-semibold text-slate-500 uppercase">Qualified</span>
                 <span className="text-xs font-medium text-slate-400">2</span>
               </div>
               <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 space-y-2 opacity-80">
                 <div className="flex justify-between items-start">
                   <div className="text-sm font-semibold text-slate-800">Stark Ind</div>
                   <div className="w-2 h-2 rounded-full bg-green-500" />
                 </div>
                 <div className="text-xs text-slate-500">$145,000</div>
                 <div className="flex items-center gap-1 mt-2">
                   <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">TS</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      )
    },
    {
      title: 'Configure, Price, Quote',
      description: 'Accelerate your quote-to-cash process with intelligent product configuration and pricing. Eliminate errors and generate professional quotes in seconds.',
      icon: <ShoppingCart className="h-6 w-6 text-[#1A3C34]" />,
      color: 'bg-[#F3F0EB]',
      features: [
        'Product catalog management',
        'Dynamic pricing rules',
        'Quote generation',
        'Approval workflows',
        'Revenue recognition',
      ],
      reverse: true,
      mockup: (
        <div className="w-full h-full bg-slate-50 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="font-bold text-[#1A3C34]">Quote #Q-2024-001</h3>
              <div className="text-xs text-slate-500">Created on Jan 15, 2024</div>
            </div>
            <Badge className="bg-[#EB5E4C]/10 text-[#EB5E4C] hover:bg-[#EB5E4C]/20 border-none">Draft</Badge>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex-1">
            <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 p-2 text-xs font-semibold text-slate-500">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Disc</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            <div className="p-2 space-y-2">
              <div className="grid grid-cols-12 items-center text-sm py-2 border-b border-slate-50">
                <div className="col-span-6 font-medium text-slate-700">Enterprise License</div>
                <div className="col-span-2 text-right text-slate-600">50</div>
                <div className="col-span-2 text-right text-slate-600">10%</div>
                <div className="col-span-2 text-right font-semibold text-slate-900">$2,250</div>
              </div>
              <div className="grid grid-cols-12 items-center text-sm py-2 border-b border-slate-50">
                <div className="col-span-6 font-medium text-slate-700">Implementation Pack</div>
                <div className="col-span-2 text-right text-slate-600">1</div>
                <div className="col-span-2 text-right text-slate-600">0%</div>
                <div className="col-span-2 text-right font-semibold text-slate-900">$5,000</div>
              </div>
              <div className="grid grid-cols-12 items-center text-sm py-2">
                <div className="col-span-6 font-medium text-slate-700">Premium Support</div>
                <div className="col-span-2 text-right text-slate-600">12</div>
                <div className="col-span-2 text-right text-slate-600">0%</div>
                <div className="col-span-2 text-right font-semibold text-slate-900">$1,200</div>
              </div>
            </div>
            <div className="bg-slate-50 p-3 border-t border-slate-200">
              <div className="flex justify-between items-center">
                 <span className="font-bold text-slate-700">Grand Total</span>
                 <span className="font-bold text-lg text-[#1A3C34]">$8,450.00</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Contract Lifecycle Management',
      description: 'Streamline contract creation, negotiation, and execution with AI-powered CLM. Reduce risk and ensure compliance across all your agreements.',
      icon: <FileText className="h-6 w-6 text-[#1A3C34]" />,
      color: 'bg-[#F3F0EB]',
      features: [
        'Template library',
        'Clause management',
        'Version control',
        'Renewal automation',
        'Compliance tracking',
      ],
      mockup: (
         <div className="w-full h-full bg-slate-50 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <FileText className="text-[#EB5E4C] h-5 w-5" />
                 <span className="font-bold text-[#1A3C34]">MSA_Wayne_Enterprises.pdf</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-[#1A3C34] border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-[#EB5E4C] border-2 border-white" />
                 </div>
                 <Badge variant="outline" className="bg-white">v2.4</Badge>
               </div>
            </div>
            
            <div className="flex-1 bg-white shadow-sm border border-slate-200 rounded-lg p-6 relative overflow-hidden">
               <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-5/6 bg-slate-100 rounded" />
                  
                  <div className="relative p-3 bg-red-50 rounded border border-red-100 mt-4">
                     <div className="absolute -right-2 -top-2 w-6 h-6 bg-[#EB5E4C] rounded-full flex items-center justify-center text-white shadow-sm">
                        <AlertCircle size={14} />
                     </div>
                     <p className="text-xs text-[#EB5E4C] font-medium mb-1">Clause 4.2: Liability Cap</p>
                     <div className="h-2 w-full bg-red-200 rounded mb-1" />
                     <div className="h-2 w-2/3 bg-red-200 rounded" />
                  </div>
                  
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-4/5 bg-slate-100 rounded" />
               </div>
            </div>
         </div>
      )
    },
    {
      title: 'Enterprise E-Signature',
      description: 'Secure, legally binding electronic signatures with enterprise-grade security. Sign documents anywhere, anytime, on any device.',
      icon: <PenTool className="h-6 w-6 text-[#1A3C34]" />,
      color: 'bg-[#F3F0EB]',
      features: [
        'Multi-party signing',
        'Audit trails',
        'Identity verification',
        'Mobile signing',
        'API integration',
      ],
      reverse: true,
      mockup: (
         <div className="w-full h-full bg-slate-50 p-6 flex flex-col items-center justify-center">
            <div className="bg-white w-3/4 aspect-[3/4] shadow-lg border border-slate-200 rounded-sm p-8 relative">
               <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                     <div className="w-8 h-8 bg-slate-100 rounded" />
                     <div className="text-[10px] text-slate-400">Doc ID: 8X92-22</div>
                  </div>
                  <div className="space-y-2">
                     <div className="h-2 w-full bg-slate-100 rounded" />
                     <div className="h-2 w-full bg-slate-100 rounded" />
                     <div className="h-2 w-2/3 bg-slate-100 rounded" />
                  </div>
                  <div className="space-y-2 pt-4">
                     <div className="h-2 w-full bg-slate-100 rounded" />
                     <div className="h-2 w-5/6 bg-slate-100 rounded" />
                  </div>
                  
                  <div className="mt-8 border-2 border-dashed border-[#1A3C34]/20 bg-[#1A3C34]/5 rounded-lg p-4 relative">
                     <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-[#1A3C34]">
                        Sign Here
                     </div>
                     <div className="h-12 flex items-center justify-center">
                        <svg className="w-24 h-12 text-[#1A3C34]" viewBox="0 0 100 50">
                           <path d="M10,40 Q30,10 50,25 T90,30" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                     </div>
                     <div className="text-[10px] text-slate-400 mt-2">John Doe • 15 Jan 2024 • 14:30 PM</div>
                  </div>
               </div>
            </div>
         </div>
      )
    },
  ];

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
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="px-4 py-1.5 text-sm border-[#1A3C34]/20 bg-white text-[#1A3C34] rounded-full mb-6 shadow-sm">
                Integrated Platform
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#1A3C34] mb-6 leading-tight">
                One Platform, <br/><span className="text-[#EB5E4C]">Endless Possibilities</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Connect your entire revenue process with our unified suite of tools. From lead generation to contract renewal, we've got you covered.
              </p>
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

      {/* Solutions List */}
      <div className="relative z-10 py-20 bg-white">
        <div className="container px-4 mx-auto space-y-32">
        {solutions.map((solution, index) => (
          <motion.div
            key={solution.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`flex flex-col md:flex-row items-center gap-12 lg:gap-24 ${
              solution.reverse ? 'md:flex-row-reverse' : ''
            }`}
          >
            {/* Text Content */}
            <div className="flex-1 space-y-8">
              <div className={`w-14 h-14 rounded-2xl ${solution.color} flex items-center justify-center mb-6 shadow-sm`}>
                {solution.icon}
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-[#1A3C34]">{solution.title}</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {solution.description}
                </p>
              </div>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                {solution.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1A3C34]/10 text-[#1A3C34] flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="font-medium text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4">
                <Link to="/signup">
                  <Button variant="outline" className="group h-12 px-6 rounded-full border-slate-200 hover:border-[#1A3C34]/30 hover:bg-[#1A3C34]/5 text-[#1A3C34] font-semibold transition-all">
                    Learn more <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Mockup Visualization */}
            <div className="flex-1 w-full">
              <div className="relative aspect-square md:aspect-[4/3] rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50 group hover:shadow-3xl hover:shadow-slate-300/50 transition-all duration-500">
                 {/* Window Controls */}
                 <div className="absolute top-0 left-0 right-0 h-10 bg-white border-b border-slate-100 flex items-center px-4 gap-2 z-10">
                    <div className="w-3 h-3 rounded-full bg-slate-200 group-hover:bg-red-400 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-slate-200 group-hover:bg-amber-400 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-slate-200 group-hover:bg-green-400 transition-colors" />
                 </div>
                 <div className="pt-10 h-full">
                    {solution.mockup}
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      </div>

      {/* CTA Section */}
      <section className="py-24 bg-[#F8F9FA] relative overflow-hidden">
         {/* Decorative background elements */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#1A3C34]/5 blur-3xl"></div>
            <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#EB5E4C]/5 blur-3xl"></div>
         </div>

        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A3C34]">
              Ready to transform your revenue engine?
            </h2>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Join thousands of high-growth companies using Sirius Infra to close more deals, faster. 
              Start your 14-day free trial today.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button size="lg" className="h-14 px-10 text-lg font-semibold rounded-full bg-[#1A3C34] text-white hover:bg-[#122a25] shadow-xl shadow-[#1A3C34]/20 transition-all transform hover:-translate-y-1">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-semibold rounded-full border-2 border-[#1A3C34]/10 text-[#1A3C34] hover:bg-[#1A3C34]/5">
                  Talk to Sales
                </Button>
              </Link>
            </div>
            
            <div className="pt-8 mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#EB5E4C]" /> No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#EB5E4C]" /> 14-day free trial
              </div>
              <div className="flex items-center gap-2">
                 <CheckCircle2 size={18} className="text-[#EB5E4C]" /> Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Solutions;

