import { useRef, useState, useEffect } from 'react';
import { useInView, motion } from 'framer-motion';
import {
  BarChart3,
  Box,
  Cog,
  Cpu,
  FileText,
  Package,
  Settings,
  Shield,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';

import { logo } from '@prodgenie/libs/ui';

import Hero from './sections/Hero';
import Stats from './sections/Stats';
import Footer from './sections/Footer';
import Industries from './sections/Industries';
import HowItWorks from './sections/HowItWorks';
import Statement from './sections/Statement';

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
  useEffect(() => setIsVisible(true), []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <Hero isVisible={isVisible} />

      {/* Stats */}
      <SectionWrapper from="left">
        <Stats stats={stats} />
      </SectionWrapper>

      {/* How to use */}
      <HowItWorks />

      {/* Statement with background */}
      <Statement />

      {/* Industries */}
      <SectionWrapper from="top">
        <Industries industries={industries} />
      </SectionWrapper>

      {/* Footer */}
      <SectionWrapper from="left">
        <Footer logo={logo} />
      </SectionWrapper>
    </div>
  );
};

export default Home;
