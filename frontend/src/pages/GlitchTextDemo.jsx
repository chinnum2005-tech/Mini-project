import React from 'react';
import { GlitchText } from '../components/TextAnimations';

const GlitchTextDemo = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 pt-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            GlitchText Demo
          </h1>
          <p className="text-xl text-gray-300">
            RGB split and distortion glitch effect with jitter effects
          </p>
        </div>

        <div className="space-y-16">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Always Active Glitch</h2>
            <div className="flex flex-col items-center space-y-8">
              <GlitchText 
                speed={1} 
                enableShadows={true} 
                enableOnHover={false}
                className="text-5xl"
              >
                BLOCKLEARN
              </GlitchText>
              
              <GlitchText 
                speed={1.5} 
                enableShadows={true} 
                enableOnHover={false}
                className="text-4xl text-purple-500"
              >
                GLITCH EFFECT
              </GlitchText>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Hover Activated Glitch</h2>
            <div className="flex flex-col items-center space-y-8">
              <GlitchText 
                speed={1} 
                enableShadows={true} 
                enableOnHover={true}
                className="text-5xl"
              >
                HOVER ME
              </GlitchText>
              
              <GlitchText 
                speed={2} 
                enableShadows={true} 
                enableOnHover={true}
                className="text-4xl text-blue-500"
              >
                ANOTHER GLITCH
              </GlitchText>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Custom Styles</h2>
            <div className="flex flex-col items-center space-y-8">
              <GlitchText 
                speed={0.5} 
                enableShadows={false} 
                enableOnHover={false}
                className="text-4xl text-green-500"
              >
                NO SHADOWS
              </GlitchText>
              
              <GlitchText 
                speed={3} 
                enableShadows={true} 
                enableOnHover={false}
                className="text-3xl text-yellow-500"
              >
                FAST GLITCH
              </GlitchText>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-2">GlitchText Features</h3>
            <ul className="text-gray-300 space-y-1 text-left">
              <li>• RGB split glitch effect with customizable colors</li>
              <li>• Adjustable animation speed</li>
              <li>• Hover activation option</li>
              <li>• Shadow enable/disable toggle</li>
              <li>• Fully responsive design</li>
              <li>• Customizable CSS classes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlitchTextDemo;