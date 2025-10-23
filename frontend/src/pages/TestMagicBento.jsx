import React from 'react';
import MagicBento from '../components/Components/MagicBento';

const TestMagicBento = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl text-white mb-8 text-center">MagicBento Test</h1>
      <MagicBento 
        particleCount={10}
        glowColor="255, 0, 0"
        enableTilt={true}
        clickEffect={true}
      />
    </div>
  );
};

export default TestMagicBento;