import React, { useState, useEffect } from 'react';

const ComponentTest = () => {
  const [importStatus, setImportStatus] = useState({
    clickspark: 'Testing...',
    magicbento: 'Testing...',
    splittext: 'Testing...',
    glitchtext: 'Testing...'
  });

  useEffect(() => {
    // Test ClickSpark import
    import('../components/Animations/ClickSpark')
      .then(() => setImportStatus(prev => ({ ...prev, clickspark: '✅ Success' })))
      .catch(err => setImportStatus(prev => ({ ...prev, clickspark: `❌ Failed: ${err.message}` })));

    // Test MagicBento import
    import('../components/Components/MagicBento')
      .then(() => setImportStatus(prev => ({ ...prev, magicbento: '✅ Success' })))
      .catch(err => setImportStatus(prev => ({ ...prev, magicbento: `❌ Failed: ${err.message}` })));

    // Test SplitText import
    import('../components/TextAnimations/SplitText')
      .then(() => setImportStatus(prev => ({ ...prev, splittext: '✅ Success' })))
      .catch(err => setImportStatus(prev => ({ ...prev, splittext: `❌ Failed: ${err.message}` })));

    // Test GlitchText import
    import('../components/TextAnimations/GlitchText')
      .then(() => setImportStatus(prev => ({ ...prev, glitchtext: '✅ Success' })))
      .catch(err => setImportStatus(prev => ({ ...prev, glitchtext: `❌ Failed: ${err.message}` })));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Component Import Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(importStatus).map(([component, status]) => (
            <div key={component} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-2 capitalize">{component}</h2>
              <p className={`text-lg ${status.includes('✅') ? 'text-green-400' : status.includes('❌') ? 'text-red-400' : 'text-yellow-400'}`}>
                {status}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Next Steps</h2>
          <ul className="text-gray-300 space-y-2">
            <li>• If all components show "✅ Success", the imports are working</li>
            <li>• If any show "❌ Failed", there's an import issue to fix</li>
            <li>• If all show "✅ Success" but animations still don't work, the issue might be with usage</li>
            <li>• Check browser console for any runtime errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComponentTest;