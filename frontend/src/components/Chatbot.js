import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Star,
  Minimize2,
  Maximize2,
  ThumbsUp,
  ThumbsDown,
  Phone,
  ShoppingBag,
  Package
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callFormData, setCallFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    preferredTime: 'anytime',
    reason: '',
    message: ''
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Debug log
  useEffect(() => {
    console.log('🤖 Chatbot component mounted and ready!');
  }, []);

  // Generate session ID on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadChatHistory(storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async (sid) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/chatbot/history/${sid}`);
      if (response.data.success && response.data.data.messages.length > 0) {
        setMessages(response.data.data.messages);
      } else {
        // Send welcome message if no history
        sendWelcomeMessage();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      sendWelcomeMessage();
    }
  };

  const sendWelcomeMessage = () => {
    const welcomeMessage = {
      role: 'bot',
      content: "👋 Hello! Welcome to Sai Flow Water!\n\nI'm your RO virtual assistant, here to help you with:\n\n• 🛒 Product information and recommendations\n• 📦 Order tracking and status\n• 💳 Payment options\n• 🔧 Installation guidance\n• 🛡️ Warranty and service support\n• 📞 Request a call back\n\nHow can I assist you today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !sessionId) {
      console.log('❌ Cannot send: Empty message or no session ID');
      return;
    }

    console.log('📤 Sending message:', inputMessage);
    console.log('🔑 Session ID:', sessionId);

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      console.log('🌐 Making API call to chatbot...');
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(
        `${API_URL}/chatbot/message`,
        {
          message: inputMessage,
          sessionId
        },
        config
      );
      
      console.log('✅ Response received:', response.data);

      if (response.data.success) {
        const botMessage = {
          role: 'bot',
          content: response.data.data.message,
          timestamp: new Date(),
          metadata: {
            type: response.data.data.type,
            products: response.data.data.products,
            order: response.data.data.order,
            showCallButton: response.data.data.type === 'call_request' || response.data.data.showCallButton
          }
        };

        console.log('📩 Bot message metadata:', botMessage.metadata);
        console.log('🔘 Show call button?', botMessage.metadata.showCallButton);

        setTimeout(() => {
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', error.response?.data || error.message);
      setIsTyping(false);
      
      const errorMessage = {
        role: 'bot',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment or contact our support team at +91 8084924834",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleRating = async (selectedRating) => {
    setRating(selectedRating);
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/chatbot/rate`, {
        sessionId,
        rating: selectedRating
      });
      
      toast.success('Thank you for your feedback!');
      setShowRating(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleCallRequest = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!callFormData.customerName || !callFormData.customerPhone || !callFormData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(callFormData.customerPhone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(
        `${API_URL}/call-requests`,
        {
          ...callFormData,
          sessionId
        },
        config
      );

      if (response.data.success) {
        toast.success('Call request submitted! Our team will contact you shortly.', {
          icon: '📞',
          duration: 5000
        });
        
        setShowCallModal(false);
        setCallFormData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          preferredTime: 'anytime',
          reason: '',
          message: ''
        });

        // Add confirmation message to chat
        const confirmationMessage = {
          role: 'bot',
          content: `✅ **Call Request Confirmed!**\n\nThank you, ${callFormData.customerName}!\n\nOur team will call you at ${callFormData.customerPhone} ${callFormData.preferredTime !== 'anytime' ? `during ${callFormData.preferredTime}` : 'soon'}.\n\n**Expected Response Time:**\n• Urgent: Within 30 minutes\n• Regular: Within 2 hours\n\nIs there anything else I can help you with?`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, confirmationMessage]);
      }
    } catch (error) {
      console.error('Call request error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit call request');
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      sendWelcomeMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message, index) => {
    const isBot = message.role === 'bot';
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div className={`flex ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start max-w-[80%]`}>
          <div className={`flex-shrink-0 ${isBot ? 'mr-2' : 'ml-2'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isBot ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {isBot ? <Bot size={18} className="text-white" /> : <User size={18} className="text-white" />}
            </div>
          </div>
          
          <div>
            <div className={`rounded-lg px-4 py-2 ${
              isBot 
                ? 'bg-gray-100 text-gray-800' 
                : 'bg-blue-500 text-white'
            }`}>
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              
              {/* Render products if available */}
              {message.metadata?.products && message.metadata.products.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.metadata.products.slice(0, 3).map((product, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <h4 className="font-semibold text-gray-800 text-sm">{product.name}</h4>
                      <p className="text-blue-600 font-bold text-sm">₹{product.price?.toLocaleString('en-IN')}</p>
                      <button 
                        onClick={() => window.location.href = `/products/${product.id}`}
                        className="mt-2 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Render call request button */}
              {(() => {
                const shouldShow = message.metadata?.showCallButton || message.metadata?.type === 'call_request';
                console.log('🔍 Checking call button for message:', {
                  type: message.metadata?.type,
                  showCallButton: message.metadata?.showCallButton,
                  shouldShow,
                  fullMetadata: message.metadata
                });
                return shouldShow;
              })() && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowCallModal(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm shadow-md hover:shadow-lg"
                  >
                    <Phone size={16} />
                    Request Call Back
                  </button>
                </div>
              )}

              {/* Render quick action buttons */}
              {message.metadata?.type === 'greeting' && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInputMessage('Show me products')}
                    className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <ShoppingBag size={14} />
                    Products
                  </button>
                  <button
                    onClick={() => setInputMessage('Track my order')}
                    className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Package size={14} />
                    Track Order
                  </button>
                  <button
                    onClick={() => setInputMessage('Payment options')}
                    className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                  >
                    💳 Payments
                  </button>
                  <button
                    onClick={() => setShowCallModal(true)}
                    className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Phone size={14} />
                    Call Me
                  </button>
                </div>
              )}

              {/* Quick actions for product listings */}
              {(message.metadata?.type === 'product_price_list' || message.metadata?.type === 'product_catalog') && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputMessage('Show me offers')}
                    className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors text-xs font-medium"
                  >
                    🎉 View Offers
                  </button>
                  <button
                    onClick={() => setInputMessage('EMI options')}
                    className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                  >
                    💰 EMI Plans
                  </button>
                  <button
                    onClick={() => setShowCallModal(true)}
                    className="bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium"
                  >
                    📞 Expert Help
                  </button>
                </div>
              )}

              {/* Quick actions for order tracking */}
              {message.metadata?.type === 'order_tracking' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => window.location.href = `/order/${message.metadata.order?._id}`}
                    className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                  >
                    📋 View Details
                  </button>
                  <button
                    onClick={() => setInputMessage('I need help with my order')}
                    className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors text-xs font-medium"
                  >
                    🆘 Need Help
                  </button>
                </div>
              )}
            </div>
            
            <div className={`text-xs text-gray-500 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            style={{ 
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              border: 'none',
              outline: 'none'
            }}
            className="chatbot-button chatbot-button-pulse fixed bottom-6 right-6 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 z-[999] group"
          >
            <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '600px'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="chatbot-window fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-[999] flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Bot size={24} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">RO Assistant</h3>
                  <p className="text-xs text-blue-100">Online • Always here to help</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-blue-400 p-1.5 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
                <button
                  onClick={toggleChat}
                  className="hover:bg-blue-400 p-1.5 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="chatbot-messages flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                  {messages.map((message, index) => renderMessage(message, index))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start mb-4"
                    >
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                          <Bot size={18} className="text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-lg px-4 py-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Rating Section */}
                {showRating && (
                  <div className="border-t border-gray-200 p-3 bg-yellow-50">
                    <p className="text-sm text-gray-700 mb-2">How was your experience?</p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            size={24}
                            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4 bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </form>
                  
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Powered by Sai Flow Water</span>
                    {messages.length > 2 && !showRating && (
                      <button
                        onClick={() => setShowRating(true)}
                        className="text-blue-500 hover:text-blue-600 flex items-center space-x-1"
                      >
                        <ThumbsUp size={14} />
                        <span>Rate chat</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Request Modal */}
      <AnimatePresence>
        {showCallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
            onClick={() => setShowCallModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <Phone size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Request a Call Back</h3>
                    <p className="text-sm text-gray-500">We'll call you shortly</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCallModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCallRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={callFormData.customerName}
                    onChange={(e) => setCallFormData({ ...callFormData, customerName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={callFormData.customerPhone}
                    onChange={(e) => setCallFormData({ ...callFormData, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={callFormData.customerEmail}
                    onChange={(e) => setCallFormData({ ...callFormData, customerEmail: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Preferred Time <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={callFormData.preferredTime}
                    onChange={(e) => setCallFormData({ ...callFormData, preferredTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="anytime">Anytime</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">Evening (4 PM - 7 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Reason for Call <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={callFormData.reason}
                    onChange={(e) => setCallFormData({ ...callFormData, reason: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="Product Inquiry">Product Inquiry</option>
                    <option value="Order Support">Order Support</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Installation Help">Installation Help</option>
                    <option value="Warranty Claim">Warranty Claim</option>
                    <option value="Return/Refund">Return/Refund</option>
                    <option value="General Query">General Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    value={callFormData.message}
                    onChange={(e) => setCallFormData({ ...callFormData, message: e.target.value })}
                    placeholder="Any specific details you'd like to share..."
                    rows="3"
                    maxLength="500"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{callFormData.message.length}/500 characters</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCallModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
