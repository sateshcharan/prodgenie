import { useRef } from 'react';
import { useInView, motion } from 'framer-motion';
import {
  CTA,
  Features,
  Hero,
  PreFooter,
  ProcessFlow,
  Integrations,
  Industries,
  Stats,
} from './sections';
import { useState, useEffect } from 'react';

type SectionWrapperProps = {
  children: React.ReactNode;
  from?: 'top' | 'bottom' | 'left' | 'right';
};

const SectionWrapper = ({ children, from = 'bottom' }: SectionWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Determine initial offset based on direction
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
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-40 left-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <Hero isVisible={isVisible} />

      <Stats />

      <ProcessFlow />

      <Industries />

      <SectionWrapper from="right">
        <Features />
      </SectionWrapper>

      <Integrations />

      <CTA />

      <SectionWrapper from="left">
        <PreFooter />
      </SectionWrapper>
    </div>
  );
};

export default Home;
