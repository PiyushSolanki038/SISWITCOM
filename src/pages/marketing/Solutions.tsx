import React, { useState } from 'react';
import {
  Check, Users, ShoppingCart, FileText, PenTool, ArrowRight,
  Plus, Filter, CheckCircle2, AlertCircle, Zap, Shield, Globe,
  BarChart3, Database, TrendingUp, ChevronRight, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const Solutions: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const solutions = [
    {
      id: 'crm',
      label: 'CRM',
      icon: Users,
      color: 'from-emerald-500 to-teal-400',
      borderColor: 'border-emerald-500/30',
      glowColor: 'rgba(16,185,129,0.15)',
      title: 'Customer Relationship Management',
      description: 'Manage your entire customer lifecycle from lead to loyal customer with our intuitive CRM. Track every interaction and close deals faster with AI-powered insights.',
      features: ['Account & contact management', 'Lead scoring and routing', 'Opportunity pipeline', 'Activity tracking', 'Email integration'],
      mockup: (
        <div className="w-full h-full bg-[#080C10] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Pipeline</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">12 Deals</span>
            </div>
            <div className="flex gap-2">
              <div className="p-1.5 bg-white/5 rounded-lg border border-white/10"><Filter size={12} className="text-slate-400" /></div>
              <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/30"><Plus size={12} className="text-emerald-400" /></div>
            </div>
          </div>
          <div className="flex gap-3 overflow-hidden flex-1">
            {[
              { label: 'New Leads', count: 3, deals: [{ name: 'Acme Corp', val: '$24K', color: 'bg-emerald-500' }, { name: 'Global Tech', val: '$12K', color: 'bg-cyan-500' }] },
              { label: 'Qualified', count: 2, deals: [{ name: 'Stark Ind', val: '$145K', color: 'bg-violet-500' }] },
              { label: 'Proposal', count: 4, deals: [{ name: 'Wayne Ent', val: '$89K', color: 'bg-orange-500' }] },
            ].map((col) => (
              <div key={col.label} className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{col.label}</span>
                  <span className="text-[10px] text-slate-600">{col.count}</span>
                </div>
                {col.deals.map((deal) => (
                  <div key={deal.name} className="bg-white/[0.04] border border-white/[0.06] p-2.5 rounded-xl space-y-1.5 hover:border-white/10 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="text-xs font-semibold text-white truncate">{deal.name}</div>
                      <div className={`w-2 h-2 rounded-full ${deal.color} flex-shrink-0 mt-0.5`} />
                    </div>
                    <div className="text-[10px] font-bold text-emerald-400">{deal.val}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'cpq',
      label: 'CPQ',
      icon: ShoppingCart,
      color: 'from-orange-500 to-amber-400',
      borderColor: 'border-orange-500/30',
      glowColor: 'rgba(249,115,22,0.15)',
      title: 'Configure, Price, Quote',
      description: 'Accelerate your quote-to-cash process with intelligent product configuration and pricing. Eliminate errors and generate professional quotes in seconds.',
      features: ['Product catalog management', 'Dynamic pricing rules', 'Quote generation', 'Approval workflows', 'Revenue recognition'],
      mockup: (
        <div className="w-full h-full bg-[#080C10] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">Quote #Q-2024-001</div>
              <div className="text-[10px] text-slate-500">Created Jan 15, 2024</div>
            </div>
            <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">Draft</span>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden flex-1">
            <div className="grid grid-cols-12 bg-white/[0.03] border-b border-white/[0.06] p-2 text-[10px] font-bold text-slate-500 uppercase">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Disc</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            <div className="p-2 space-y-1">
              {[['Enterprise License', '50', '10%', '$2,250'], ['Implementation', '1', '0%', '$5,000'], ['Premium Support', '12', '0%', '$1,200']].map(([name, qty, disc, total]) => (
                <div key={name} className="grid grid-cols-12 items-center text-xs py-2 border-b border-white/[0.04] last:border-0">
                  <div className="col-span-6 font-medium text-slate-300">{name}</div>
                  <div className="col-span-2 text-right text-slate-500">{qty}</div>
                  <div className="col-span-2 text-right text-slate-500">{disc}</div>
                  <div className="col-span-2 text-right font-bold text-white">{total}</div>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.03] p-3 border-t border-white/[0.06] flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">Grand Total</span>
              <span className="text-sm font-black text-emerald-400">$8,450.00</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'clm',
      label: 'CLM',
      icon: FileText,
      color: 'from-violet-500 to-purple-400',
      borderColor: 'border-violet-500/30',
      glowColor: 'rgba(139,92,246,0.15)',
      title: 'Contract Lifecycle Management',
      description: 'Streamline contract creation, negotiation, and execution with AI-powered CLM. Reduce risk and ensure compliance across all your agreements.',
      features: ['Template library', 'Clause management', 'Version control', 'Renewal automation', 'Compliance tracking'],
      mockup: (
        <div className="w-full h-full bg-[#080C10] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-violet-400 h-4 w-4" />
              <span className="font-bold text-white text-xs">MSA_Wayne_Enterprises.pdf</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#080C10]" />
                <div className="w-5 h-5 rounded-full bg-violet-500 border-2 border-[#080C10]" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">v2.4</span>
            </div>
          </div>
          <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 relative overflow-hidden">
            <div className="space-y-3">
              <div className="h-2 w-3/4 bg-white/10 rounded" />
              <div className="h-2 w-full bg-white/10 rounded" />
              <div className="h-2 w-5/6 bg-white/10 rounded" />
              <div className="relative p-3 bg-rose-950/40 rounded-xl border border-rose-500/20 mt-4">
                <div className="absolute -right-1.5 -top-1.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
                  <AlertCircle size={11} className="text-white" />
                </div>
                <p className="text-[10px] text-rose-400 font-bold mb-1">Clause 4.2: Liability Cap</p>
                <div className="h-1.5 w-full bg-rose-500/30 rounded mb-1" />
                <div className="h-1.5 w-2/3 bg-rose-500/30 rounded" />
              </div>
              <div className="h-2 w-full bg-white/10 rounded" />
              <div className="h-2 w-4/5 bg-white/10 rounded" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'esign',
      label: 'E-Sign',
      icon: PenTool,
      color: 'from-rose-500 to-pink-400',
      borderColor: 'border-rose-500/30',
      glowColor: 'rgba(244,63,94,0.15)',
      title: 'Enterprise E-Signature',
      description: 'Secure, legally binding electronic signatures with enterprise-grade security. Sign documents anywhere, anytime, on any device.',
      features: ['Multi-party signing', 'Audit trails', 'Identity verification', 'Mobile signing', 'API integration'],
      mockup: (
        <div className="w-full h-full bg-[#080C10] p-5 flex flex-col items-center justify-center gap-4">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 w-3/4 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="w-8 h-8 bg-white/5 rounded-lg" />
              <div className="text-[10px] text-slate-600">Doc ID: 8X92-22</div>
            </div>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-white/10 rounded" />
              <div className="h-1.5 w-full bg-white/10 rounded" />
              <div className="h-1.5 w-2/3 bg-white/10 rounded" />
            </div>
            <div className="border-2 border-dashed border-rose-500/30 bg-rose-500/5 rounded-xl p-4 relative">
              <div className="absolute -top-2.5 left-3 bg-[#080C10] px-2 text-[10px] font-bold text-rose-400">Sign Here</div>
              <div className="h-10 flex items-center justify-center">
                <svg className="w-24 h-10 text-rose-400" viewBox="0 0 100 50">
                  <path d="M10,40 Q30,10 50,25 T90,30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-[9px] text-slate-600 mt-1">John Doe · 15 Jan 2024 · 14:30 PM</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-semibold">Legally Binding · Encrypted</span>
          </div>
        </div>
      ),
    },
  ];

  const active = solutions[activeTab];

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
              <span className="text-emerald-400 text-sm font-semibold">Integrated Platform</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
              One Platform,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Endless Possibilities</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Connect your entire revenue process with our unified suite of tools. From lead generation to contract renewal, we've got you covered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ SOLUTIONS TABS ═══ */}
      <section className="pb-32 relative z-10">
        <div className="container px-4 mx-auto">
          {/* Tab nav */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {solutions.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === i
                    ? `bg-gradient-to-r ${s.color} text-white shadow-lg`
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </button>
            ))}
          </div>

          {/* Active solution panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto"
            >
              {/* Text */}
              <div className="space-y-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${active.color} bg-opacity-20 flex items-center justify-center shadow-lg`} style={{ background: `linear-gradient(135deg, ${active.glowColor}, transparent)`, border: `1px solid ${active.glowColor}` }}>
                  <active.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-white mb-4">{active.title}</h2>
                  <p className="text-lg text-slate-400 leading-relaxed">{active.description}</p>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {active.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Check size={11} strokeWidth={3} className="text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button className={`group h-12 px-6 rounded-full bg-gradient-to-r ${active.color} text-white border-0 font-bold transition-all hover:shadow-lg`}>
                    Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Mockup */}
              <div className={`relative aspect-[4/3] rounded-3xl border ${active.borderColor} overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)]`} style={{ boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 60px ${active.glowColor}` }}>
                <div className="absolute top-0 left-0 right-0 h-9 bg-[#0F1923] border-b border-white/[0.06] flex items-center px-4 gap-2 z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="pt-9 h-full">{active.mockup}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 bg-[#0A0F14] border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_60%)]" />
        <div className="container px-4 mx-auto relative z-10 text-center">
          <motion.div className="max-w-3xl mx-auto space-y-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl font-black text-white">Ready to transform your revenue engine?</h2>
            <p className="text-xl text-slate-400 leading-relaxed">Join thousands of high-growth companies using Sirius Infra to close more deals, faster.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="h-14 px-10 text-base font-bold rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white border-0 shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="h-14 px-10 text-base font-semibold rounded-full border border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Solutions;