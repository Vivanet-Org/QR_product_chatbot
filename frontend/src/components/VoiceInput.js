import React, { useState, useEffect, useRef } from 'react';

const VoiceInput = ({ onTranscript, onError, language = 'en' }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    // Set recognition language based on prop
    const getRecognitionLang = (langCode) => {
      const langMap = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'zh-CN': 'zh-CN',
        'zh-TW': 'zh-TW',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'hi': 'hi-IN',
        'ar': 'ar-SA',
        'ru': 'ru-RU',
        'nl': 'nl-NL',
        'pl': 'pl-PL',
        'tr': 'tr-TR',
        'vi': 'vi-VN',
        'th': 'th-TH',
        'id': 'id-ID',
        'ms': 'ms-MY'
      };
      return langMap[langCode] || 'en-US';
    };

    recognition.lang = getRecognitionLang(language);

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      let errorMessage = 'Speech recognition error occurred';
      switch(event.error) {
        case 'network':
          errorMessage = 'Network error occurred. Please check your internet connection.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition aborted.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      if (onError) {
        onError(errorMessage);
      }
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setInterimTranscript(interimTranscript);

      if (finalTranscript) {
        const newTranscript = transcript + finalTranscript;
        setTranscript(newTranscript);

        if (onTranscript) {
          onTranscript(newTranscript.trim());
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript, onTranscript, onError, isListening, language]);

  const toggleListening = () => {
    if (!isSupported) {
      if (onError) {
        onError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      // Reset transcript when starting new recording
      setTranscript('');
      setInterimTranscript('');

      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleStop = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-input-unsupported">
        <button
          type="button"
          className="voice-button disabled"
          disabled
          title="Speech recognition not supported"
        >
          🎤
        </button>
      </div>
    );
  }

  return (
    <div className="voice-input-container">
      <button
        type="button"
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        title={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening ? (
          <span className="mic-icon recording">🔴</span>
        ) : (
          <span className="mic-icon">🎤</span>
        )}
      </button>

      {isListening && (
        <div className="voice-status">
          <span className="listening-indicator">Listening...</span>
          {interimTranscript && (
            <div className="interim-transcript">{interimTranscript}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;