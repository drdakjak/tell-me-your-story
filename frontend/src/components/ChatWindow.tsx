import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { post } from 'aws-amplify/api';
import { IoCloseOutline, IoRefreshOutline, IoSendOutline } from 'react-icons/io5';

interface ChatWindowProps {
  section: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTailoredContent: (content: string) => void;
}

interface Message {
  type: 'human' | 'ai';
  content: string;
}

interface AIResponse {
  text: string;
  tailored_section: string;
}

const WritingAnimation: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({
  section,
  isOpen,
  onClose,
  onUpdateTailoredContent,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      invokeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatAIResponse = (content: AIResponse) => {
    let message = content.text;
    if (content.tailored_section) {
      message += "\n\n";
      message += content.tailored_section;
    }
    return message;
  };

  const invokeChat = async () => {
    setIsWaiting(true);
    try {
      const restOperation = post({
        apiName: 'Api',
        path: 'invoke_chat',
        options: {
          body: {
            conversationId: section.tailoredSection.section_id
          }
        }
      });

      const { body } = await restOperation.response;
      const response = await body.json();
      if (Array.isArray(response)) {
        const formattedResponse = response.map((message: Message) => {
          if (message.type === 'ai' && message.content) {
            const content = JSON.parse(message.content);
            message.content = formatAIResponse(content);
          }
          return message;
        });
        setMessages(formattedResponse);
      }
    } catch (error) {
      console.error('Error invoking chat:', error);
    } finally {
      setIsWaiting(false);
    }
  };

  const resetChat = async () => {
    setIsWaiting(true);
    try {
      await post({
        apiName: 'Api',
        path: 'reset_chat',
        options: {
          body: {
            conversationId: section.tailoredSection.section_id,
          }
        }
      }).response;

      invokeChat();
    } catch (error) {
      console.error('Error resetting chat:', error);
      setIsWaiting(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      const newMessage: Message = { type: 'human', content: inputMessage };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      setIsWaiting(true);

      try {
        const { body } = await post({
          apiName: 'Api',
          path: 'chat_resume',
          options: {
            body: {
              conversationId: section.tailoredSection.section_id,
              tailoredSection: section.tailoredSection.content,
              originalSection: section.originalSection.content,
              message: inputMessage,
            }
          }
        }).response;
        let response = await body.json();
        
        const botResponse: Message = {
          type: 'ai',
          content: formatAIResponse(response)
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);

        if (response.tailored_section) {
          onUpdateTailoredContent(response.tailored_section);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage: Message = {
          type: 'ai',
          content: "Sorry, there was an error processing your message. Please try again."
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsWaiting(false);
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Chat about: {section.tailoredSection.header}</h3>
          <div className="flex space-x-2">
            <button
              onClick={resetChat}
              className="text-blue-600 hover:text-blue-800 focus:outline-none transition-colors duration-200"
              title="Reset Chat"
            >
              <IoRefreshOutline className="h-6 w-6" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-200"
              title="Close"
            >
              <IoCloseOutline className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((message, index) => (
            <div key={index} className={`mb-3 ${message.type === 'human' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-3 rounded-lg ${message.type === 'human' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <ReactMarkdown className="markdown-content">{message.content}</ReactMarkdown>
              </span>
            </div>
          ))}
          {isWaiting && (
            <div className="text-left mb-3">
              <span className="inline-block p-3 rounded-lg bg-gray-200">
                <WritingAnimation />
              </span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-grow border-2 border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type your message..."
            disabled={isWaiting}
          />
          <button
            onClick={handleSendMessage}
            className={`bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${isWaiting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isWaiting}
          >
            <IoSendOutline className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;