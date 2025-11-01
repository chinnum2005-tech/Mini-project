import React, { useState, useRef, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VoiceEnabledChatbot = ({ onSendMessage, disabled = false, initialMessages = [] }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [messages, setMessages] = useState(initialMessages);
  const [isMinimized, setIsMinimized] = useState(false);
  const textareaRef = useRef(null);
  const speechSynthRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    browserSupportsSpeechSynthesis
  } = useSpeechRecognition();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message, transcript]);

  // Update message when speech recognition provides transcript
  useEffect(() => {
    if (transcript && listening) {
      setMessage(transcript);
    }
  }, [transcript, listening]);

  // Initialize speech synthesis
  useEffect(() => {
    if (browserSupportsSpeechSynthesis && !speechSynthRef.current) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, [browserSupportsSpeechSynthesis]);

  // Update internal messages when prop changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    const finalMessage = message.trim() || transcript?.trim();
    if (finalMessage && !disabled) {
      onSendMessage(finalMessage);
      setMessage('');
      resetTranscript();
    }
  }, [message, transcript, disabled, onSendMessage, resetTranscript]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startListening = () => {
    if (browserSupportsSpeechRecognition) {
      setIsListening(true);
      SpeechRecognition.startListening({
        continuous: false,
        language: language
      });

      // Auto-stop after 1 second
      setTimeout(() => {
        stopListening();
      }, 1000);
    }
  };

  const stopListening = () => {
    if (browserSupportsSpeechRecognition) {
      setIsListening(false);
      SpeechRecognition.stopListening();

      // Auto-send the message after stopping
      setTimeout(() => {
        if (transcript && transcript.trim()) {
          handleSubmit();
        }
      }, 100);
    }
  };

  const speakMessage = (text) => {
    if (browserSupportsSpeechSynthesis && speechSynthRef.current) {
      setIsSpeaking(true);

      // Cancel any ongoing speech
      speechSynthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      speechSynthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Language options
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese' },
    { code: 'ru-RU', name: 'Russian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'ar-SA', name: 'Arabic' }
  ];

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-indigo-600">
          <h3 className="text-lg font-semibold text-white">
            Voice Chatbot
          </h3>
          <button
            onClick={toggleMinimize}
            className="text-white hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-white/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMinimized ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              )}
            </svg>
          </button>
        </div>

        {!isMinimized && (
          <div className="p-4">
            <div className="text-center text-sm text-gray-500 dark:text-slate-400 mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              Speech recognition is not supported in your browser.
              <br />
              Please use a modern browser like Chrome, Edge, or Safari.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 transition-all"
                    rows={1}
                    disabled={disabled}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!message.trim() || disabled}
                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
      {/* Header with gradient background */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-indigo-600">
        <h3 className="text-lg font-semibold text-white">
          Voice Chatbot
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMinimize}
            className="text-white hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-white/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMinimized ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Simplified voice control - single mic button with curved design */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isListening
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                }`}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {isListening && (
                <div className="ml-3 text-sm text-blue-600 dark:text-blue-400 animate-pulse font-medium">
                  🎤 Listening... (auto-sends)
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-end space-x-2 p-4">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={message || transcript || ''}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Speak now..." : "Type your message or tap mic to speak..."}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 transition-all ${
                    isListening ? 'border-blue-300 dark:border-blue-600 ring-2 ring-blue-200 dark:ring-blue-900/50' : 'border-gray-300 dark:border-slate-600'
                  }`}
                  rows={1}
                  disabled={disabled}
                />
              </div>
              <button
                type="submit"
                disabled={(!message.trim() && !transcript?.trim()) || disabled}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>

          {transcript && isListening && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300 mx-4 mb-4 animate-fadeIn">
              <strong>Recognized:</strong> {transcript}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VoiceEnabledChatbot;