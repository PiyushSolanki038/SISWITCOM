import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { API_CONFIG } from '@/config/api';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Message sent successfully! We'll be in touch soon.");
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          message: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden">
       {/* Hero Section */}
       <section className="relative pt-32 pb-20 overflow-hidden bg-[#F3F0EB]">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#1A3C34]/5 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#EB5E4C]/10 blur-3xl"></div>
        </div>

        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center mb-6">
                <Badge variant="outline" className="px-4 py-1.5 text-sm border-[#1A3C34]/20 bg-white text-[#1A3C34] rounded-full shadow-sm">
                  Contact Us
                </Badge>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#1A3C34] leading-[1.1] mb-6">
                Get in <span className="text-[#EB5E4C]">Touch</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Have questions about our enterprise solutions? We're here to help you scale your revenue operations.
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Contact Information */}
            <motion.div 
               className="lg:col-span-1 space-y-6"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border border-slate-200 shadow-sm bg-white rounded-[2rem] overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-[#F3F0EB] p-3 rounded-xl text-[#1A3C34]">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1A3C34] text-lg mb-1">Email</h3>
                      <p className="text-slate-500 mb-2 text-sm">Our friendly team is here to help.</p>
                      <a href="mailto:hello@unifiedhub.com" className="text-[#EB5E4C] font-semibold hover:text-[#d94a38] transition-colors flex items-center gap-1 group">
                        hello@unifiedhub.com <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-[#F3F0EB] p-3 rounded-xl text-[#1A3C34]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1A3C34] text-lg mb-1">Office</h3>
                      <p className="text-slate-500 mb-2 text-sm">Come say hello at our HQ.</p>
                      <p className="text-slate-900 font-medium text-sm">
                        123 Business Ave, Suite 100<br />
                        San Francisco, CA 94107
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-[#F3F0EB] p-3 rounded-xl text-[#1A3C34]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1A3C34] text-lg mb-1">Phone</h3>
                      <p className="text-slate-500 mb-2 text-sm">Mon-Fri from 8am to 5pm.</p>
                      <a href="tel:+15551234567" className="text-[#EB5E4C] font-semibold hover:text-[#d94a38] transition-colors flex items-center gap-1 group">
                        +1 (555) 123-4567 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A3C34] text-white border-none shadow-xl overflow-hidden relative rounded-[2rem]">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-[#EB5E4C]/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <CardContent className="p-8 relative z-10">
                   <h3 className="text-xl font-bold mb-3">Priority Support</h3>
                   <p className="text-white/80 mb-8 leading-relaxed text-sm">
                     Existing enterprise customer? Log in to access 24/7 priority support and dedicated success manager.
                   </p>
                   <Button variant="secondary" className="w-full bg-white text-[#1A3C34] hover:bg-slate-100 font-semibold h-12 rounded-full" asChild>
                     <Link to="/signin">Log In to Support</Link>
                   </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full border border-slate-200 shadow-xl bg-white rounded-[2rem]">
                <CardContent className="p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="p-3 bg-[#F3F0EB] rounded-xl text-[#1A3C34]">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold text-[#1A3C34]">Send us a message</h2>
                       <p className="text-slate-500 text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#1A3C34]">
                          First Name
                        </label>
                        <Input 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="John" 
                          className="h-12 border-slate-200 focus:border-[#1A3C34] focus:ring-[#1A3C34]/20 bg-slate-50/50 rounded-xl" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#1A3C34]">
                          Last Name
                        </label>
                        <Input 
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe" 
                          className="h-12 border-slate-200 focus:border-[#1A3C34] focus:ring-[#1A3C34]/20 bg-slate-50/50 rounded-xl" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#1A3C34]">
                        Email Address
                      </label>
                      <Input 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        type="email" 
                        placeholder="john@company.com" 
                        className="h-12 border-slate-200 focus:border-[#1A3C34] focus:ring-[#1A3C34]/20 bg-slate-50/50 rounded-xl" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#1A3C34]">
                        Message
                      </label>
                      <Textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about your project, needs, or inquiry..." 
                        className="min-h-[200px] resize-none border-slate-200 focus:border-[#1A3C34] focus:ring-[#1A3C34]/20 bg-slate-50/50 p-4 rounded-xl" 
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-14 text-base font-bold bg-[#1A3C34] hover:bg-[#122a25] shadow-lg shadow-[#1A3C34]/20 rounded-full transition-transform hover:-translate-y-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Sending... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                      ) : (
                        <>Send Message <Send className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

