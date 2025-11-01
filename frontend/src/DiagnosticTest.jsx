import React, { useState, useEffect } from 'react';

function DiagnosticTest() {
  const [frontendStatus, setFrontendStatus] = useState('Checking...');
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [chatStatus, setChatStatus] = useState('Checking...');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    testAllSystems();
  }, []);

  const testAllSystems = async () => {
    // Test frontend
    setFrontendStatus('✅ Frontend server running on port 5174');

    // Test backend health
    await testBackendHealth();

    // Test chat functionality
    await testChatAPI();
  };

  const testBackendHealth = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(`✅ Backend API: ${data.message}`);
      } else {
        setBackendStatus(`❌ Backend API Error: ${response.status} ${response.statusText}`);
        setErrorDetails(`Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      setBackendStatus(`❌ Backend Connection Failed: ${error.message}`);
      setErrorDetails(`Connection error: ${error.message}`);
    }
  };

  const testChatAPI = async () => {
    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'test message',
          conversation_id: null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatStatus(`✅ Chat API: Working - ${data.success ? 'Success' : 'Error'}`);
      } else {
        setChatStatus(`❌ Chat API Error: ${response.status} ${response.statusText}`);
        if (response.status === 404) {
          setErrorDetails('Chat endpoint not found. Make sure backend server is running the chat routes.');
        }
      }
    } catch (error) {
      setChatStatus(`❌ Chat API Failed: ${error.message}`);
      setErrorDetails(`Chat connection error: ${error.message}`);
    }
  };

  const testWithToken = async () => {
    try {
      // Test with a mock token
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          message: 'test with auth',
          conversation_id: null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatStatus(`✅ Chat API with Auth: Working`);
      } else {
        setChatStatus(`❌ Chat API with Auth Error: ${response.status}`);
      }
    } catch (error) {
      setChatStatus(`❌ Chat API with Auth Failed: ${error.message}`);
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      maxWidth: '900px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#333', marginBottom: '30px', textAlign: 'center' }}>
        🔧 BlockLearn Diagnostic Test
      </h1>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>📊 System Status</h3>

        <div style={{
          padding: '15px',
          background: '#f0f8ff',
          borderRadius: '8px',
          marginBottom: '10px',
          borderLeft: '4px solid #2196F3'
        }}>
          <strong>Frontend Server:</strong> {frontendStatus}
        </div>

        <div style={{
          padding: '15px',
          background: '#f0f8ff',
          borderRadius: '8px',
          marginBottom: '10px',
          borderLeft: '4px solid #2196F3'
        }}>
          <strong>Backend API:</strong> {backendStatus}
        </div>

        <div style={{
          padding: '15px',
          background: '#f0f8ff',
          borderRadius: '8px',
          marginBottom: '10px',
          borderLeft: '4px solid #2196F3'
        }}>
          <strong>Chat API:</strong> {chatStatus}
        </div>
      </div>

      {errorDetails && (
        <div style={{
          padding: '15px',
          background: '#fff3cd',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #ffc107'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Error Details</h4>
          <p style={{ margin: 0, fontSize: '14px' }}>{errorDetails}</p>
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#FF9800', marginBottom: '15px' }}>🔗 Direct Access URLs</h3>
        <div style={{
          padding: '15px',
          background: '#f3e5f5',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <div><strong>Frontend:</strong> <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" style={{color: '#2196F3'}}>http://localhost:5174</a></div>
          <div><strong>Backend Health:</strong> <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer" style={{color: '#2196F3'}}>http://localhost:5000/api/health</a></div>
          <div><strong>Chat API:</strong> <a href="http://localhost:5000/api/chat/message" target="_blank" rel="noopener noreferrer" style={{color: '#2196F3'}}>http://localhost:5000/api/chat/message</a></div>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#9C27B0', marginBottom: '15px' }}>🧪 Test Actions</h3>
        <button
          onClick={testBackendHealth}
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            marginBottom: '10px'
          }}
        >
          🔄 Test Backend Health
        </button>

        <button
          onClick={testChatAPI}
          style={{
            padding: '10px 20px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            marginBottom: '10px'
          }}
        >
          💬 Test Chat API
        </button>

        <button
          onClick={testWithToken}
          style={{
            padding: '10px 20px',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          🔐 Test with Auth
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#E91E63', marginBottom: '15px' }}>🚀 Quick Actions</h3>
        <a
          href="http://localhost:5174"
          style={{
            display: 'inline-block',
            padding: '15px 30px',
            background: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            marginRight: '15px',
            marginBottom: '10px'
          }}
        >
          🌐 Open BlockLearn Platform
        </a>

        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 25px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh Diagnostics
        </button>
      </div>

      <div style={{
        padding: '15px',
        background: '#e8f5e8',
        borderRadius: '8px',
        borderLeft: '4px solid #4CAF50',
        fontSize: '14px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>💡 Troubleshooting Tips</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>If chat doesn't work, check that both servers are running</li>
          <li>Clear browser cache and cookies if experiencing issues</li>
          <li>Try opening in an incognito/private window</li>
          <li>Check browser console (F12) for JavaScript errors</li>
        </ul>
      </div>
    </div>
  );
}

export default DiagnosticTest;
