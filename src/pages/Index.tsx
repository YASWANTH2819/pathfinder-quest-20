import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, MapPin, Sparkles, Target, Users, Zap, BarChart3 } from 'lucide-react';
import UserMenu from '@/components/UserMenu';
import heroImage from '@/assets/hero-career-guide.jpg';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/main');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen cyber-grid">
      {/* Navigation */}
      <nav className="p-6 glass-card m-4 rounded-2xl shimmer">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-blue))] rounded-lg flex items-center justify-center animate-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text-rainbow">PathFinder</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="text-foreground hover:text-[hsl(var(--cyber-blue))] transition-colors">Features</a>
              <a href="#about" className="text-foreground hover:text-[hsl(var(--cyber-blue))] transition-colors">About</a>
              <a href="#contact" className="text-foreground hover:text-[hsl(var(--cyber-blue))] transition-colors">Contact</a>
            </div>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Discover Your{' '}
                <span className="gradient-text-rainbow animate-shimmer">Perfect Career</span>{' '}
                Path
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Choose your tool: Get personalized career guidance or analyze your resume with AI-powered insights. ✨
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text-rainbow">10K+</div>
                <div className="text-sm text-muted-foreground">Students Guided</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text-rainbow">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text-rainbow">500+</div>
                <div className="text-sm text-muted-foreground">Career Paths</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--cyber-purple)/0.4)] to-[hsl(var(--cyber-blue)/0.4)] rounded-3xl blur-2xl animate-pulse-glow"></div>
            <img 
              src={heroImage} 
              alt="AI Career Guidance" 
              className="relative rounded-3xl shadow-2xl animate-float glow-effect"
            />
          </div>
        </div>
      </div>
      
      {/* Main Options */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-text mb-4">Choose Your Path</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the tool that best fits your current needs for career development
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Get Started Button */}
          <Card className="glass-card p-8 hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105"
                onClick={handleGetStarted}>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] mb-4 animate-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold gradient-text">Get Started</h3>
              <p className="text-muted-foreground">
                {user ? 'Access your career tools and analysis' : 'Sign up to begin your career journey'}
              </p>
              <Button variant="cyber" className="w-full group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 mr-2" />
                {user ? 'Go to Dashboard' : 'Start Your Journey'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text-rainbow">CareerAI Guide</span>?
            </h2>
            <p className="text-xl text-muted-foreground">
              Revolutionary features designed to unlock your potential
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card p-8 hover:scale-105 transition-all duration-300 cyber-border glow-effect">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-blue))] rounded-lg flex items-center justify-center mb-6 animate-glow">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">Personalized Guidance</h3>
              <p className="text-muted-foreground">
                Get tailored career recommendations based on your unique skills, interests, and goals.
              </p>
            </Card>

            <Card className="glass-card p-8 hover:scale-105 transition-all duration-300 cyber-border glow-effect">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--cyber-green))] to-[hsl(var(--cyber-teal))] rounded-lg flex items-center justify-center mb-6 animate-pulse-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Advanced AI analyzes market trends and provides real-time career insights.
              </p>
            </Card>

            <Card className="glass-card p-8 hover:scale-105 transition-all duration-300 cyber-border glow-effect">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--cyber-pink))] to-[hsl(var(--cyber-purple))] rounded-lg flex items-center justify-center mb-6 animate-rainbow">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">Community Support</h3>
              <p className="text-muted-foreground">
                Connect with peers and mentors in your field of interest.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
