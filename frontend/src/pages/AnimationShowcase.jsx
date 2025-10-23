import React from 'react';
import { ClickSpark } from '../components/Animations';
import MagicBento from '../components/Components/MagicBento';
import { SplitText } from '../components/TextAnimations';
import { GlitchText } from '../components/TextAnimations';

const AnimationShowcase = () => {
  const customCardData = [
    {
      color: '#6366f1',
      title: 'Interactive Design',
      description: 'Create stunning user experiences',
      label: 'UI/UX'
    },
    {
      color: '#8b5cf6',
      title: 'Real-time Collaboration',
      description: 'Work together seamlessly',
      label: 'Teamwork'
    },
    {
      color: '#0ea5e9',
      title: 'Data Analytics',
      description: 'Gain insights from your data',
      label: 'Insights'
    },
    {
      color: '#10b981',
      title: 'Automation',
      description: 'Streamline workflows',
      label: 'Efficiency'
    },
    {
      color: '#f59e0b',
      title: 'Cloud Integration',
      description: 'Connect with cloud services',
      label: 'Connectivity'
    },
    {
      color: '#ef4444',
      title: 'Enterprise Security',
      description: 'Protect your data',
      label: 'Protection'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Animation Showcase
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Demonstrating all implemented animations and effects
          </p>
        </div>

        {/* ClickSpark Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">ClickSpark Animation</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <ClickSpark
              sparkColor="#ffffff"
              sparkSize={12}
              sparkRadius={20}
              sparkCount={12}
              duration={500}
              easing="ease-out"
              extraScale={1.2}
            >
              <div className="relative w-full h-64 rounded-xl bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center cursor-pointer">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Click Anywhere</h3>
                  <p className="text-gray-300">See particle spark bursts</p>
                </div>
              </div>
            </ClickSpark>
          </div>
        </section>

        {/* MagicBento Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">MagicBento Grid</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <MagicBento 
              cards={customCardData}
              particleCount={15}
              glowColor="132, 0, 255"
              enableTilt={true}
              clickEffect={true}
              enableMagnetism={true}
              spotlightEnabled={true}
            />
          </div>
        </section>

        {/* SplitText Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">SplitText Animation</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-8">
            <SplitText
              text="Character Split Animation"
              tag="h3"
              className="text-3xl font-bold text-purple-400"
              splitType="chars"
              delay={50}
              duration={0.8}
              from={{ opacity: 0, y: 50, rotateX: -90 }}
              to={{ opacity: 1, y: 0, rotateX: 0 }}
            />
            
            <SplitText
              text="Word Split Animation"
              tag="p"
              className="text-2xl text-blue-400"
              splitType="words"
              delay={200}
              duration={0.7}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
            />
            
            <SplitText
              text="Line Split Animation with Multiple Lines of Text for Demonstration Purposes"
              tag="p"
              className="text-xl text-green-400"
              splitType="lines"
              delay={300}
              duration={0.8}
              from={{ opacity: 0, x: -50 }}
              to={{ opacity: 1, x: 0 }}
            />
          </div>
        </section>

        {/* GlitchText Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">GlitchText Effect</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 flex flex-col items-center space-y-8">
            <GlitchText 
              speed={1} 
              enableShadows={true} 
              enableOnHover={false}
              className="text-4xl"
            >
              ALWAYS ACTIVE
            </GlitchText>
            
            <GlitchText 
              speed={1.5} 
              enableShadows={true} 
              enableOnHover={true}
              className="text-3xl text-purple-500"
            >
              HOVER ME
            </GlitchText>
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">If Animations Don't Work:</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Refresh the page completely</li>
                <li>• Check browser console for errors (F12)</li>
                <li>• Ensure JavaScript is enabled</li>
                <li>• Try a different browser</li>
                <li>• Clear browser cache and cookies</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Expected Behaviors:</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• ClickSpark: Particles appear on click</li>
                <li>• MagicBento: Cards tilt and show particles on hover</li>
                <li>• SplitText: Text animates in character by character</li>
                <li>• GlitchText: RGB split effect on text</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnimationShowcase;