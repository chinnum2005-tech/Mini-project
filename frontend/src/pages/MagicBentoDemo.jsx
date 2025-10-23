import React from 'react';
import MagicBento from '../components/Components/MagicBento';

const MagicBentoDemo = () => {
  const customCardData = [
    {
      color: '#6366f1',
      title: 'Interactive Design',
      description: 'Create stunning user experiences with our design tools',
      label: 'UI/UX'
    },
    {
      color: '#8b5cf6',
      title: 'Real-time Collaboration',
      description: 'Work together seamlessly with your team in real-time',
      label: 'Teamwork'
    },
    {
      color: '#0ea5e9',
      title: 'Data Analytics',
      description: 'Gain insights from your data with powerful analytics',
      label: 'Insights'
    },
    {
      color: '#10b981',
      title: 'Automation',
      description: 'Streamline workflows and save time with automation',
      label: 'Efficiency'
    },
    {
      color: '#f59e0b',
      title: 'Cloud Integration',
      description: 'Connect with your favorite cloud services effortlessly',
      label: 'Connectivity'
    },
    {
      color: '#ef4444',
      title: 'Enterprise Security',
      description: 'Protect your data with enterprise-grade security',
      label: 'Protection'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            MagicBento Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Interactive bento grid tiles with particle effects, tilting, and spotlight animations
          </p>
        </div>
        
        <div className="mb-12">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-2">Particle Effects</h3>
            <p className="text-gray-300">
              Hover over cards to see animated particle effects
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-2">3D Tilting</h3>
            <p className="text-gray-300">
              Cards respond to mouse movement with realistic 3D tilting
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-2">Global Spotlight</h3>
            <p className="text-gray-300">
              Dynamic spotlight follows your cursor around the grid
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicBentoDemo;