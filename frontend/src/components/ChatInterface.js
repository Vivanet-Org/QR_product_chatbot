import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/api';
import VoiceInput from './VoiceInput';

const ChatInterface = ({ product }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message when product loads
  useEffect(() => {
    if (product) {
      setMessages([
        {
          type: 'bot',
          content: `Hi! I'm here to help you with questions about the ${product.name}. What would you like to know?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [product]);

  const handleVoiceTranscript = (transcript) => {
    setInputMessage(transcript);
    setVoiceError('');
  };

  const handleVoiceError = (error) => {
    setVoiceError(error);
    setTimeout(() => setVoiceError(''), 5000);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(product.id, inputMessage);

      const botMessage = {
        type: 'bot',
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="product-header">
        <h2>{product.name}</h2>
        <p>{product.short_description}</p>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.type}`}
          >
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot loading">
            <div className="message-content">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about this product..."
          disabled={isLoading}
          className="message-input"
        />
        <VoiceInput
          onTranscript={handleVoiceTranscript}
          onError={handleVoiceError}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="send-button"
        >
          Send
        </button>
      </form>
      {voiceError && (
        <div className="voice-error-message">{voiceError}</div>
      )}
    </div>
  );
};

export default ChatInterface;