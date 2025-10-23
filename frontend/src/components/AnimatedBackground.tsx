import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import MagicBento from './Components/MagicBento';

type AnimationType = 'gradient' | 'particles' | 'blobs' | 'magicbento' | 'ethereal';

interface AnimatedBackgroundProps {
  type?: AnimationType;
  primaryColor?: string;
  secondaryColor?: string;
  intensity?: number;
  disableOnMobile?: boolean;
  className?: string;
  enableMagicBento?: boolean;
}

export const AnimatedBackground = ({
  type = 'gradient',
  primaryColor = 'hsl(var(--primary))',
  secondaryColor = 'hsl(var(--secondary))',
  intensity = 0.5,
  disableOnMobile = true,
  className = '',
  enableMagicBento = false
}: AnimatedBackgroundProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    setIsMobile(window.innerWidth < 768);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (prefersReducedMotion || (disableOnMobile && isMobile)) {
    return (
      <div 
        className={`fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5 ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (type === 'gradient') {
    return <GradientBackground primaryColor={primaryColor} secondaryColor={secondaryColor} intensity={intensity} className={className} />;
  }

  if (type === 'particles') {
    return <ParticlesBackground primaryColor={primaryColor} intensity={intensity} className={className} />;
  }

  if (type === 'magicbento' && enableMagicBento) {
    return <MagicBentoBackground primaryColor={primaryColor} secondaryColor={secondaryColor} intensity={intensity} className={className} />;
  }

  if (type === 'ethereal') {
    return <EtherealBackground primaryColor={primaryColor} secondaryColor={secondaryColor} intensity={intensity} className={className} />;
  }

  return <BlobsBackground primaryColor={primaryColor} secondaryColor={secondaryColor} intensity={intensity} className={className} />;
};

const GradientBackground = ({ primaryColor, secondaryColor, intensity, className }: Omit<AnimatedBackgroundProps, 'type' | 'disableOnMobile' | 'enableMagicBento'>) => {
  const duration = 20 / (intensity || 0.5);

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            `radial-gradient(circle at 0% 0%, ${primaryColor} 0%, transparent 50%)`,
            `radial-gradient(circle at 100% 100%, ${secondaryColor} 0%, transparent 50%)`,
            `radial-gradient(circle at 0% 100%, ${primaryColor} 0%, transparent 50%)`,
            `radial-gradient(circle at 100% 0%, ${secondaryColor} 0%, transparent 50%)`,
            `radial-gradient(circle at 0% 0%, ${primaryColor} 0%, transparent 50%)`,
          ]
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            `radial-gradient(circle at 100% 50%, ${secondaryColor} 0%, transparent 50%)`,
            `radial-gradient(circle at 0% 50%, ${primaryColor} 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 100%, ${secondaryColor} 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 0%, ${primaryColor} 0%, transparent 50%)`,
            `radial-gradient(circle at 100% 50%, ${secondaryColor} 0%, transparent 50%)`,
          ]
        }}
        transition={{
          duration: duration * 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

const ParticlesBackground = ({ primaryColor, intensity, className }: Omit<AnimatedBackgroundProps, 'type' | 'disableOnMobile' | 'secondaryColor' | 'enableMagicBento'>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = [];
    const particleCount = Math.floor(50 * (intensity || 0.5));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (intensity || 0.5),
        vy: (Math.random() - 0.5) * (intensity || 0.5),
        size: Math.random() * 3 + 1
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor?.includes('hsl') ? primaryColor.replace(')', ', 0.6)').replace('hsl', 'hsla') : `${primaryColor}99`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [primaryColor, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    />
  );
};

const BlobsBackground = ({ primaryColor, secondaryColor, intensity, className }: Omit<AnimatedBackgroundProps, 'type' | 'disableOnMobile' | 'enableMagicBento'>) => {
  const duration = 15 / (intensity || 0.5);

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: primaryColor }}
        animate={{
          x: ['-10%', '110%'],
          y: ['0%', '80%', '20%', '0%'],
          scale: [1, 1.2, 0.8, 1]
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{ background: secondaryColor }}
        animate={{
          x: ['110%', '-10%'],
          y: ['80%', '10%', '60%', '80%'],
          scale: [0.8, 1.3, 1, 0.8]
        }}
        transition={{
          duration: duration * 1.3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-15"
        style={{ background: primaryColor }}
        animate={{
          x: ['50%', '20%', '70%', '50%'],
          y: ['-10%', '110%'],
          scale: [1, 0.9, 1.1, 1]
        }}
        transition={{
          duration: duration * 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

const MagicBentoBackground = ({ primaryColor, secondaryColor, intensity, className }: Omit<AnimatedBackgroundProps, 'type' | 'disableOnMobile' | 'enableMagicBento'>) => {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <div className="absolute inset-0 opacity-10">
        {/* Simplified magic bento grid for background */}
        <div className="grid grid-cols-4 grid-rows-3 gap-4 h-full w-full p-8">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="rounded-xl"
              style={{ 
                backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
                opacity: 0.1 + (intensity * 0.2)
              }}
              animate={{
                scale: [1, 1 + (intensity * 0.1), 1],
                rotate: [0, intensity * 2, 0]
              }}
              transition={{
                duration: 10 + (i * 2),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const EtherealBackground = ({ primaryColor, secondaryColor, intensity, className }: Omit<AnimatedBackgroundProps, 'type' | 'disableOnMobile' | 'enableMagicBento'>) => {
  const duration = 25 / (intensity || 0.5);

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true" style={{ pointerEvents: 'none' }}>
      {/* Ethereal floating elements */}
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${primaryColor}, transparent)` }}
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.5, 1]
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full opacity-15"
        style={{ background: `radial-gradient(circle, ${secondaryColor}, transparent)` }}
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{
          duration: duration * 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${primaryColor}, transparent)` }}
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: duration * 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};