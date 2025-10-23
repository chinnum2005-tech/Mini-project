import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import GlobalAnimations from './GlobalAnimations';

const LenisWrapper = ({ children, enableClickSpark = true, enableBackground = true, backgroundType = 'gradient' }) => {
  useEffect(() => {
    // Add lenis class to html element for CSS targeting
    document.documentElement.classList.add('lenis');

    // Initialize Lenis with optimized settings
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      lerp: 0.1, // Linear interpolation for smoother animation
    });

    // Animation frame for smooth updates
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    // Start the animation loop
    const rafId = requestAnimationFrame(raf);

    // Handle resize events
    const handleResize = () => {
      lenis.resize();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      document.documentElement.classList.remove('lenis');
      lenis.destroy();
    };
  }, []);

  return (
    <GlobalAnimations 
      enableClickSpark={enableClickSpark}
      enableBackground={enableBackground}
      backgroundType={backgroundType}
    >
      {children}
    </GlobalAnimations>
  );
};

export default LenisWrapper;