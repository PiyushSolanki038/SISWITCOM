import React from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Shield, Zap, Search, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const Blog: React.FC = () => {
  const posts = [
    {
      category: 'Product',
      title: 'Introducing Advanced Analytics Dashboard',
      excerpt: 'Get deeper insights into your sales performance with our new analytics features. Visualize trends, track KPIs, and make data-driven decisions.',
      author: 'Sarah Johnson',
      date: 'Jan 15, 2024',
      readTime: '5 min read',
      image: 'bg-blue-100',
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />
    },
    {
      category: 'Best Practices',
      title: '10 Tips for Faster Quote-to-Cash',
      excerpt: 'Learn how top-performing sales teams are accelerating their revenue cycles. From automated workflows to smart approvals.',
      author: 'Michael Chen',
      date: 'Jan 12, 2024',
      readTime: '4 min read',
      image: 'bg-green-100',
      icon: <Zap className="w-8 h-8 text-green-600" />
    },
    {
      category: 'Case Study',
      title: 'How Acme Corp Increased Close Rates by 40%',
      excerpt: 'A deep dive into how our platform helped transform their sales process. See the real-world impact of unified revenue operations.',
      author: 'Emily Davis',
      date: 'Jan 10, 2024',
      readTime: '6 min read',
      image: 'bg-indigo-100',
      icon: <FileText className="w-8 h-8 text-indigo-600" />
    },
    {
      category: 'Industry',
      title: 'The Future of Contract Management',
      excerpt: 'AI and automation are reshaping how enterprises handle contracts. Discover the trends that will define the next decade.',
      author: 'David Park',
      date: 'Jan 8, 2024',
      readTime: '3 min read',
      image: 'bg-purple-100',
      icon: <Shield className="w-8 h-8 text-purple-600" />
    },
    {
      category: 'Product',
      title: 'New E-Sign Features for Enterprise Teams',
      excerpt: 'Enhanced security, mobile signing, and bulk operations now available. Streamline your signature workflows.',
      author: 'Sarah Johnson',
      date: 'Jan 5, 2024',
      readTime: '4 min read',
      image: 'bg-orange-100',
      icon: <FileText className="w-8 h-8 text-orange-600" />
    },
    {
      category: 'Tips & Tricks',
      title: 'Mastering Pipeline Management',
      excerpt: 'Expert strategies for keeping your sales pipeline healthy and predictable. Stop guessing and start forecasting with confidence.',
      author: 'Michael Chen',
      date: 'Jan 2, 2024',
      readTime: '7 min read',
      image: 'bg-pink-100',
      icon: <TrendingUp className="w-8 h-8 text-pink-600" />
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-[#EB5E4C]/20 selection:text-[#1A3C34] overflow-hidden">
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
                Blog & Resources
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#1A3C34] leading-[1.1]">
              Insights for the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A3C34] to-[#EB5E4C]">
                Modern Enterprise
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Latest news, product updates, and best practices for sales, operations, and revenue teams.
            </p>

            <div className="max-w-md mx-auto relative pt-4">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-20" />
               <Input 
                  placeholder="Search articles..." 
                  className="pl-10 h-12 bg-white border-slate-200 focus:border-[#1A3C34] focus:ring-[#1A3C34]/20 rounded-xl shadow-sm"
               />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container px-4 mx-auto py-24 relative z-10 bg-white">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full flex flex-col overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group bg-white">
                  <div className={`h-48 ${post.image} flex items-center justify-center group-hover:scale-105 transition-transform duration-500 relative overflow-hidden`}>
                     {/* Abstract Pattern Overlay */}
                     <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent" />
                     <div className="relative z-10 transform group-hover:-translate-y-1 transition-transform duration-300">
                        {post.icon}
                     </div>
                  </div>
                  <CardContent className="flex-1 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 font-medium">
                        {post.category}
                      </Badge>
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold leading-tight text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      <Link to={`/blog/${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 flex items-center justify-between border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-3 pt-6">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                         {post.author.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-slate-900">{post.author}</span>
                         <span className="text-[10px] text-slate-500">{post.date}</span>
                      </div>
                    </div>
                    <div className="pt-6">
                       <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="container px-4 mx-auto pb-24">
          <div className="bg-[#1A3C34] rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#EB5E4C]/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
             
            <div className="max-w-2xl mx-auto space-y-8 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Subscribe to our newsletter</h2>
              <p className="text-slate-300 text-lg">
                Get the latest insights, product updates, and revenue operations tips delivered straight to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-3 h-12 rounded-lg border-white/10 bg-white/10 text-white placeholder:text-slate-400 focus:ring-[#EB5E4C]/50 focus:border-[#EB5E4C]"
                />
                <Button size="lg" className="h-12 px-8 bg-[#EB5E4C] hover:bg-[#d44d3d] text-white font-semibold">
                   Subscribe
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                 We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </section>
    </div>
  );
};

export default Blog;
