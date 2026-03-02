import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageSquare, ArrowRight, Loader2, Sparkles, Clock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { API_CONFIG } from '@/config/api';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', company: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success("Message sent! We'll be in touch soon.");
        setFormData({ firstName: '', lastName: '', email: '', company: '', message: '' });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send message. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@siriusinfra.com', sub: 'Our team responds within 2 hours', href: 'mailto:hello@siriusinfra.com' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', sub: 'Mon–Fri, 8am–6pm PST', href: 'tel:+15551234567' },
    { icon: MapPin, label: 'Office', value: '123 Business Ave, Suite 100', sub: 'San Francisco, CA 94107', href: '#' },
    { icon: Globe, label: 'Global', value: '150+ Countries', sub: 'Worldwide support coverage', href: '#' },
  ];

  const inputClass = (name: string) =>
    `w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-white placeholder:text-slate-600 outline-none transition-all duration-300 ${focused === name ? 'border-emerald-500/50 bg-white/[0.07] shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/[0.08] hover:border-white/[0.15]'
    }`;

  return (
    <div className="min-h-screen bg-[#080C10] overflow-hidden">

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-semibold">Contact Us</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white leading-tight mb-6">
                Get in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Touch</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Have questions about our enterprise solutions? We're here to help you scale your revenue operations.
              </p>
            </motion.div>
          </div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">

            {/* Left: Contact info */}
            <motion.div
              className="lg:col-span-2 space-y-4"
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Info cards */}
              <div className="grid grid-cols-1 gap-4">
                {contactInfo.map((info, i) => (
                  <motion.a
                    key={info.label}
                    href={info.href}
                    className="group flex items-start gap-4 bg-[#0F1923]/80 border border-white/[0.06] rounded-2xl p-5 hover:border-emerald-500/20 hover:bg-[#0F1923] transition-all duration-300"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <info.icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{info.label}</div>
                      <div className="font-semibold text-white text-sm">{info.value}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{info.sub}</div>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Priority support card */}
              <motion.div
                className="relative bg-gradient-to-br from-emerald-950/80 to-teal-950/60 border border-emerald-500/20 rounded-2xl p-6 overflow-hidden"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">Priority Support</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-5">
                    Existing enterprise customer? Access 24/7 priority support and your dedicated success manager.
                  </p>
                  <Button variant="secondary" className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/10 font-semibold rounded-xl" asChild>
                    <Link to="/signin">Log In to Support</Link>
                  </Button>
                </div>
              </motion.div>

              {/* Response time */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <Clock className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">Average response time: <span className="text-white font-semibold">&lt; 2 hours</span></span>
              </div>
            </motion.div>

            {/* Right: Contact form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-[#0F1923]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Send us a message</h2>
                    <p className="text-slate-500 text-sm">We'll get back to you within 2 hours.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                      <input name="firstName" value={formData.firstName} onChange={handleInputChange} onFocus={() => setFocused('firstName')} onBlur={() => setFocused(null)} placeholder="John" className={inputClass('firstName')} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                      <input name="lastName" value={formData.lastName} onChange={handleInputChange} onFocus={() => setFocused('lastName')} onBlur={() => setFocused(null)} placeholder="Doe" className={inputClass('lastName')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input name="email" type="email" value={formData.email} onChange={handleInputChange} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="john@company.com" className={inputClass('email')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company <span className="text-slate-600 normal-case font-normal">(optional)</span></label>
                    <input name="company" value={formData.company} onChange={handleInputChange} onFocus={() => setFocused('company')} onBlur={() => setFocused(null)} placeholder="Acme Corp" className={inputClass('company')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused(null)}
                      placeholder="Tell us about your project, needs, or inquiry..."
                      rows={5}
                      className={`${inputClass('message')} resize-none`}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white border-0 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] rounded-2xl transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Sending... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                    ) : (
                      <>Send Message <Send className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
