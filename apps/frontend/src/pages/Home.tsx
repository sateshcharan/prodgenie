import { useInView, motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
// import { BarChart3, FileText, Sparkles, Zap } from 'lucide-react';

import Hero from './homeSections/Hero';
import Stats from './homeSections/Stats';
import HowItWorks from './homeSections/HowItWorks';
import Industries from './homeSections/Industries';
import Statement from './homeSections/Statement';

type SectionWrapperProps = {
  children: React.ReactNode;
  from?: 'top' | 'bottom' | 'left' | 'right';
};

// const features = [
//   {
//     title: 'AI-Powered Drawing Analysis',
//     subtitle: 'Smart production drawing interpretation',
//     description:
//       'Advanced AI analyzes your CAD files, technical drawings, and blueprints to automatically extract manufacturing specifications and requirements.',
//     icon: Sparkles,
//   },
//   {
//     title: 'Automated Job Card Generation',
//     subtitle: 'Instant job card creation from drawings',
//     description:
//       'Generate comprehensive job cards with operations, tooling requirements, machining parameters, and quality checkpoints in seconds.',
//     icon: FileText,
//   },
//   {
//     title: 'Production Planning Intelligence',
//     subtitle: 'Smart manufacturing workflow optimization',
//     description:
//       'Optimize production sequences, estimate cycle times, and allocate resources efficiently based on drawing specifications.',
//     icon: BarChart3,
//   },
//   {
//     title: 'Real-time Integration',
//     subtitle: 'Seamless ERP and MES connectivity',
//     description:
//       'Connect directly with your existing ERP, MES, and production systems for seamless workflow automation.',
//     icon: Zap,
//   },
// ];

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
        <Stats />
      </SectionWrapper>

      {/* How to use */}
      <HowItWorks />

      {/* Statement with background */}
      <Statement />

      {/* Industries */}
      <SectionWrapper from="top">
        <Industries />
      </SectionWrapper>
    </div>
  );
};

export default Home;
