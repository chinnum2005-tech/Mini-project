import React, { useState, useEffect } from 'react';

const AnimationDebug = () => {
  const [testResults, setTestResults] = useState({
    clickspark: 'Not tested',
    magicbento: 'Not tested',
    splittext: 'Not tested',
    glitchtext: 'Not tested'
  });

  // Test if components can be imported
  useEffect(() => {
    try {
      const testImports = async () => {
        try {
          await import('../components/Animations/ClickSpark');
          setTestResults(prev => ({ ...prev, clickspark: 'Import successful' }));
        } catch (error) {
          setTestResults(prev => ({ ...prev, clickspark: `Import failed: ${error.message}` }));
        }

        try {
          await import('../components/Components/MagicBento');
          setTestResults(prev => ({ ...prev, magicbento: 'Import successful' }));
        } catch (error) {
          setTestResults(prev => ({ ...prev, magicbento: `Import failed: ${error.message}` }));
        }

        try {
          await import('../components/TextAnimations/SplitText');
          setTestResults(prev => ({ ...prev, splittext: 'Import successful' }));
        } catch (error) {
          setTestResults(prev => ({ ...prev, splittext: `Import failed: ${error.message}` }));
        }

        try {
          await import('../components/TextAnimations/GlitchText');
          setTestResults(prev => ({ ...prev, glitchtext: 'Import successful' }));
        } catch (error) {
          setTestResults(prev => ({ ...prev, glitchtext: `Import failed: ${error.message}` }));
        }
      };

      testImports();
    } catch (error) {
      console.error('Test setup error:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Animation Debug Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(testResults).map(([component, result]) => (
            <div key={component} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-2 capitalize">{component}</h2>
              <p className={`text-lg ${result.includes('successful') ? 'text-green-400' : 'text-red-400'}`}>
                {result}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Manual Animation Tests</h2>
          
          <div className="space-y-8">
            {/* CSS Animation Test */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">CSS Animation Test</h3>
              <div 
                className="w-16 h-16 bg-blue-500 rounded-lg animate-pulse"
                style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
              ></div>
              <p className="text-gray-300 mt-2">
                If you see a pulsing blue square, CSS animations are working.
              </p>
            </div>

            {/* JavaScript Animation Test */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">JavaScript Animation Test</h3>
              <button 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
                onClick={() => alert('Button animation works!')}
              >
                Click Me
              </button>
              <p className="text-gray-300 mt-2">
                If the button scales up on hover and shows an alert when clicked, JS animations are working.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside text-gray-300 space-y-2">
            <li>Check browser console for errors (F12 → Console tab)</li>
            <li>Ensure JavaScript is enabled in your browser</li>
            <li>Try refreshing the page (Ctrl+F5)</li>
            <li>Try a different browser (Chrome, Firefox, Edge)</li>
            <li>Disable ad blockers and browser extensions</li>
            <li>Clear browser cache and cookies</li>
            <li>Check if animations work on other websites</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AnimationDebug;