import { useInView, motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

import Hero from './homeSections/Hero';
import Stats from './homeSections/Stats';
import HowItWorks from './homeSections/HowItWorks';
import Industries from './homeSections/Industries';
import Statement from './homeSections/Statement';

type SectionWrapperProps = {
  children: React.ReactNode;
  from?: 'top' | 'bottom' | 'left' | 'right';
};

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
    <div className="z-0">
      <Hero isVisible={isVisible} />

      <SectionWrapper from="left">
        <Stats />
      </SectionWrapper>

      <HowItWorks />

      <Statement />

      <SectionWrapper from="top">
        <Industries />
      </SectionWrapper>
    </div>
  );
};

export default Home;
