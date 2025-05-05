import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const ChatPanel = ({ projectName }) => {
  const { projectId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messageEndRef = useRef(null);
  
  // Mock load messages
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          id: '1',
          user: { id: '2', name: 'John Doe' },
          content: "Hi team! I've just pushed the latest changes to the repository. Please check and let me know if you have any feedback.",
          time: '10:30 AM',
          own: false
        },
        {
          id: '2',
          user: { id: '3', name: 'Sarah Miller' },
          content: "Great! I'll take a look at it this afternoon.",
          time: '10:45 AM',
          own: false
        },
        {
          id: '3',
          user: { id: '1', name: 'You' },
          content: "Thanks for the update. I've been working on the design mockups and should have them ready by EOD.",
          time: '11:15 AM',
          own: true
        },
        {
          id: '4',
          user: { id: '4', name: 'Michael Chen' },
          content: "I'm reviewing the API documentation now. There are a few endpoints we need to discuss in the next meeting.",
          time: '11:32 AM',
          own: false
        },
        {
          id: '5',
          user: { id: '2', name: 'John Doe' },
          content: "Sounds good. I'll add it to the meeting agenda.",
          time: '11:40 AM',
          own: false
        }
      ]);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [projectId]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMsg = {
      id: `new-${Date.now()}`,
      user: { id: '1', name: 'You' },
      content: newMessage.trim(),
      time: formattedTime,
      own: true
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };
  
  const ChatMessage = ({ message }) => {
    const { user, content, time, own } = message;
    
    return (
      <div className={`flex mb-4 ${own ? 'justify-end' : 'justify-start'}`}>
        {!own && (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-semibold flex-shrink-0 mr-2">
            {user.name[0]}
          </div>
        )}
        <div className={`max-w-[70%]`}>
          {!own && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">{user.name}</div>
          )}
          <div className={`p-3 rounded-2xl ${own ? 
            'bg-blue-500 text-white rounded-tr-none' : 
            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
          }`}>
            {content}
          </div>
          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${own ? 'text-right' : 'text-left'}`}>
            {time}
          </div>
        </div>
        {own && (
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold flex-shrink-0 ml-2">
            Y
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="py-4 px-6 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <div>
            <h2 className="text-lg font-semibold">Project Chat</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">{projectName || `Project ${projectId}`}</div>
          </div>
        </div>
        
        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className="animate-pulse flex items-start">
                    {index % 2 === 0 && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-2" />}
                    <div className="space-y-2">
                      {index % 2 === 0 && <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />}
                      <div className="h-16 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    </div>
                    {index % 2 !== 0 && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 ml-2" />}
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length > 0 ? (
            <div>
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messageEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-300 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No messages yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                Start the conversation with your team members
              </p>
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700"
              />
            </div>
            <button
              type="submit"
              className={`ml-2 p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex-shrink-0 transition-colors ${
                !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!newMessage.trim()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;