import React, { useState } from 'react';

interface ChatWindowProps {
  sectionHeader: string;
  sectionContent: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  text: string;
  isUser: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ sectionHeader, sectionContent, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      const newMessage: Message = { text: inputMessage, isUser: true };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      
      // Simulated response (replace with actual API call in a real application)
      setTimeout(() => {
        const botResponse: Message = { 
          text: "Thank you for your message. How can I assist you with this section?", 
          isUser: false 
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
      }, 1000);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mt-4 border rounded-lg shadow-md p-4 bg-white relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 className="text-lg font-semibold mb-2">Chat about: {sectionHeader}</h3>
      <div className="h-48 overflow-y-auto mb-4 p-2 bg-gray-100 rounded">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.isUser ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-grow border rounded-l-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-1 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;