import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Zap, Globe, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Careers: React.FC = () => {
  const positions = [
    {
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'Remote (US/EU)',
      type: 'Full-time',
      id: 'eng-001',
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: 'Full-time',
      id: 'prod-002',
    },
    {
      title: 'Enterprise Account Executive',
      department: 'Sales',
      location: 'London, UK',
      type: 'Full-time',
      id: 'sales-003',
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      id: 'eng-004',
    },
    {
      title: 'Customer Success Manager',
      department: 'Success',
      location: 'San Francisco, CA',
      type: 'Full-time',
      id: 'cs-005',
    },
  ];

  const perks = [
    {
      icon: <Globe className="w-6 h-6 text-primary" />,
      title: 'Remote First',
      description: 'Work from anywhere in the world. We believe in output, not hours in a chair.',
    },
    {
      icon: <Heart className="w-6 h-6 text-primary" />,
      title: 'Health & Wellness',
      description: 'Comprehensive health coverage and wellness stipends for you and your family.',
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: 'Growth Budget',
      description: 'Annual budget for conferences, courses, and books to help you level up.',
    },
    {
      icon: <Coffee className="w-6 h-6 text-primary" />,
      title: 'Flexible Hours',
      description: 'Manage your own schedule. We value work-life balance.',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Hero Section */}
      <section className="container px-4 mx-auto mb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary rounded-full">
            Careers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Build the Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              B2B Sales
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our mission to transform how companies sell, close, and grow. We're looking for passionate problem solvers.
          </p>
          <div className="pt-4">
            <Button size="lg" className="h-12 px-8 text-lg" onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}>
              View Open Roles
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Perks Section */}
      <section className="container px-4 mx-auto mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Sirius Infra?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We take care of our team so they can take care of our customers.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {perks.map((perk, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="h-full border-muted/60 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {perk.icon}
                  </div>
                  <CardTitle className="text-xl">{perk.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{perk.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="open-positions" className="container px-4 mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
          <p className="text-muted-foreground">
            Find the role that fits your skills and passions.
          </p>
        </div>
        <div className="space-y-4">
          {positions.map((position, index) => (
            <motion.div
              key={position.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer group border-muted/60">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} /> {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {position.type}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" className="group-hover:translate-x-1 transition-transform self-start md:self-center">
                    Apply Now <ArrowRight size={16} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Don't see a perfect fit? <Link to="/contact" className="text-primary hover:underline">Contact us</Link> and tell us how you can help.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Careers;

