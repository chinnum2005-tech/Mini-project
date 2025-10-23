import React from 'react';
import ClickSpark from '../components/Animations/ClickSpark';

const ClickSparkDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          ClickSpark Demo
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Click anywhere on the screen to see particle spark bursts in action
        </p>
      </div>

      <ClickSpark
        sparkColor="#ffffff"
        sparkSize={12}
        sparkRadius={20}
        sparkCount={12}
        duration={500}
        easing="ease-out"
        extraScale={1.2}
      >
        <div className="relative w-full max-w-4xl h-96 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden">
          <div className="text-center p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Interactive Canvas
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Click anywhere in this box to create spark effects
            </p>
            <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <span className="text-white font-medium">Try clicking here!</span>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-purple-500/30"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-blue-500/30"></div>
          <div className="absolute top-1/3 right-8 w-6 h-6 rounded-full bg-indigo-500/30"></div>
        </div>
      </ClickSpark>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-2">Customizable</h3>
          <p className="text-gray-300">
            Adjust colors, size, radius, and more to match your design
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-2">Lightweight</h3>
          <p className="text-gray-300">
            Built with React and Canvas for optimal performance
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-2">Easy to Use</h3>
          <p className="text-gray-300">
            Simple API with sensible defaults and full customization
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClickSparkDemo;