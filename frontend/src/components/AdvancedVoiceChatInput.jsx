import React, { useState, useRef, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const AdvancedVoiceChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const speechSynthRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    browserSupportsSpeechSynthesis
  } = useSpeechRecognition();

  // Emotion detection using simple keyword analysis (can be enhanced with ML models)
  const detectEmotion = (text) => {
    const lowerText = text.toLowerCase();

    // Positive emotions
    if (lowerText.includes('excited') || lowerText.includes('happy') || lowerText.includes('great') ||
        lowerText.includes('awesome') || lowerText.includes('love') || lowerText.includes('amazing')) {
      return { emotion: 'excited', confidence: 0.8 };
    }

    // Frustrated/negative emotions
    if (lowerText.includes('frustrated') || lowerText.includes('angry') || lowerText.includes('annoyed') ||
        lowerText.includes('confused') || lowerText.includes('stuck') || lowerText.includes('help')) {
      return { emotion: 'frustrated', confidence: 0.7 };
    }

    // Curious/learning emotions
    if (lowerText.includes('curious') || lowerText.includes('learn') || lowerText.includes('understand') ||
        lowerText.includes('explain') || lowerText.includes('how') || lowerText.includes('why')) {
      return { emotion: 'curious', confidence: 0.75 };
    }

    // Default neutral
    return { emotion: 'neutral', confidence: 0.5 };
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message, transcript]);

  // Initialize speech synthesis
  useEffect(() => {
    if (browserSupportsSpeechSynthesis && !speechSynthRef.current) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, [browserSupportsSpeechSynthesis]);

  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    const finalMessage = message.trim() || transcript?.trim();
    if (finalMessage && !disabled) {
      onSendMessage(finalMessage, { hasFile: !!uploadedFile });
      setMessage('');
      resetTranscript();
      setUploadedFile(null);
    }
  }, [message, transcript, disabled, onSendMessage, resetTranscript, uploadedFile]);

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
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
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

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="border-t border-gray-200 dark:border-slate-700 p-4">
        <div className="text-center text-sm text-gray-500 dark:text-slate-400 mb-4">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none max-h-32"
                rows={1}
                disabled={disabled}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 dark:border-slate-700 p-4">
      {/* Simplified voice control - single mic button */}
      <div className="flex items-center justify-center mb-4">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        {isListening && (
          <div className="ml-3 text-sm text-blue-600 dark:text-blue-400 animate-pulse">
            🎤 Listening... (auto-sends in 1s)
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message || transcript || ''}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Speak now..." : "Type your message or tap mic to speak..."}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none max-h-32 ${
                isListening ? 'border-blue-300 dark:border-blue-600' : 'border-gray-300 dark:border-slate-600'
              }`}
              rows={1}
              disabled={disabled}
            />
          </div>
          <button
            type="submit"
            disabled={(!message.trim() && !transcript?.trim()) || disabled}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      {transcript && isListening && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-300">
          <strong>Recognized:</strong> {transcript}
        </div>
      )}
    </div>
  );
};

export default AdvancedVoiceChatInput;
