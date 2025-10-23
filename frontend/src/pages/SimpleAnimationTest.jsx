import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const SimpleAnimationTest = () => {
  const boxRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // Test GSAP animation
    if (boxRef.current) {
      gsap.fromTo(boxRef.current, 
        { x: -100, opacity: 0, rotation: -180 },
        { x: 0, opacity: 1, rotation: 0, duration: 2, ease: "bounce.out" }
      );
    }

    // Test text animation
    if (textRef.current) {
      gsap.fromTo(textRef.current.children, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Simple Animation Test
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Testing if basic animations are working in your browser
        </p>
      </div>

      <div className="flex flex-col items-center space-y-12">
        {/* GSAP Animation Test */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">GSAP Animation Test</h2>
          <div className="flex justify-center">
            <div 
              ref={boxRef}
              className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">GSAP</span>
            </div>
          </div>
          <p className="text-gray-300 mt-4 text-center">
            If you see a box animate from the left with a bouncing effect, GSAP is working.
          </p>
        </div>

        {/* Staggered Text Animation Test */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Staggered Text Animation</h2>
          <div ref={textRef} className="text-center">
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 mb-2">
              <span className="inline-block mr-2">A</span>
              <span className="inline-block mr-2">n</span>
              <span className="inline-block mr-2">i</span>
              <span className="inline-block mr-2">m</span>
              <span className="inline-block mr-2">a</span>
              <span className="inline-block mr-2">t</span>
              <span className="inline-block mr-2">i</span>
              <span className="inline-block mr-2">o</span>
              <span className="inline-block mr-2">n</span>
              <span className="inline-block mr-2">s</span>
            </h3>
          </div>
          <p className="text-gray-300 mt-4 text-center">
            If the letters animate in one by one, staggered animations are working.
          </p>
        </div>

        {/* CSS Animation Test */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">CSS Animation Test</h2>
          <div className="flex justify-center space-x-4">
            <div className="w-16 h-16 bg-red-500 rounded-full animate-spin"></div>
            <div className="w-16 h-16 bg-green-500 rounded-full animate-ping"></div>
            <div className="w-16 h-16 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-16 h-16 bg-yellow-500 rounded-full animate-bounce"></div>
          </div>
          <p className="text-gray-300 mt-4 text-center">
            If you see spinning, pulsing, and bouncing circles, CSS animations are working.
          </p>
        </div>
      </div>

      <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-2xl">
        <h2 className="text-xl font-bold text-white mb-4">If Animations Don't Work</h2>
        <ul className="text-gray-300 space-y-2">
          <li>• Check browser console for JavaScript errors (F12)</li>
          <li>• Ensure your browser supports modern CSS animations</li>
          <li>• Try disabling browser extensions that might block animations</li>
          <li>• Test in an incognito/private browsing window</li>
          <li>• Try a different browser</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleAnimationTest;