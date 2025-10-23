import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const AnimationContext = createContext();

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

export const AnimationProvider = ({ children }) => {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check for user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    animationsEnabled,
    setAnimationsEnabled,
    prefersReducedMotion,
    toggleAnimations: () => setAnimationsEnabled(!animationsEnabled)
  };

  // Page transition animation
  const getPageTransition = () => {
    if (prefersReducedMotion || !animationsEnabled) {
      return {};
    }
    
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 }
    };
  };

  return (
    <AnimationContext.Provider value={value}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          {...getPageTransition()}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </AnimationContext.Provider>
  );
};

export default AnimationProvider;