import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import AdvancedVoiceChatInput from './AdvancedVoiceChatInput';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const messagesEndRef = useRef(null);
  const speechSynthRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations when widget opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window && !speechSynthRef.current) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  // Auto-speak bot messages when enabled
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender_type === 'bot') {
        speakMessage(lastMessage.message);
      }
    }
  }, [messages, autoSpeak]);

  const speakMessage = (text) => {
    if (speechSynthRef.current && selectedLanguage) {
      // Cancel any ongoing speech
      speechSynthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        console.log('Speech started');
      };

      utterance.onend = () => {
        console.log('Speech ended');
      };

      utterance.onerror = (error) => {
        console.error('Speech error:', error);
      };

      speechSynthRef.current.speak(utterance);
    }
  };

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.data || []);

        // Load the most recent conversation if available
        if (data.data && data.data.length > 0) {
          loadConversation(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/conversation/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentConversation(data.data);
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const conversationId = currentConversation?.id;

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: messageText
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Update current conversation
        setCurrentConversation(data.data);
        setMessages(data.data.messages || []);

        // Add to conversations list if it's a new conversation
        setConversations(prev => {
          const existingIndex = prev.findIndex(c => c.id === data.data.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = data.data;
            return updated;
          } else {
            return [data.data, ...prev];
          }
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'New Chat'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentConversation(data.data);
        setMessages([]);
        setConversations(prev => [data.data, ...prev]);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const getAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
    } catch (error) {
      console.error('Error getting analytics:', error);
    }
    return null;
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 z-50 hover:shadow-xl"
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              BlockLearn Assistant
            </h3>
            <div className="flex items-center space-x-2">
              {/* Auto-speak toggle */}
              <label className="flex items-center space-x-1 text-sm">
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  className="rounded"
                />
                <span className="text-gray-600 dark:text-slate-400">🔊 Auto-speak</span>
              </label>

              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Conversations Sidebar (if multiple conversations) */}
          {conversations.length > 1 && (
            <div className="border-b border-gray-200 dark:border-slate-700 p-2">
              <div className="flex space-x-2 overflow-x-auto">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                      currentConversation?.id === conv.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                    }`}
                  >
                    {conv.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-slate-400 py-8">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">Ask me anything about BlockLearn!</p>
                <p className="text-xs mt-1">I can help with sessions, skills, profiles, and more.</p>
                <div className="mt-4 text-xs text-gray-400 dark:text-slate-500">
                  <p>💡 Try voice input or enable auto-speak!</p>
                </div>
              </div>
            ) : (
              messages.map(message => (
                <Message
                  key={message.id}
                  message={message}
                  isUser={message.sender_type === 'user'}
                />
              ))
            )}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 dark:bg-slate-700 rounded-lg px-4 py-2 rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice-enabled Input */}
          <VoiceChatInput
            onSendMessage={sendMessage}
            disabled={isLoading}
            language={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />

          {/* New Chat Button */}
          <div className="p-2 border-t border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <button
                onClick={startNewConversation}
                className="px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                + Start New Conversation
              </button>

              <button
                onClick={getAnalytics}
                className="px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="View your learning analytics and personalized recommendations"
              >
                📊 Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
