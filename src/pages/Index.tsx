import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plane, Shield, Zap, Globe, ArrowRight, Check } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-sky opacity-5" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Plane className="w-4 h-4" />
              Premium Flight Experiences
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
              Unforgettable
              <span className="text-gradient-sky"> Skies</span>
              <br />
              Await You
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Book unique flight experiences from trusted operators. 
              From scenic tours to adrenaline-pumping adventures, 
              your next journey starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="gradient" asChild>
                <Link to="/experiences">
                  Explore Experiences
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/operators">For Operators</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Choose SkyBook?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We connect adventurers with exceptional flight operators, 
              making booking seamless and experiences unforgettable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Verified Operators',
                description: 'Every operator is vetted for safety and quality standards.',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Instant Booking',
                description: 'Book your flight experience in minutes with real-time availability.',
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Global Experiences',
                description: 'Discover unique flight experiences from operators worldwide.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-xl gradient-sky flex items-center justify-center text-primary-foreground mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operator CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-sidebar rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-sidebar-foreground mb-6">
                Are You a Flight Operator?
              </h2>
              <p className="text-sidebar-foreground/70 text-lg mb-8">
                Join SkyBook and reach thousands of adventure seekers. 
                Manage your bookings, schedule flights, and grow your business 
                with our powerful operator tools.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Easy booking management',
                  'Multi-staff support',
                  'Analytics dashboard',
                  'Flexible scheduling',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sidebar-foreground">
                    <div className="w-5 h-5 rounded-full gradient-sky flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="accent" asChild>
                  <Link to="/register?type=operator">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <p className="text-sidebar-foreground/50 text-sm self-center">
                  9,999 HUF/month after trial
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
