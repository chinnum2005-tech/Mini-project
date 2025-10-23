import React from 'react';
import { ClickSpark } from '../components/Animations';

const TestClickSpark = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-3xl text-white mb-8">ClickSpark Test</h1>
      <ClickSpark
        sparkColor="#ff0000"
        sparkSize={15}
        sparkRadius={25}
        sparkCount={10}
        duration={600}
      >
        <div className="w-64 h-64 bg-blue-500 rounded-lg flex items-center justify-center cursor-pointer">
          <span className="text-white text-xl font-bold">Click Me!</span>
        </div>
      </ClickSpark>
    </div>
  );
};

export default TestClickSpark;