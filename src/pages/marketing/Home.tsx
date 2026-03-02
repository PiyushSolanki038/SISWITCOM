import React, { useState, useEffect, useRef } from 'react';
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
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Database,
  Sparkles,
  Star,
  Play,
  ChevronRight,
  Activity,
  Lock,
  Cpu,
  Layers,
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

/* ─── Animated Mesh Gradient Background ─── */
const MeshBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-400/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
    <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-orange-500/15 via-rose-400/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-400/10 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
    {/* Grid overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
    {/* Noise texture */}
    <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />
  </div>
);

/* ─── Floating Particle ─── */
const Particle: React.FC<{ delay: number; x: number; size: number }> = ({ delay, x, size }) => (
  <motion.div
    className="absolute bottom-0 rounded-full bg-emerald-400/30"
    style={{ left: `${x}%`, width: size, height: size }}
    animate={{ y: [0, -800], opacity: [0, 0.8, 0] }}
    transition={{ duration: 8 + Math.random() * 4, delay, repeat: Infinity, ease: 'linear' }}
  />
);

/* ─── 3D Tilt Card ─── */
const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Animated Counter ─── */
const Counter: React.FC<{ target: string; label: string; icon: React.ReactNode }> = ({ target, label, icon }) => {
  const [count, setCount] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    const suffix = target.replace(/[0-9.]/g, '');
    let start = 0;
    const step = num / 60;
    const timer = setInterval(() => {
      start = Math.min(start + step, num);
      setCount(start >= num ? target : `${Math.floor(start)}${suffix}`);
      if (start >= num) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className="text-center group">
      <div className="flex justify-center mb-3 text-emerald-400 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div className="text-4xl font-black text-white mb-1 tabular-nums">{count}</div>
      <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
};

/* ─── Main Component ─── */
const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (searchParams.get('loginSuccess') === 'true') {
      setShowLoginSuccess(true);
      const p = new URLSearchParams(searchParams);
      p.delete('loginSuccess');
      setSearchParams(p, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const features = [
    { icon: Users, label: 'CRM', color: 'from-emerald-500 to-teal-400', desc: 'Manage every customer relationship with intelligent pipeline tracking and AI-powered lead scoring.' },
    { icon: ShoppingCart, label: 'CPQ', color: 'from-orange-500 to-amber-400', desc: 'Configure, price, and quote in seconds. Eliminate errors with automated approval workflows.' },
    { icon: FileText, label: 'CLM', color: 'from-violet-500 to-purple-400', desc: 'Create, negotiate, and execute contracts with AI-assisted clause management and compliance.' },
    { icon: PenTool, label: 'E-Sign', color: 'from-rose-500 to-pink-400', desc: 'Legally binding e-signatures with enterprise-grade security, audit trails, and mobile support.' },
    { icon: BarChart3, label: 'Analytics', color: 'from-cyan-500 to-blue-400', desc: 'Real-time dashboards and AI-driven insights to accelerate data-informed decisions.' },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'VP Sales, Acme Corp', quote: 'Sirius Infra cut our quote-to-cash cycle by 60%. The automation is simply unmatched.', avatar: 'SC', rating: 5 },
    { name: 'Marcus Reid', role: 'CRO, FastScale', quote: 'We replaced 4 tools with one platform. Our team is more productive than ever before.', avatar: 'MR', rating: 5 },
    { name: 'Priya Sharma', role: 'Head of RevOps, Nebula', quote: 'The analytics dashboard alone is worth it. We finally have full pipeline visibility.', avatar: 'PS', rating: 5 },
  ];

  const particles = Array.from({ length: 12 }, (_, i) => ({
    delay: i * 0.8,
    x: (i * 8.5) % 100,
    size: 3 + (i % 4) * 2,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[#080C10] overflow-hidden">

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Dark with animated mesh + particles
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        <MeshBackground />
        {particles.map((p, i) => <Particle key={i} {...p} />)}

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Pill badge */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-emerald-400 text-sm font-semibold">Now with AI-Powered Insights</span>
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                </div>
              </motion.div>

              {/* Headline */}
              <div className="space-y-4">
                <motion.h1
                  className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] text-white"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  Revenue
                  <br />
                  <span className="relative">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                      Unified.
                    </span>
                    <motion.div
                      className="absolute -bottom-2 left-0 h-[3px] bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 1, duration: 0.8 }}
                    />
                  </span>
                  <br />
                  <span className="text-slate-400">Amplified.</span>
                </motion.h1>
              </div>

              <motion.p
                className="text-xl text-slate-400 leading-relaxed max-w-lg"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              >
                One intelligent platform for CRM, CPQ, CLM, E-Sign, and Analytics.
                Stop juggling tools — start closing deals.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              >
                <Link to="/signup">
                  <Button size="lg" className="group relative h-14 px-8 text-base font-bold rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white border-0 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all duration-300 overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      Start Free Trial
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="group h-14 px-8 text-base font-semibold rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Watch Demo
                </Button>
              </motion.div>

              {/* Trust signals */}
              <motion.div
                className="flex flex-wrap items-center gap-6 pt-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              >
                {['No credit card', '14-day free trial', 'Cancel anytime'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>{t}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: 3D Dashboard Mockup */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard className="relative">
                {/* Glow behind card */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl rounded-3xl scale-110" />

                {/* Main dashboard card */}
                <div className="relative bg-[#0F1923]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                  {/* Window bar */}
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <div className="flex-1 mx-4 h-6 bg-white/5 rounded-md flex items-center px-3">
                      <span className="text-[10px] text-slate-500">app.siriusinfra.com/dashboard</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Stat cards row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Revenue', value: '$2.4M', change: '+18%', color: 'text-emerald-400' },
                        { label: 'Deals Won', value: '142', change: '+24%', color: 'text-cyan-400' },
                        { label: 'Avg. Cycle', value: '12d', change: '-30%', color: 'text-violet-400' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                        >
                          <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                          <div className="text-xl font-bold text-white">{stat.value}</div>
                          <div className={`text-xs font-semibold ${stat.color}`}>{stat.change}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Chart area */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-slate-400">Pipeline Revenue</span>
                        <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Live</span>
                      </div>
                      <div className="flex items-end gap-2 h-24">
                        {[35, 55, 40, 75, 60, 90, 70, 85, 65, 95, 80, 100].map((h, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 rounded-t-sm relative overflow-hidden"
                            style={{ height: `${h}%` }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 1 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/60 to-emerald-400/20 rounded-t-sm" />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Pipeline rows */}
                    <div className="space-y-2">
                      {[
                        { name: 'Acme Enterprise', stage: 'Proposal', value: '$145K', pct: 80 },
                        { name: 'Global Tech Inc', stage: 'Negotiation', value: '$89K', pct: 60 },
                        { name: 'Stark Industries', stage: 'Qualified', value: '$220K', pct: 40 },
                      ].map((deal, i) => (
                        <motion.div
                          key={deal.name}
                          className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-2.5 border border-white/[0.04]"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + i * 0.1 }}
                        >
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                            {deal.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{deal.name}</div>
                            <div className="w-full bg-white/5 rounded-full h-1 mt-1">
                              <motion.div
                                className="h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${deal.pct}%` }}
                                transition={{ delay: 1.4 + i * 0.1, duration: 0.6 }}
                              />
                            </div>
                          </div>
                          <div className="text-xs font-bold text-emerald-400">{deal.value}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating notification cards */}
                <motion.div
                  className="absolute -top-6 -right-6 bg-[#0F1923]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl w-52"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Deal Closed!</div>
                      <div className="text-[10px] text-slate-400">Acme Corp · $145K</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 bg-[#0F1923]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl w-56"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">AI Scoring</span>
                  </div>
                  <div className="flex gap-1">
                    {[90, 75, 85, 60, 95].map((v, i) => (
                      <div key={i} className="flex-1 bg-white/5 rounded-sm overflow-hidden h-6">
                        <motion.div
                          className="w-full bg-gradient-to-t from-cyan-500/60 to-cyan-400/20 rounded-sm"
                          style={{ height: `${v}%` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${v}%` }}
                          transition={{ delay: 1.5 + i * 0.1 }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </TiltCard>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-emerald-400/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LOGO MARQUEE
      ═══════════════════════════════════════════════════════ */}
      <section className="py-14 border-y border-white/5 bg-[#0A0F14] overflow-hidden">
        <div className="container px-4 mx-auto mb-8 text-center">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.3em]">Trusted by 10,000+ companies worldwide</p>
        </div>
        <div className="relative flex overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
          <motion.div
            className="flex gap-16 items-center flex-nowrap whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-16 items-center">
                {[
                  { name: 'Acme Corp', icon: Globe },
                  { name: 'Global Tech', icon: Zap },
                  { name: 'Nebula Inc', icon: Users },
                  { name: 'FastScale', icon: TrendingUp },
                  { name: 'Trio Systems', icon: Database },
                  { name: 'Vortex AI', icon: Shield },
                  { name: 'BrightPath', icon: Cpu },
                  { name: 'Quantum', icon: Layers },
                ].map((company, j) => (
                  <div key={`${i}-${j}`} className="flex items-center gap-2.5 opacity-30 hover:opacity-70 transition-opacity duration-300 cursor-pointer group">
                    <company.icon className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    <span className="text-xl font-bold text-slate-400 group-hover:text-white transition-colors tracking-tight">{company.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — Interactive Bento Grid
      ═══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-[#080C10] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">Powerful Capabilities</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
              Everything to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"> scale revenue</span>
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed">
              A complete revenue operations platform connecting every stage of your deal cycle.
            </p>
          </motion.div>

          {/* Feature tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {features.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setActiveFeature(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeFeature === i
                    ? 'bg-gradient-to-r ' + f.color + ' text-white shadow-lg'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <f.icon className="h-4 w-4" />
                {f.label}
              </button>
            ))}
          </div>

          {/* Active feature panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <p className="text-lg text-slate-300 leading-relaxed">{features[activeFeature].desc}</p>
            </motion.div>
          </AnimatePresence>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(220px,auto)]">
            {/* Large card — CRM */}
            <motion.div
              className="md:col-span-2 group relative bg-gradient-to-br from-[#0F1923] to-[#0A1218] border border-white/[0.06] rounded-3xl p-8 overflow-hidden hover:border-emerald-500/30 transition-all duration-500 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">CRM</h3>
                <p className="text-slate-400 leading-relaxed max-w-md">Manage accounts, contacts, leads, and opportunities with an AI-powered pipeline that puts your data to work.</p>
                <div className="flex items-center gap-2 mt-6 text-emerald-400 font-semibold text-sm group-hover:gap-3 transition-all">
                  Explore CRM <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* CPQ */}
            <motion.div
              className="group relative bg-gradient-to-br from-[#0F1923] to-[#0A1218] border border-white/[0.06] rounded-3xl p-8 overflow-hidden hover:border-orange-500/30 transition-all duration-500 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all duration-700" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">CPQ</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Configure, price, and quote with automated workflows and approval chains.</p>
              </div>
            </motion.div>

            {/* CLM */}
            <motion.div
              className="group relative bg-gradient-to-br from-[#0F1923] to-[#0A1218] border border-white/[0.06] rounded-3xl p-8 overflow-hidden hover:border-violet-500/30 transition-all duration-500 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-all duration-700" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">CLM</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Create, negotiate, and manage contracts with AI-assisted clause management.</p>
              </div>
            </motion.div>

            {/* Analytics — Large dark card */}
            <motion.div
              className="md:col-span-2 group relative bg-gradient-to-br from-emerald-950/50 to-[#080C10] border border-emerald-500/20 rounded-3xl p-8 overflow-hidden hover:border-emerald-500/40 transition-all duration-500 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.1)_0%,transparent_60%)]" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Advanced Analytics</h3>
                <p className="text-slate-300 leading-relaxed max-w-md">Real-time dashboards and AI-driven insights to help you make data-informed decisions faster than ever before.</p>
                <div className="flex items-center gap-2 mt-6 text-emerald-400 font-semibold text-sm group-hover:gap-3 transition-all">
                  View Reports <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* E-Sign */}
            <motion.div
              className="group relative bg-gradient-to-br from-[#0F1923] to-[#0A1218] border border-white/[0.06] rounded-3xl p-8 overflow-hidden hover:border-rose-500/30 transition-all duration-500 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-all duration-700" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <PenTool className="h-6 w-6 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">E-Sign</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Secure electronic signatures with full audit trails and compliance.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#0A0F14] border-y border-white/5">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <Counter target="10K+" label="Global Customers" icon={<Users className="h-6 w-6" />} />
            <Counter target="50M+" label="Contracts Signed" icon={<FileText className="h-6 w-6" />} />
            <Counter target="99.9%" label="Uptime SLA" icon={<Shield className="h-6 w-6" />} />
            <Counter target="150+" label="Countries Served" icon={<Globe className="h-6 w-6" />} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          AUTOMATION SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-[#080C10] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.06)_0%,transparent_60%)]" />
        <div className="container px-4 mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Left: Workflow card */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl" />
              <div className="relative bg-[#0F1923]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-emerald-400 fill-current" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Workflow Automation</div>
                      <div className="text-xs text-slate-500">Active Pipeline</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">● Running</span>
                </div>

                <div className="space-y-3 relative">
                  <div className="absolute left-5 top-4 bottom-4 w-px bg-gradient-to-b from-emerald-500/50 to-transparent" />
                  {[
                    { title: 'New Lead Detected', sub: 'Enriched from LinkedIn', icon: Users, color: 'bg-emerald-500', delay: 0 },
                    { title: 'AI Score: 94/100', sub: 'High-value opportunity', icon: Cpu, color: 'bg-cyan-500', delay: 0.1 },
                    { title: 'Quote Generated', sub: '$145K · 3 products', icon: ShoppingCart, color: 'bg-violet-500', delay: 0.2 },
                    { title: 'Contract Sent', sub: 'Awaiting signature', icon: PenTool, color: 'bg-rose-500', delay: 0.3 },
                  ].map((step, i) => (
                    <motion.div
                      key={step.title}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + step.delay }}
                    >
                      <div className={`w-6 h-6 rounded-full ${step.color} flex items-center justify-center text-white shadow-lg ring-4 ring-[#0F1923] flex-shrink-0`}>
                        <step.icon size={11} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{step.title}</div>
                        <div className="text-xs text-slate-500">{step.sub}</div>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>

                {/* Floating badge */}
                <motion.div
                  className="absolute -right-6 -bottom-6 bg-gradient-to-br from-emerald-500 to-teal-400 text-white p-5 rounded-2xl shadow-2xl shadow-emerald-500/30"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="text-2xl font-black">+80%</div>
                  <div className="text-xs font-semibold opacity-80">Faster Response</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right: Copy */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                <Zap className="h-4 w-4 text-emerald-400 fill-current" />
                <span className="text-emerald-400 text-sm font-bold">Automation First</span>
              </div>
              <h2 className="text-5xl font-black text-white leading-tight">
                Stop wasting time on{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  manual work
                </span>
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed">
                Our platform automates the busy work so your team can focus on closing deals.
                From auto-populating contracts to syncing data across modules, we handle the heavy lifting.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Automated contract generation',
                  'Real-time pricing updates',
                  'Instant quote-to-cash sync',
                  'Smart approval workflows',
                  'AI-driven lead scoring',
                  'Seamless integrations',
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{item}</span>
                  </motion.div>
                ))}
              </div>
              <Link to="/solutions">
                <Button size="lg" className="h-14 px-8 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all font-semibold">
                  Explore Automation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════ */}
      <section className="py-32 bg-[#0A0F14] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.04)_0%,transparent_60%)]" />
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Loved by revenue teams</h2>
            <p className="text-slate-400 text-lg">Join thousands of companies transforming their revenue operations.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="group relative bg-[#0F1923]/80 backdrop-blur-sm border border-white/[0.06] rounded-3xl p-8 hover:border-emerald-500/20 hover:bg-[#0F1923] transition-all duration-500"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-8 text-base">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden bg-[#080C10]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/60 via-[#080C10] to-cyan-950/60" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl" />
        </div>
        <div className="container px-4 mx-auto relative z-10 text-center">
          <motion.div
            className="max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-4">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">No credit card required</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-white leading-tight">
              Ready to transform
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                your revenue engine?
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Join thousands of high-growth companies using Sirius Infra to close more deals, faster.
              Start your 14-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button size="lg" className="h-16 px-12 text-lg font-bold rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white border-0 shadow-[0_0_60px_rgba(16,185,129,0.4)] hover:shadow-[0_0_80px_rgba(16,185,129,0.6)] transition-all duration-300">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="h-16 px-12 text-lg font-semibold rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  Talk to Sales
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 pt-4 text-sm text-slate-500">
              {['Secure Payment', '14-day free trial', 'Cancel anytime', 'SOC 2 Compliant'].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Login Success Dialog */}
      <Dialog open={showLoginSuccess} onOpenChange={setShowLoginSuccess}>
        <DialogContent className="sm:max-w-md bg-[#0F1923] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Welcome Back!
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              You have successfully logged in. Access your dashboard to manage your account and services.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white border-0 hover:from-emerald-400 hover:to-teal-300">
                Go to Dashboard
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setShowLoginSuccess(false)} className="w-full sm:w-auto border-white/10 text-white hover:bg-white/10">
              Stay on Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
