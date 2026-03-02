import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, ArrowRight, Sparkles, Users, Heart, Zap, Globe, Coffee, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Careers: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const departments = ['All', 'Engineering', 'Product', 'Sales', 'Design', 'Operations'];

  const jobs = [
    { title: 'Senior Full-Stack Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time', badge: 'Hot', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { title: 'Product Manager — CRM', dept: 'Product', location: 'San Francisco, CA', type: 'Full-time', badge: null, badgeColor: '' },
    { title: 'Enterprise Account Executive', dept: 'Sales', location: 'New York, NY', type: 'Full-time', badge: 'Urgent', badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { title: 'Lead Product Designer', dept: 'Design', location: 'Remote', type: 'Full-time', badge: null, badgeColor: '' },
    { title: 'DevOps Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time', badge: null, badgeColor: '' },
    { title: 'Sales Development Representative', dept: 'Sales', location: 'Austin, TX', type: 'Full-time', badge: 'New', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { title: 'Customer Success Manager', dept: 'Operations', location: 'Remote', type: 'Full-time', badge: null, badgeColor: '' },
    { title: 'Frontend Engineer (React)', dept: 'Engineering', location: 'Remote', type: 'Full-time', badge: 'Hot', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  ];

  const perks = [
    { icon: Globe, title: 'Remote First', desc: 'Work from anywhere in the world. We have team members in 20+ countries.', color: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/20', iconColor: 'text-cyan-400' },
    { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive health, dental, and vision coverage for you and your family.', color: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/20', iconColor: 'text-rose-400' },
    { icon: TrendingUp, title: 'Equity Package', desc: 'Competitive equity grants so you own a piece of what you\'re building.', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20', iconColor: 'text-emerald-400' },
    { icon: Coffee, title: 'Unlimited PTO', desc: 'Take the time you need to recharge. We trust you to manage your time.', color: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/20', iconColor: 'text-amber-400' },
    { icon: Zap, title: 'Learning Budget', desc: '$2,000/year for courses, conferences, books, and professional development.', color: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/20', iconColor: 'text-violet-400' },
    { icon: Users, title: 'Team Retreats', desc: 'Annual all-hands retreats in amazing locations around the world.', color: 'from-orange-500/20 to-red-500/10', border: 'border-orange-500/20', iconColor: 'text-orange-400' },
  ];

  const filtered = jobs.filter(j => activeFilter === 'All' || j.dept === activeFilter);

  return (
    <div className="flex flex-col min-h-screen bg-[#080C10] overflow-hidden">

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">We're Hiring</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
              Build the Future of
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Revenue Operations</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Join a team of builders, dreamers, and problem-solvers on a mission to transform how the world's best companies sell.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              {[['20+', 'Countries'], ['150+', 'Team Members'], ['4.9/5', 'Glassdoor Rating']].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black text-white">{val}</div>
                  <div className="text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ PERKS ═══ */}
      <section className="pb-24 relative z-10">
        <div className="container px-4 mx-auto">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black text-white mb-4">Why Sirius Infra?</h2>
            <p className="text-slate-400 text-lg">We invest in our people as much as our product.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.title}
                className={`group bg-gradient-to-br ${perk.color} border ${perk.border} rounded-3xl p-7 hover:scale-[1.02] transition-all duration-500`}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-white/5 border ${perk.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <perk.icon className={`h-6 w-6 ${perk.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{perk.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OPEN ROLES ═══ */}
      <section className="py-24 bg-[#0A0F14] border-t border-white/5">
        <div className="container px-4 mx-auto">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black text-white mb-4">Open Positions</h2>
            <p className="text-slate-400 text-lg">{jobs.length} open roles across {departments.length - 1} departments</p>
          </motion.div>

          {/* Department filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setActiveFilter(dept)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeFilter === dept
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-slate-500 border border-white/[0.08] hover:text-white hover:bg-white/10'
                  }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Job listings */}
          <div className="max-w-4xl mx-auto space-y-3">
            {filtered.map((job, i) => (
              <motion.div
                key={job.title}
                className="group flex items-center justify-between bg-[#0F1923]/80 border border-white/[0.06] rounded-2xl p-5 hover:border-emerald-500/20 hover:bg-[#0F1923] transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white group-hover:text-emerald-300 transition-colors">{job.title}</h3>
                      {job.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${job.badgeColor}`}>{job.badge}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.dept}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Button size="sm" variant="outline" className="hidden sm:flex border-white/10 text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/20 rounded-xl font-semibold transition-all">
                    Apply Now <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No open roles in this department</p>
              <p className="text-sm mt-1">Check back soon or send us a general application.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-slate-500 mb-4">Don't see a role that fits? We'd still love to hear from you.</p>
            <Link to="/contact">
              <Button variant="outline" className="h-12 px-8 rounded-full border-white/10 text-white hover:bg-white/5 hover:border-white/20 font-semibold transition-all">
                Send General Application <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;
