import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Target, Shield, Zap, CheckCircle2, Trophy, Globe, Briefcase, Building2, TrendingUp, Database, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const values = [
    {
      title: 'Customer First',
      description: 'We build products that solve real problems for real businesses. Your success is our obsession.',
      icon: <Users className="w-6 h-6 text-[#1A3C34]" />,
    },
    {
      title: 'Innovation',
      description: 'Constantly pushing the boundaries of what enterprise software can do. We don\'t settle for status quo.',
      icon: <Zap className="w-6 h-6 text-[#EB5E4C]" />,
    },
    {
      title: 'Transparency',
      description: 'Clear communication and honest relationships. No hidden fees, no surprises, just trust.',
      icon: <Shield className="w-6 h-6 text-[#1A3C34]" />,
    },
    {
      title: 'Excellence',
      description: 'We hold ourselves to the highest standards in code, design, and support.',
      icon: <Target className="w-6 h-6 text-[#EB5E4C]" />,
    },
  ];

  const stats = [
    { value: '10K+', label: 'Global Customers', icon: <Users className="w-5 h-5" /> },
    { value: '50M+', label: 'Contracts Signed', icon: <Briefcase className="w-5 h-5" /> },
    { value: '99.9%', label: 'Uptime Guarantee', icon: <CheckCircle2 className="w-5 h-5" /> },
    { value: '150+', label: 'Countries Served', icon: <Globe className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
       {/* Hero Section */}
       <section className="relative pt-32 pb-20 overflow-hidden bg-[#F3F0EB]">
         {/* Abstract Background Elements */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#1A3C34]/5 blur-3xl"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#EB5E4C]/10 blur-3xl"></div>
         </div>

         <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="max-w-4xl mx-auto space-y-8"
           >
             <div className="flex justify-center">
               <Badge variant="outline" className="px-4 py-1.5 text-sm border-[#1A3C34]/20 bg-white text-[#1A3C34] rounded-full shadow-sm">
                 Our Mission
               </Badge>
             </div>
             
             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#1A3C34] leading-[1.1]">
               Transforming Revenue <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A3C34] to-[#EB5E4C]">
                 Operations
               </span>
             </h1>
             
             <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
               We're on a mission to unify the fragmented world of B2B sales tools. 
               One platform for CRM, CPQ, CLM, and E-Sign.
             </p>
           </motion.div>
         </div>
       </section>

       <div className="bg-white relative z-10">
        {/* Stats Strip */}
        <section className="container px-4 mx-auto -mt-12 mb-32 relative z-20">
           <div className="bg-[#1A3C34] rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-[#1A3C34]/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
                 {stats.map((stat, index) => (
                    <motion.div 
                       key={index}
                       initial={{ opacity: 0, y: 10 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: index * 0.1 }}
                       className="text-center px-4 pt-8 md:pt-0"
                    >
                       <div className="flex justify-center mb-4 text-[#EB5E4C]">
                          {stat.icon}
                       </div>
                       <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                       <div className="text-sm text-white/60 font-medium uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* Story Section */}
        <section className="container px-4 mx-auto mb-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A3C34] tracking-tight">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  Founded in 2020, Sirius Infra emerged from a simple observation: enterprise
                  sales teams were drowning in disconnected tools. Sales reps spent more time moving data between systems than actually selling.
                </p>
                <p>
                  Our founders, veterans of the enterprise software industry, set out to build something better. A single, unified platform that handles the entire deal lifecycle—from the first lead to the final signature.
                </p>
                <p>
                  Today, we power revenue operations for thousands of companies worldwide,
                  from fast-growing startups to Fortune 500 enterprises.
                </p>
              </div>
              <div className="pt-4">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#EB5E4C]/10 flex items-center justify-center font-bold text-[#EB5E4C]">
                       JD
                    </div>
                    <div>
                       <div className="font-bold text-[#1A3C34]">John Doe</div>
                       <div className="text-sm text-slate-500">Co-Founder & CEO</div>
                    </div>
                 </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
               <div className="absolute -inset-4 bg-gradient-to-r from-[#1A3C34]/5 to-[#EB5E4C]/5 rounded-[2rem] transform rotate-2"></div>
               <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden aspect-square flex items-center justify-center p-8">
                  <div className="grid grid-cols-2 gap-4 w-full">
                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-4">
                        <Building2 className="w-10 h-10 text-slate-400" />
                        <div className="h-2 w-16 bg-slate-200 rounded"></div>
                     </div>
                     <div className="bg-[#EB5E4C]/5 p-6 rounded-xl border border-[#EB5E4C]/10 flex flex-col items-center justify-center gap-4">
                        <Trophy className="w-10 h-10 text-[#EB5E4C]" />
                        <div className="h-2 w-16 bg-[#EB5E4C]/20 rounded"></div>
                     </div>
                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-4">
                        <Users className="w-10 h-10 text-slate-400" />
                        <div className="h-2 w-16 bg-slate-200 rounded"></div>
                     </div>
                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-4">
                        <Globe className="w-10 h-10 text-slate-400" />
                        <div className="h-2 w-16 bg-slate-200 rounded"></div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="container px-4 mx-auto mb-32">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-[#1A3C34] tracking-tight mb-4">Our Core Values</h2>
             <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                The principles that guide our product, our team, and our relationships.
             </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#1A3C34]/20 transition-all duration-300 bg-white rounded-2xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="p-3 bg-[#F3F0EB] rounded-xl w-fit">
                      {value.icon}
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-[#1A3C34] mb-2">{value.title}</h3>
                       <p className="text-slate-600 leading-relaxed text-sm">
                         {value.description}
                       </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Team CTA */}
        <section className="container px-4 mx-auto mb-20">
           <div className="bg-[#1A3C34] rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#EB5E4C] opacity-10 blur-[80px] rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 blur-[80px] rounded-full"></div>

              <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                 <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Want to join the mission?
                 </h2>
                 <p className="text-lg text-white/80 leading-relaxed">
                    We're always looking for talented individuals to help us build the future of enterprise software.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link to="/careers">
                       <Button size="lg" className="h-14 px-10 text-lg font-semibold bg-[#EB5E4C] hover:bg-[#d94a38] text-white w-full sm:w-auto rounded-full shadow-xl shadow-[#EB5E4C]/20 transition-transform hover:-translate-y-1">
                          View Open Positions
                       </Button>
                    </Link>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};

export default About;

