import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { post } from 'aws-amplify/api';

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

const WritingAnimation: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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

  const formatAIResponse = (content) => {
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
      const { body } = await post({
        apiName: 'Api',
        path: 'invoke_chat',
        options: {
          body: {
            conversationId: section.originalSection.section_id
          }
        }
      }).response;
      const response = await body.json();
      response.map((message: any) => {
        if (message.type === 'ai' && message.content) {
          const content = JSON.parse(message.content)
          message.content = formatAIResponse(content);
        } else {
          message.content = message.content;
        }
      });

      setMessages(response);
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
            conversationId: section.originalSection.section_id,
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
              conversationId: section.originalSection.section_id,
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
      <div className="bg-white rounded-lg shadow-md p-4 w-3/4 max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Chat about: {section.tailoredSection.header}</h3>
          <div>
            <button
              onClick={resetChat}
              className="text-blue-500 hover:text-blue-700 focus:outline-none mr-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="h-64 overflow-y-auto mb-4 p-2 bg-gray-100 rounded">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.type === 'human' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${message.type === 'human' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </span>
            </div>
          ))}
          {isWaiting && (
            <div className="text-left mb-2">
              <span className="inline-block p-2 rounded-lg bg-gray-300">
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
            className="flex-grow border rounded-l-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Type your message..."
            disabled={isWaiting}
          />
          <button
            onClick={handleSendMessage}
            className={`bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isWaiting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isWaiting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;