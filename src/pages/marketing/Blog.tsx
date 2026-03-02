import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, User, ArrowRight, TrendingUp, Shield, Zap, Search, Sparkles, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Product', 'Engineering', 'Sales', 'Security', 'Company'];

  const posts = [
    {
      category: 'Product',
      title: 'Introducing Advanced Analytics Dashboard',
      excerpt: 'Get deeper insights into your revenue pipeline with our new AI-powered analytics dashboard. Track every metric that matters.',
      author: 'Sarah Chen',
      date: 'Jan 15, 2024',
      readTime: '5 min read',
      icon: TrendingUp,
      gradient: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      featured: true,
    },
    {
      category: 'Security',
      title: 'How We Achieved SOC 2 Type II Certification',
      excerpt: 'A deep dive into our security practices, infrastructure hardening, and the 18-month journey to achieving SOC 2 Type II compliance.',
      author: 'Marcus Reid',
      date: 'Jan 10, 2024',
      readTime: '8 min read',
      icon: Shield,
      gradient: 'from-cyan-500/20 to-blue-500/10',
      border: 'border-cyan-500/20',
      iconColor: 'text-cyan-400',
    },
    {
      category: 'Engineering',
      title: 'Building Real-Time Collaboration at Scale',
      excerpt: 'How we engineered our real-time document collaboration feature to support thousands of concurrent users without latency.',
      author: 'Priya Sharma',
      date: 'Jan 5, 2024',
      readTime: '10 min read',
      icon: Zap,
      gradient: 'from-violet-500/20 to-purple-500/10',
      border: 'border-violet-500/20',
      iconColor: 'text-violet-400',
    },
    {
      category: 'Sales',
      title: 'The Modern Sales Stack: What Actually Works in 2024',
      excerpt: 'We surveyed 500 revenue leaders to find out which tools and processes are actually moving the needle for high-growth sales teams.',
      author: 'Emily Davis',
      date: 'Dec 28, 2023',
      readTime: '7 min read',
      icon: TrendingUp,
      gradient: 'from-orange-500/20 to-amber-500/10',
      border: 'border-orange-500/20',
      iconColor: 'text-orange-400',
    },
    {
      category: 'Product',
      title: 'E-Sign 2.0: Smarter, Faster, More Secure',
      excerpt: 'Our completely rebuilt E-Signature module now supports biometric verification, bulk sending, and AI-powered clause detection.',
      author: 'David Park',
      date: 'Dec 20, 2023',
      readTime: '4 min read',
      icon: FileText,
      gradient: 'from-rose-500/20 to-pink-500/10',
      border: 'border-rose-500/20',
      iconColor: 'text-rose-400',
    },
    {
      category: 'Company',
      title: 'Sirius Infra Raises $12M Series A',
      excerpt: 'We\'re thrilled to announce our $12M Series A funding round led by Sequoia Capital to accelerate our mission of unifying revenue operations.',
      author: 'John Doe',
      date: 'Dec 15, 2023',
      readTime: '3 min read',
      icon: Sparkles,
      gradient: 'from-amber-500/20 to-yellow-500/10',
      border: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  const filtered = posts.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.find(p => p.featured);
  const rest = filtered.filter(p => !p.featured);

  return (
    <div className="flex flex-col min-h-screen bg-[#080C10] overflow-hidden">

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">Blog & Insights</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
              Revenue Ops
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Intelligence</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Insights, strategies, and stories from the Sirius Infra team and the broader revenue operations community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ SEARCH + FILTERS ═══ */}
      <section className="pb-12 relative z-10">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center max-w-4xl mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/40 focus:bg-white/[0.06] transition-all duration-300"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeCategory === cat
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-500 border border-white/[0.08] hover:text-white hover:bg-white/10'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ POSTS ═══ */}
      <section className="pb-32 relative z-10">
        <div className="container px-4 mx-auto max-w-6xl">
          {/* Featured post */}
          {featured && (
            <motion.div
              className={`group relative bg-gradient-to-br ${featured.gradient} border ${featured.border} rounded-3xl p-8 md:p-10 mb-8 cursor-pointer hover:shadow-[0_20px_60px_rgba(16,185,129,0.1)] transition-all duration-500 overflow-hidden`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">Featured</Badge>
                    <Badge variant="outline" className="border-white/10 text-slate-400 text-xs">{featured.category}</Badge>
                  </div>
                  <h2 className="text-3xl font-black text-white leading-tight group-hover:text-emerald-300 transition-colors duration-300">{featured.title}</h2>
                  <p className="text-slate-400 leading-relaxed">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{featured.author}</div>
                    <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{featured.date}</div>
                    <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{featured.readTime}</div>
                  </div>
                  <Button className="group/btn bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full font-semibold transition-all">
                    Read Article <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="hidden md:flex items-center justify-center">
                  <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${featured.gradient} border ${featured.border} flex items-center justify-center`}>
                    <featured.icon className={`h-16 w-16 ${featured.iconColor} opacity-60`} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <motion.div
                key={post.title}
                className={`group relative bg-gradient-to-br ${post.gradient} border ${post.border} rounded-3xl p-6 cursor-pointer hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-500 flex flex-col`}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border ${post.border} flex items-center justify-center`}>
                    <post.icon className={`h-5 w-5 ${post.iconColor}`} />
                  </div>
                  <Badge variant="outline" className="border-white/10 text-slate-500 text-xs">{post.category}</Badge>
                </div>
                <h3 className="font-bold text-white text-lg leading-tight mb-3 group-hover:text-emerald-300 transition-colors duration-300 flex-1">{post.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No articles found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section className="py-24 bg-[#0A0F14] border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_60%)]" />
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            className="max-w-2xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black text-white">Stay in the loop</h2>
            <p className="text-slate-400 text-lg">Get the latest revenue operations insights delivered to your inbox every week.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/40 transition-all"
              />
              <Button className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white border-0 font-bold rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all whitespace-nowrap">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-slate-600">No spam, ever. Unsubscribe at any time.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
