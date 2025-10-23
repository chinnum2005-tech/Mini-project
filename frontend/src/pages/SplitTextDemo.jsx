import React from 'react';
import { SplitText } from '../components/TextAnimations';

const SplitTextDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 pt-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            SplitText Demo
          </h1>
          <p className="text-xl text-gray-300">
            Text splitting with staggered entrance animations
          </p>
        </div>

        <div className="space-y-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Character Split Animation</h2>
            <div className="space-y-6">
              <SplitText
                text="Hello, World!"
                tag="h3"
                className="text-3xl font-bold text-purple-400"
                splitType="chars"
                delay={50}
                duration={0.8}
                from={{ opacity: 0, y: 50, rotateX: -90 }}
                to={{ opacity: 1, y: 0, rotateX: 0 }}
              />
              
              <SplitText
                text="Welcome to BlockLearn"
                tag="h4"
                className="text-2xl font-semibold text-blue-400"
                splitType="chars"
                delay={80}
                duration={0.6}
                from={{ opacity: 0, x: -30 }}
                to={{ opacity: 1, x: 0 }}
              />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Word Split Animation</h2>
            <div className="space-y-6">
              <SplitText
                text="This is a word-by-word animation"
                tag="p"
                className="text-xl text-green-400"
                splitType="words"
                delay={200}
                duration={0.7}
                from={{ opacity: 0, y: 30 }}
                to={{ opacity: 1, y: 0 }}
              />
              
              <SplitText
                text="Each word appears with a staggered delay"
                tag="p"
                className="text-xl text-yellow-400"
                splitType="words"
                delay={150}
                duration={0.5}
                from={{ opacity: 0, scale: 0.8 }}
                to={{ opacity: 1, scale: 1 }}
              />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Line Split Animation</h2>
            <div className="space-y-6">
              <SplitText
                text="This is a line-by-line animation. Each line appears sequentially with a smooth entrance effect."
                tag="p"
                className="text-lg text-pink-400"
                splitType="lines"
                delay={300}
                duration={0.8}
                from={{ opacity: 0, x: -50 }}
                to={{ opacity: 1, x: 0 }}
              />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Custom Styling</h2>
            <div className="space-y-6">
              <SplitText
                text="Creative Text Effects"
                tag="h3"
                className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"
                splitType="chars"
                delay={60}
                duration={0.9}
                from={{ opacity: 0, y: 40, scale: 0.5, rotate: -15 }}
                to={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              />
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-2">Features</h3>
            <ul className="text-gray-300 space-y-1">
              <li>• Character, word, and line splitting options</li>
              <li>• Customizable animations and delays</li>
              <li>• Scroll-triggered animations</li>
              <li>• Font loading optimization</li>
              <li>• Multiple HTML tag support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitTextDemo;