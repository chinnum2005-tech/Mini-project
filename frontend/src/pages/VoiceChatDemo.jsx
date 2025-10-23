import React, { useState } from 'react';
import VoiceEnabledChatbot from '../components/VoiceEnabledChatbot';

const VoiceChatDemo = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your voice-enabled assistant. You can type or speak your messages.", sender: 'bot' },
    { id: 2, text: "Try clicking the 'Voice Input' button and speaking naturally.", sender: 'bot' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = generateBotResponse(messageText);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello there! How can I assist you today?";
    }
    
    if (lowerMessage.includes('help')) {
      return "I can help you with various tasks. You can ask me questions, request information, or use voice commands. Try speaking your next message!";
    }
    
    if (lowerMessage.includes('voice')) {
      return "Yes, I support voice input! Click the 'Voice Input' button and speak naturally. I'll convert your speech to text.";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    if (lowerMessage.includes('blockchain')) {
      return "Blockchain is a distributed ledger technology that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography.";
    }
    
    if (lowerMessage.includes('skill')) {
      return "Our platform offers various skills for learning. You can browse categories, match with mentors, and track your progress through blockchain-verified achievements.";
    }
    
    // Default response
    const responses = [
      "That's interesting! Tell me more about that.",
      "I understand. How else can I assist you?",
      "Thanks for sharing. Is there anything specific you'd like to know?",
      "I'm here to help. What would you like to explore next?",
      "Great question! I can provide more information on that topic."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Voice-Enabled Chatbot Demo
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            Experience the power of voice-to-text chat functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Information */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Voice Chat Features
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Voice Input</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm">
                    Speak naturally and convert speech to text in real-time with multiple language support.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m-2.828-9.9a9 9 0 012.828-2.828" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Text-to-Speech</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm">
                    Enable voice responses to hear replies read aloud in your preferred language.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Multi-language Support</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm">
                    Communicate in multiple languages including English, Spanish, French, German, and more.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Real-time Recognition</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm">
                    See your spoken words converted to text instantly as you speak.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">How to Use</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-slate-400 text-sm">
                <li>Click the "Voice Input" button to start speaking</li>
                <li>Speak naturally into your microphone</li>
                <li>See your words appear in the text box in real-time</li>
                <li>Click "Stop Recording" when finished</li>
                <li>Send your message using the send button</li>
              </ol>
            </div>
          </div>
          
          {/* Chat Demo */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Try the Voice Chat
              </h2>
              <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                Type or speak your message below
              </p>
            </div>
            
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-slate-700 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <VoiceEnabledChatbot 
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              initialMessages={messages}
            />
          </div>
        </div>
        
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Technical Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Voice Recognition</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Uses the Web Speech API for speech recognition, which is supported in modern browsers like Chrome, Edge, and Safari.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Text-to-Speech</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Implements the SpeechSynthesis API to convert text responses to spoken audio in multiple languages.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Browser Support</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Works on all modern browsers with Web Speech API support. Falls back to text-only input for unsupported browsers.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Customization</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Easily customizable with language selection, voice settings, and UI themes to match your application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatDemo;