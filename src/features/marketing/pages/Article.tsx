import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock data - in a real app, fetch based on ID
  const article = {
    title: 'Introducing Advanced Analytics Dashboard',
    subtitle: 'Get deeper insights into your sales performance with our new analytics features.',
    author: {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      avatar: 'SJ'
    },
    date: 'Jan 15, 2024',
    readTime: '5 min read',
    category: 'Product',
    content: `
      <p class="mb-6">We are thrilled to announce the launch of our new Advanced Analytics Dashboard, designed to give revenue teams unprecedented visibility into their sales performance. In today's fast-paced business environment, data-driven decision making is not just an advantage—it's a necessity.</p>
      
      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Why Analytics Matter</h2>
      <p class="mb-6">Sales teams often struggle with fragmented data spread across multiple tools. Our new dashboard unifies this information, providing a single source of truth for your entire revenue operation. From lead velocity to conversion rates, you can now track every metric that matters in real-time.</p>
      
      <blockquote class="border-l-4 border-blue-500 pl-4 italic text-slate-700 my-8">
        "The ability to visualize our entire pipeline in one place has completely transformed how we conduct our weekly forecast calls." - Jane Doe, VP of Sales at TechCorp
      </blockquote>
      
      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Key Features</h2>
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Real-time Visualization:</strong> Watch your pipeline evolve as deals move through stages.</li>
        <li><strong>Customizable Widgets:</strong> Build the dashboard that fits your specific role and KPIs.</li>
        <li><strong>Predictive Forecasting:</strong> AI-driven insights to help you call your number with confidence.</li>
        <li><strong>Drill-down Capabilities:</strong> Go from high-level trends to individual deal details in clicks.</li>
      </ul>
      
      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Getting Started</h2>
      <p class="mb-6">The Advanced Analytics Dashboard is available today for all Enterprise customers. To get started, simply navigate to the "Analytics" tab in your main navigation bar. We've also prepared a comprehensive guide in our Help Center to walk you through the setup process.</p>
      
      <p>We can't wait to see how you use these new tools to drive growth and efficiency in your organization. As always, we welcome your feedback and suggestions for future improvements.</p>
    `
  };

  return (
    <div className="min-h-screen bg-white font-sans pt-24 pb-20 selection:bg-[#EB5E4C]/20 selection:text-[#1A3C34]">
      <article className="container px-4 mx-auto max-w-4xl">
        {/* Back Link */}
        <Link to="/blog" className="inline-flex items-center text-slate-500 hover:text-[#1A3C34] transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="px-3 py-1 bg-[#1A3C34]/5 text-[#1A3C34] border-[#1A3C34]/10 hover:bg-[#1A3C34]/10">
                {article.category}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A3C34] mb-6 leading-tight">
              {article.title}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
              {article.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-slate-200">
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                    {article.author.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-slate-900">{article.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Featured Image (Placeholder) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="aspect-video bg-gradient-to-br from-[#1A3C34]/5 to-[#EB5E4C]/5 rounded-2xl mb-12 flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="text-slate-400 font-medium flex flex-col items-center gap-2 relative z-10">
             <div className="w-16 h-16 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
             </div>
             <span>Featured Image</span>
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#1A3C34] prose-a:text-[#EB5E4C] prose-blockquote:border-[#EB5E4C] prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24">
              {/* Share */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-6">
                <h3 className="font-semibold text-[#1A3C34] mb-4 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share this article
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white hover:text-[#1A3C34] hover:border-[#1A3C34]/20">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white hover:text-[#1A3C34] hover:border-[#1A3C34]/20">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white hover:text-[#1A3C34] hover:border-[#1A3C34]/20">
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white hover:text-[#1A3C34] hover:border-[#1A3C34]/20">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Newsletter (Mini) */}
              <div className="bg-[#1A3C34] rounded-xl p-6 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#EB5E4C]/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                <h3 className="font-bold text-lg mb-2 relative z-10">Stay updated</h3>
                <p className="text-slate-300 text-sm mb-4 relative z-10">Get the latest insights delivered to your inbox.</p>
                <div className="space-y-2 relative z-10">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="w-full px-3 py-2 rounded-md bg-white/10 border-white/10 text-white text-sm focus:ring-1 focus:ring-[#EB5E4C] focus:border-[#EB5E4C] outline-none placeholder:text-slate-400"
                  />
                  <Button size="sm" className="w-full bg-[#EB5E4C] hover:bg-[#d44d3d] text-white">Subscribe</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Article;
