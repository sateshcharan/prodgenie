import { CTA, Features, Hero, PreFooter } from '../sections';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';

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
  return (
    <div className="min-h-screen space-y-16">
      <SectionWrapper from="bottom">
        <Hero />
      </SectionWrapper>

      <SectionWrapper from="right">
        <Features />
      </SectionWrapper>

      <SectionWrapper from="top">
        <CTA />
      </SectionWrapper>

      <SectionWrapper from="left">
        <PreFooter />
      </SectionWrapper>
    </div>
  );
};

export default Home;
