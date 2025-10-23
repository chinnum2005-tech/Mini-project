import React from 'react';
import { SplitText } from '../components/TextAnimations';

const TestSplitText = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl text-white mb-8">SplitText Test</h1>
      <div className="space-y-6">
        <SplitText
          text="Hello, BlockLearn!"
          tag="h2"
          className="text-4xl font-bold text-purple-400"
          splitType="chars"
          delay={100}
          duration={0.6}
        />
        <SplitText
          text="This is a word split test"
          tag="p"
          className="text-2xl text-blue-400"
          splitType="words"
          delay={200}
          duration={0.8}
        />
      </div>
    </div>
  );
};

export default TestSplitText;