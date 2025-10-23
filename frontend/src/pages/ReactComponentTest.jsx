import React, { useState, useEffect } from 'react';

const ReactComponentTest = () => {
  const [testStatus, setTestStatus] = useState('Initializing...');
  const [componentTests, setComponentTests] = useState({
    react: 'Not tested',
    hooks: 'Not tested',
    imports: 'Not tested'
  });

  useEffect(() => {
    // Test if React is working
    try {
      setComponentTests(prev => ({ ...prev, react: '✅ React is working' }));
    } catch (error) {
      setComponentTests(prev => ({ ...prev, react: `❌ React error: ${error.message}` }));
    }

    // Test if hooks are working
    try {
      const [state, setState] = useState(0);
      setState(1);
      setComponentTests(prev => ({ ...prev, hooks: '✅ React hooks are working' }));
    } catch (error) {
      setComponentTests(prev => ({ ...prev, hooks: `❌ Hooks error: ${error.message}` }));
    }

    // Test dynamic imports
    try {
      import('react')
        .then(() => setComponentTests(prev => ({ ...prev, imports: '✅ Dynamic imports working' })))
        .catch(err => setComponentTests(prev => ({ ...prev, imports: `❌ Import error: ${err.message}` })));
    } catch (error) {
      setComponentTests(prev => ({ ...prev, imports: `❌ Import test error: ${error.message}` }));
    }

    setTestStatus('Tests completed');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">React Component Test</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Test Status</h2>
          <p className="text-lg text-yellow-400">{testStatus}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(componentTests).map(([test, result]) => (
            <div key={test} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-2 capitalize">{test}</h2>
              <p className={`text-lg ${result.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                {result}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Interactive Test</h2>
          <div className="flex flex-col items-center space-y-4">
            <button 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
              onClick={() => alert('Button click works!')}
            >
              Click Me to Test Events
            </button>
            <p className="text-gray-300">
              If you see an alert when clicking the button, React event handling is working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactComponentTest;