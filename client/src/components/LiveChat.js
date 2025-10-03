import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaComment,
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaUser,
} from "react-icons/fa";
import "./LiveChat.css";

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickReplies = [
    "How much does it cost?",
    "What subjects do you cover?",
    "How quickly can you complete my assignment?",
    "Is my information kept confidential?",
    "Do you guarantee A or B grades?",
  ];

  const botResponses = {
    cost: "Our pricing starts at $59 for assignments and varies based on complexity and urgency. Get a free quote to see your exact price!",
    subjects:
      "We cover Computer Science, IT, Business, Programming, Web & App Development, and Statistics. We can handle most academic subjects!",
    speed:
      "We can complete urgent assignments in as little as 24 hours, though 48-72 hours is ideal for best quality. Rush orders are available!",
    confidential:
      "Absolutely! We maintain complete anonymity and confidentiality. Your personal information is never shared with anyone.",
    guarantee:
      "Yes! We offer an A or B grade guarantee. If you don't get at least a B, we'll provide a full refund or redo the work.",
  };

  const handleQuickReply = (message) => {
    setInputMessage(message);
    handleSendMessage(message);
  };

  const handleSendMessage = (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: getBotResponse(message),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("cost") || lowerMessage.includes("price")) {
      return botResponses.cost;
    } else if (
      lowerMessage.includes("subject") ||
      lowerMessage.includes("cover")
    ) {
      return botResponses.subjects;
    } else if (
      lowerMessage.includes("quick") ||
      lowerMessage.includes("fast") ||
      lowerMessage.includes("time")
    ) {
      return botResponses.speed;
    } else if (
      lowerMessage.includes("confidential") ||
      lowerMessage.includes("private") ||
      lowerMessage.includes("anonymous")
    ) {
      return botResponses.confidential;
    } else if (
      lowerMessage.includes("guarantee") ||
      lowerMessage.includes("grade")
    ) {
      return botResponses.guarantee;
    } else {
      return "Thanks for your message! I'd be happy to help you with more specific information. You can also get a free quote by filling out our form or call us directly.";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2 }}
      >
        <FaComment />
        <span className="chat-badge">Live</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">
                  <FaRobot />
                </div>
                <div>
                  <h4>TutorGoat Support</h4>
                  <span className="chat-status">Online now</span>
                </div>
              </div>
              <button className="chat-close" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <p>
                    👋 Hi! I'm here to help with any questions about our
                    tutoring services.
                  </p>
                  <p>Choose a quick question below or type your own:</p>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.sender}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="message-avatar">
                    {message.sender === "user" ? <FaUser /> : <FaRobot />}
                  </div>
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  className="message bot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="message-avatar">
                    <FaRobot />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Replies */}
            {messages.length === 0 && (
              <div className="quick-replies">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    className="quick-reply"
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input */}
            <div className="chat-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="chat-input-field"
              />
              <button
                className="chat-send"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChat;
