"use client";
import { useState, useEffect, useRef } from "react";

const WhatsAppIcon = ({ size = 28, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.484 3.188z"/>
  </svg>
);

const SendIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
  </svg>
);

const CloseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const MinimizeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TypingIndicator = () => (
  <div className="flex items-center space-x-1 p-3 bg-gray-100 rounded-lg max-w-xs">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
    <span className="text-xs text-gray-500 ml-2">Support is typing...</span>
  </div>
);

export default function LiveChatWidget({
  phoneNumber = "2349127768471",
  companyName = "Support Team",
  welcomeMessage = "Hi there! 👋 How can we help you today?",
  companyAvatar = null as string | null,
  position = "bottom-right",
  autoResponses = {
    greeting: "Thanks for reaching out! We'll get back to you shortly.",
    hours: "We're currently offline. Please leave a message and we'll respond within 24 hours.",
    fallback: "We've received your message. Our team will respond soon!"
  },
  businessHours = {
    start: "09:00",
    end: "17:00",
    days: [1, 2, 3, 4, 5] // Mon-Fri
  }
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [messages, setMessages] = useState<{id:number;text:string;sender:'user'|'support';timestamp:string;}[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkBusinessHours = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.toTimeString().slice(0, 5);
      const isBusinessDay = businessHours.days.includes(currentDay as number);
      const isBusinessTime = currentTime >= (businessHours.start as string) && currentTime <= (businessHours.end as string);
      setIsOnline(isBusinessDay && isBusinessTime);
    };
    checkBusinessHours();
    const interval = setInterval(checkBusinessHours, 60000);
    return () => clearInterval(interval);
  }, [businessHours]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !chatStarted) {
      const welcomeMsg = {
        id: Date.now(),
        text: welcomeMessage,
        sender: 'support' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, chatStarted, welcomeMessage]);

  const simulateResponse = (userMessage: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let responseText = autoResponses.fallback as string;
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        responseText = autoResponses.greeting as string;
      } else if (!isOnline) {
        responseText = autoResponses.hours as string;
      }
      const response = {
        id: Date.now(),
        text: responseText,
        sender: 'support' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, response]);
      if (isMinimized) setUnreadCount(prev => prev + 1);
    }, 2000 + Math.random() * 3000);
  };

  const sendToWhatsApp = (message: string, userInfo: { name?: string; email?: string }) => {
    const timestamp = new Date().toLocaleString();
    const whatsappMessage = `🔔 NEW WEBSITE CHAT MESSAGE\n\n` +
      `👤 User: ${userInfo.name || 'Anonymous'}\n` +
      `📧 Email: ${userInfo.email || 'Not provided'}\n` +
      `🕒 Time: ${timestamp}\n\n` +
      `💬 Message: ${message}\n\n` +
      `---\n` +
      `Reply to this message to continue the conversation.`;
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappURL, '_blank');
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user' as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    // We don't have email field; pass name only
    sendToWhatsApp(currentMessage, { name: userName });
    simulateResponse(currentMessage);
    setCurrentMessage("");
    setChatStarted(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setUnreadCount(0);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const minimizeChat = () => setIsMinimized(true);

  const positionClasses: Record<string, string> = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 font-sans`}>
      {(isOpen || isMinimized) && (
        <div className={`bg-white shadow-2xl rounded-2xl border border-gray-200 transition-all duration-300 ease-in-out mb-4 ${
          isMinimized
            ? 'w-72 sm:w-80 h-16'
            : 'w-[92vw] max-w-sm h-[70vh] sm:w-96 sm:h-[32rem]'
        }`}>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center relative">
                {companyAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={companyAvatar} alt={companyName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <WhatsAppIcon size={20} color="white" />
                )}
                {isOnline && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{companyName}</h3>
                <p className="text-xs opacity-90">{isOnline ? 'Online now' : "We'll reply soon"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
              {!isMinimized && (
                <button onClick={minimizeChat} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors" aria-label="Minimize chat">
                  <MinimizeIcon size={16} />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors" aria-label="Close chat">
                <CloseIcon size={16} />
              </button>
            </div>
          </div>
          {!isMinimized && (
            <>
              {!chatStarted && (
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3">Please introduce yourself:</p>
                  <div className="space-y-2">
                    <input type="text" placeholder="Your name" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-600 font-medium" />
                    <input type="tel" placeholder="Your phone number (optional)" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-600 font-medium" />
                  </div>
                </div>
              )}
              <div ref={chatContainerRef} className={`flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50 ${chatStarted ? 'h-[45vh] sm:h-80' : 'h-[38vh] sm:h-64'}`} style={{ maxHeight: chatStarted ? '45vh' : '38vh' }}>
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${message.sender === 'user' ? 'bg-green-500 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'}`}>
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-green-100' : 'text-gray-500'}`}>{message.timestamp}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <TypingIndicator />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-600 font-medium disabled:text-gray-600 disabled:placeholder-gray-400" rows={2} disabled={!chatStarted && !userName.trim()} />
                  </div>
                  <button onClick={handleSendMessage} disabled={!currentMessage.trim() || (!chatStarted && !userName.trim())} className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Send message">
                    <SendIcon size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">💬 Messages are forwarded to our WhatsApp</p>
              </div>
            </>
          )}
        </div>
      )}
      <button onClick={toggleChat} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:ring-4 focus:ring-green-200 focus:outline-none relative group" aria-label={isOpen ? 'Close chat' : 'Open chat'}>
        {unreadCount > 0 && (<div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center border-2 border-white">{unreadCount > 9 ? '9+' : unreadCount}</div>)}
        {isOnline && !isOpen && (<div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse" />)}
        <WhatsAppIcon size={28} />
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          {isOpen ? 'Close chat' : 'Chat with us'}
          <div className="absolute top-full right-4 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </button>
    </div>
  );
}
