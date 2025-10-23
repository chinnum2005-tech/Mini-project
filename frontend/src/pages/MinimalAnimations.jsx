import React, { useRef, useEffect } from 'react';

// Minimal ClickSpark implementation
const MinimalClickSpark = ({ children }) => {
  const containerRef = useRef(null);

  const handleClick = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create a simple spark effect
    for (let i = 0; i < 8; i++) {
      const spark = document.createElement('div');
      spark.style.position = 'absolute';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.width = '4px';
      spark.style.height = '4px';
      spark.style.backgroundColor = '#ffffff';
      spark.style.borderRadius = '50%';
      spark.style.pointerEvents = 'none';
      spark.style.zIndex = '1000';
      
      containerRef.current.appendChild(spark);
      
      // Animate and remove
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 30;
      
      setTimeout(() => {
        spark.style.transition = 'all 0.5s ease-out';
        spark.style.opacity = '0';
        spark.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        
        setTimeout(() => {
          if (spark.parentNode) {
            spark.parentNode.removeChild(spark);
          }
        }, 500);
      }, 10);
    }
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {children}
    </div>
  );
};

// Minimal SplitText implementation
const MinimalSplitText = ({ text, className = '' }) => {
  useEffect(() => {
    console.log('Minimal SplitText component loaded');
  }, []);

  return (
    <div className={className}>
      {text.split('').map((char, index) => (
        <span 
          key={index} 
          style={{ 
            display: 'inline-block',
            animation: 'fadeIn 0.5s ease-out',
            animationDelay: `${index * 0.1}s`,
            opacity: 0
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

// Add CSS for the animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

const MinimalAnimations = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Minimal Animations Test</h1>
        
        {/* Minimal ClickSpark Test */}
        <div className="mb-12 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Minimal ClickSpark</h2>
          <MinimalClickSpark>
            <div className="h-64 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center cursor-pointer">
              <p className="text-white text-xl font-bold">Click anywhere in this box</p>
            </div>
          </MinimalClickSpark>
          <p className="text-gray-300 mt-4">
            If you see small white dots radiating from your click point, the minimal ClickSpark is working.
          </p>
        </div>
        
        {/* Minimal SplitText Test */}
        <div className="mb-12 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Minimal SplitText</h2>
          <div className="text-center">
            <MinimalSplitText 
              text="MINIMAL SPLIT TEXT ANIMATION" 
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500"
            />
          </div>
          <p className="text-gray-300 mt-4 text-center">
            If each character fades in sequentially, the minimal SplitText is working.
          </p>
        </div>
        
        {/* Browser Animation Support Test */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Browser Animation Support</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-500 h-16 rounded-lg animate-pulse flex items-center justify-center">
              <span className="text-white font-bold">Pulse</span>
            </div>
            <div className="bg-green-500 h-16 rounded-lg animate-bounce flex items-center justify-center">
              <span className="text-white font-bold">Bounce</span>
            </div>
            <div className="bg-blue-500 h-16 rounded-lg animate-spin flex items-center justify-center">
              <span className="text-white font-bold">Spin</span>
            </div>
            <div className="bg-yellow-500 h-16 rounded-lg animate-ping flex items-center justify-center">
              <span className="text-white font-bold">Ping</span>
            </div>
          </div>
          <p className="text-gray-300 mt-4 text-center">
            If you see different animations on these boxes, your browser supports CSS animations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MinimalAnimations;