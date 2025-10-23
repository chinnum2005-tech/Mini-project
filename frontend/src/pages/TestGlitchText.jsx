import React from 'react';
import { GlitchText } from '../components/TextAnimations';

const TestGlitchText = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center justify-center space-y-8">
      <h1 className="text-3xl text-white mb-8">GlitchText Test</h1>
      
      <GlitchText 
        speed={1} 
        enableShadows={true} 
        enableOnHover={false}
        className="text-4xl"
      >
        TEST GLITCH
      </GlitchText>
      
      <GlitchText 
        speed={1.5} 
        enableShadows={true} 
        enableOnHover={true}
        className="text-3xl text-purple-500"
      >
        HOVER GLITCH
      </GlitchText>
    </div>
  );
};

export default TestGlitchText;