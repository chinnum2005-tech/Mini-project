import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClickSpark } from './Animations';
import { AnimatedBackground } from './AnimatedBackground';
import { SplitText } from './TextAnimations';
import { GlitchText } from './TextAnimations';

const GlobalAnimations = ({ 
  children, 
  enableClickSpark = true, 
  enableBackground = true, 
  backgroundType = 'gradient',
  enableTextAnimations = false,
  enableGlitchEffects = false
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Animated Background */}
      {enableBackground && (
        <AnimatedBackground 
          type={backgroundType}
          primaryColor="hsl(var(--primary))"
          secondaryColor="hsl(var(--secondary))"
          intensity={0.7}
          className="fixed inset-0 -z-10"
          enableMagicBento={true}
        />
      )}

      {/* Global floating elements for additional visual interest */}
      {enableBackground && (
        <>
          <motion.div
            className="absolute top-10 left-10 w-4 h-4 rounded-full bg-primary/20"
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/3 right-20 w-6 h-6 rounded-full bg-secondary/20"
            animate={{
              y: [0, 30, 0],
              x: [0, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-3 h-3 rounded-full bg-primary/30"
            animate={{
              y: [0, -25, 0],
              x: [0, 20, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      )}

      {/* ClickSpark Effect */}
      {enableClickSpark ? (
        <ClickSpark>{children}</ClickSpark>
      ) : (
        children
      )}
    </div>
  );
};

// Enhanced text animation component
export const AnimatedText = ({ 
  text, 
  type = 'split', 
  className = '',
  delay = 0,
  duration = 0.5,
  stagger = 0.05,
  ...props 
}) => {
  if (type === 'split') {
    return (
      <SplitText
        text={text}
        className={className}
        delay={stagger * 1000}
        duration={duration}
        from={{ opacity: 0, y: 20 }}
        to={{ opacity: 1, y: 0 }}
        {...props}
      />
    );
  }

  if (type === 'glitch') {
    return (
      <GlitchText
        className={className}
        speed={1}
        enableShadows={true}
        enableOnHover={false}
        {...props}
      >
        {text}
      </GlitchText>
    );
  }

  return (
    <motion.h1
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      {...props}
    >
      {text}
    </motion.h1>
  );
};

// Animated button component
export const AnimatedButton = ({ 
  children, 
  className = '',
  whileHover = { scale: 1.05 },
  whileTap = { scale: 0.95 },
  ...props 
}) => {
  return (
    <motion.button
      className={className}
      whileHover={whileHover}
      whileTap={whileTap}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Animated card component
export const AnimatedCard = ({ 
  children, 
  className = '',
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlobalAnimations;