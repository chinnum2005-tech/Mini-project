import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Checking...');
  const [details, setDetails] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/health');
        setStatus('✅ Connected Successfully');
        setDetails(`Backend responded: ${response.data.message}`);
      } catch (error) {
        setStatus('❌ Connection Failed');
        setDetails(`Error: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Connection Test</h1>
        
        <div className="space-y-6">
          <div className="bg-black/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Frontend Status</h2>
            <p className="text-green-400">Running on http://localhost:5180</p>
          </div>
          
          <div className="bg-black/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Backend Status</h2>
            <p className="text-blue-400">Running on http://localhost:5001</p>
          </div>
          
          <div className="bg-black/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Connection Test</h2>
            <p className="text-lg font-medium text-yellow-400 mb-2">{status}</p>
            <p className="text-gray-300">{details}</p>
          </div>
          
          <div className="bg-black/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Expected Results</h2>
            <ul className="text-gray-300 space-y-1">
              <li>• Frontend should display "✅ Connected Successfully"</li>
              <li>• Backend should respond with "BlockLearn API is running!"</li>
              <li>• No CORS errors should appear in browser console</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;