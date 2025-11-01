import React, { useState, useEffect } from 'react';

function StatusTest() {
  const [frontendStatus, setFrontendStatus] = useState('Checking...');
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [chatStatus, setChatStatus] = useState('Checking...');

  useEffect(() => {
    // Test frontend
    setFrontendStatus('✅ Frontend server is running');

    // Test backend
    testBackendAPI();

    // Test chat API
    testChatAPI();
  }, []);

  const testBackendAPI = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(`✅ Backend API: ${data.message}`);
      } else {
        setBackendStatus(`❌ Backend API: ${response.status}`);
      }
    } catch (error) {
      setBackendStatus(`❌ Backend API: ${error.message}`);
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
          message: 'hello',
          conversation_id: null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatStatus(`✅ Chat API: ${data.success ? 'Working' : 'Error'}`);
      } else {
        setChatStatus(`❌ Chat API: ${response.status}`);
      }
    } catch (error) {
      setChatStatus(`❌ Chat API: ${error.message}`);
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h1 style={{ color: '#333', marginBottom: '30px', textAlign: 'center' }}>
        🚀 BlockLearn Platform Status
      </h1>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#4CAF50', marginBottom: '10px' }}>✅ Server Status</h3>
        <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '5px', marginBottom: '10px' }}>
          <strong>Frontend:</strong> {frontendStatus}
        </div>
        <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '5px', marginBottom: '10px' }}>
          <strong>Backend:</strong> {backendStatus}
        </div>
        <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
          <strong>Chat API:</strong> {chatStatus}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#2196F3', marginBottom: '10px' }}>🌐 Access URLs</h3>
        <div style={{ padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
          <div><strong>Frontend:</strong> <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer">http://localhost:5174</a></div>
          <div><strong>Backend API:</strong> <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">http://localhost:5000/api/health</a></div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#FF9800', marginBottom: '10px' }}>🧪 Test the Chat</h3>
        <button
          onClick={() => window.open('http://localhost:5174', '_blank')}
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Open BlockLearn Platform
        </button>
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Click the blue chat button in the bottom-right corner to test the AI assistant!
        </p>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#fff3cd', borderRadius: '5px', borderLeft: '4px solid #ffc107' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📋 Troubleshooting</h4>
        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
          • If chat doesn't work, check that both servers are running
        </p>
        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
          • Make sure no firewall is blocking the connections
        </p>
        <p style={{ margin: '0', fontSize: '14px' }}>
          • Clear browser cache if you experience issues
        </p>
      </div>
    </div>
  );
}

export default StatusTest;
