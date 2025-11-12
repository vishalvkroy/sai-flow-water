import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatbotSimple = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [callFormData, setCallFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    preferredTime: 'anytime',
    reason: 'Product Inquiry',
    message: ''
  });
  const messagesEndRef = useRef(null);

  // Generate session ID
  useEffect(() => {
    const sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(sid);
    console.log('🆔 Simple Chatbot Session ID:', sid);
  }, []);

  // Send welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'bot',
        content: '👋 Hello! Welcome to Sai Flow Water!\n\nI\'m your RO virtual assistant. How can I help you today?\n\n• Product information\n• Order tracking\n• Payment options\n• Installation help\n• Warranty details',
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !sessionId) {
      console.log('❌ Cannot send: Empty message or no session');
      return;
    }

    console.log('📤 [Simple] Sending:', inputMessage);

    const userMsg = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const msgToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL}/chatbot/message`, {
        message: msgToSend,
        sessionId
      });

      console.log('✅ [Simple] Response:', response.data);

      if (response.data.success) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'bot',
            content: response.data.data.message,
            timestamp: new Date(),
            metadata: {
              type: response.data.data.type,
              showCallButton: response.data.data.showCallButton || response.data.data.type === 'call_request'
            }
          }]);
          setIsTyping(false);
        }, 500);
      }
    } catch (error) {
      console.error('❌ [Simple] Error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date()
      }]);
    }
  };

  const handleCallRequestSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (!/^[0-9]{10}$/.test(callFormData.customerPhone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    const requestData = {
      customerName: callFormData.customerName.trim(),
      customerPhone: callFormData.customerPhone.trim(),
      customerEmail: callFormData.customerEmail.trim(),
      preferredTime: callFormData.preferredTime,
      reason: callFormData.reason,
      message: callFormData.message.trim(),
      sessionId
    };

    console.log('📤 Submitting call request:', requestData);
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL}/call-requests`, requestData);

      console.log('✅ Call request response:', response.data);

      if (response.data.success) {
        setShowCallModal(false);
        setMessages(prev => [...prev, {
          role: 'bot',
          content: '✅ **Call Request Submitted Successfully!**\n\nThank you! We\'ve received your call request.\n\n📞 Our team will contact you at: ' + callFormData.customerPhone + '\n⏰ Preferred time: ' + callFormData.preferredTime + '\n\nExpected callback time:\n• Urgent: Within 30 minutes\n• Regular: Within 2 hours\n\nYou can continue shopping or ask me anything else!',
          timestamp: new Date()
        }]);
        
        // Reset form
        setCallFormData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          preferredTime: 'anytime',
          reason: 'Product Inquiry',
          message: ''
        });
      }
    } catch (error) {
      console.error('❌ Call request error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 'Failed to submit call request. Please try again.';
      alert(errorMessage);
      
      setMessages(prev => [...prev, {
        role: 'bot',
        content: '❌ **Error:** ' + errorMessage,
        timestamp: new Date()
      }]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999999 }}>
      {/* Simple Button - Always Visible */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          💬
        </button>
      )}

      {/* Simple Chat Window */}
      {isOpen && (
        <div style={{
          width: '350px',
          height: '500px',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>🤖 RO Assistant</h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Online • Here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '5px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            background: '#f5f5f5'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '10px'
              }}>
                <div style={{
                  background: msg.role === 'user' ? '#667eea' : 'white',
                  color: msg.role === 'user' ? 'white' : '#333',
                  padding: '12px',
                  borderRadius: '10px',
                  maxWidth: '80%',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {msg.content}
                </div>
                
                {/* Call Request Button */}
                {msg.metadata?.showCallButton && (
                  <button
                    onClick={() => setShowCallModal(true)}
                    style={{
                      marginTop: '10px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    📞 Request Call Back
                  </button>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                <div style={{
                  background: 'white',
                  padding: '12px',
                  borderRadius: '10px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  <span>Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} style={{
            padding: '15px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <button 
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: inputMessage.trim() && !isTyping ? 1 : 0.5
              }}>
              📤
            </button>
          </form>
        </div>
      )}

      {/* Call Request Modal */}
      {showCallModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000000
        }} onClick={() => setShowCallModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#333' }}>📞 Request a Call Back</h2>
            
            <form onSubmit={handleCallRequestSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={callFormData.customerName}
                  onChange={(e) => setCallFormData({...callFormData, customerName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Your full name"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={callFormData.customerPhone}
                  onChange={(e) => setCallFormData({...callFormData, customerPhone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={callFormData.customerEmail}
                  onChange={(e) => setCallFormData({...callFormData, customerEmail: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="your.email@example.com"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>
                  Preferred Time
                </label>
                <select
                  value={callFormData.preferredTime}
                  onChange={(e) => setCallFormData({...callFormData, preferredTime: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="anytime">Anytime</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 7 PM)</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>
                  Reason for Call
                </label>
                <select
                  value={callFormData.reason}
                  onChange={(e) => setCallFormData({...callFormData, reason: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Product Inquiry">Product Inquiry</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Order Support">Order Support</option>
                  <option value="Installation">Installation</option>
                  <option value="Service Request">Service Request</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>
                  Additional Message (Optional)
                </label>
                <textarea
                  value={callFormData.message}
                  onChange={(e) => setCallFormData({...callFormData, message: e.target.value})}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  placeholder="Tell us more about your query..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCallModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default ChatbotSimple;
