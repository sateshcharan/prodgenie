import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Box,
  CheckCircle,
  ChevronRight,
  Clock,
  Cog,
  Cpu,
  Download,
  FileText,
  Package,
  Play,
  Settings,
  Shield,
  Sparkles,
  Upload,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';

import { Button, logo } from '@prodgenie/libs/ui';

type SectionWrapperProps = {
  children: React.ReactNode;
  from?: 'top' | 'bottom' | 'left' | 'right';
};

const stats = [
  {
    value: '95%',
    label: 'Time Reduction',
    description: 'in job card creation',
  },
  {
    value: '99.8%',
    label: 'Accuracy Rate',
    description: 'in drawing analysis',
  },
  { value: '500+', label: 'Manufacturers', description: 'trust ProdGenie' },
];

const industries = [
  { name: 'Automotive', icon: Cog },
  { name: 'Aerospace', icon: Package },
  { name: 'Electronics', icon: Cpu },
  { name: 'Machinery', icon: Settings },
  { name: 'Medical Devices', icon: Shield },
  { name: 'Consumer Goods', icon: Box },
  { name: 'Industrial Tools', icon: Wrench },
  { name: 'Manufacturing', icon: BarChart3 },
];

const features = [
  {
    title: 'AI-Powered Drawing Analysis',
    subtitle: 'Smart production drawing interpretation',
    description:
      'Advanced AI analyzes your CAD files, technical drawings, and blueprints to automatically extract manufacturing specifications and requirements.',
    icon: Sparkles,
  },
  {
    title: 'Automated Job Card Generation',
    subtitle: 'Instant job card creation from drawings',
    description:
      'Generate comprehensive job cards with operations, tooling requirements, machining parameters, and quality checkpoints in seconds.',
    icon: FileText,
  },
  {
    title: 'Production Planning Intelligence',
    subtitle: 'Smart manufacturing workflow optimization',
    description:
      'Optimize production sequences, estimate cycle times, and allocate resources efficiently based on drawing specifications.',
    icon: BarChart3,
  },
  {
    title: 'Real-time Integration',
    subtitle: 'Seamless ERP and MES connectivity',
    description:
      'Connect directly with your existing ERP, MES, and production systems for seamless workflow automation.',
    icon: Zap,
  },
];

const SectionWrapper = ({ children, from = 'bottom' }: SectionWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const getInitialOffset = () => {
    switch (from) {
      case 'top':
        return { y: -50 };
      case 'bottom':
        return { y: 50 };
      case 'left':
        return { x: -50 };
      case 'right':
        return { x: 50 };
      default:
        return { y: 50 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...getInitialOffset() }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => setIsVisible(true), []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">
                AI-Powered Manufacturing Intelligence
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
              <span className="text-primary">Automate</span>
              <br />
              <span className="text-foreground">Job Card</span>
              <br />
              <span className="text-primary">Generation</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              Transform your production drawings into comprehensive job cards
              instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="group p-6 rounded-2xl text-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="p-6 rounded-2xl text-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Drawing</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group hover:scale-105 transition-transform"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-foreground text-lg font-semibold mb-1">
                {stat.label}
              </div>
              <div className="text-muted-foreground text-sm">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Industries */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-primary">
            Industries We Serve
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            From aerospace to automotive, ProdGenie adapts to your industry's
            specific needs.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {industries.map((industry, index) => {
              const Icon = industry.icon;
              return (
                <div
                  key={industry.name}
                  className="group cursor-pointer transform hover:scale-105 transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border hover:shadow-lg">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {industry.name}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary">
                      <span>Learn More</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <SectionWrapper from="left">
        {/* <section className="py-12 bg-muted"> */}
        <section className="relative z-10 px-6 py-12 bg-muted">
          <div className="max-w-7xl mx-auto">
            {/* Logo */}
            <img
              src={logo}
              alt="Website Logo"
              className="h-8 w-auto cursor-pointer"
              onClick={() => navigate('/')}
            />

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 mt-8">
              {['Product', 'Industries', 'Resources', 'Company'].map((col) => (
                <div key={col}>
                  <h4 className="text-foreground font-semibold mb-4">{col}</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <a href="#" className="block hover:text-foreground">
                      Link 1
                    </a>
                    <a href="#" className="block hover:text-foreground">
                      Link 2
                    </a>
                    <a href="#" className="block hover:text-foreground">
                      Link 3
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionWrapper>
    </div>
  );
};

export default Home;
