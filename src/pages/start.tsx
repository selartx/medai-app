import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Conversation, conversationManager } from '../utils/aiHelper';

export default function StartPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{ id: number; role: 'user' | 'assistant'; content: string; timestamp?: number }>>([
    { id: 1, role: 'assistant', content: 'Welcome to MedAI! Ready for a quick quiz or to chat about a topic?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Authentication check - redirect if not authenticated or not verified
  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      // Note: We no longer need to check emailVerified here since
      // users can only log in after they've verified their email
    }
  }, [currentUser, authLoading, router]);

  // Load conversation history on component mount
  useEffect(() => {
    const savedConversations = conversationManager.getAllConversations();
    setConversations(savedConversations);
    
    // Try to load current conversation or create new one
    const currentConvId = localStorage.getItem('medai-current-conversation');
    if (currentConvId) {
      const foundConv = savedConversations.find(conv => conv.id === currentConvId);
      if (foundConv) {
        setCurrentConversation(foundConv);
        setMessages(foundConv.messages);
        return;
      }
    }
    
    // Create new conversation if none exists or current one not found
    const newConv = conversationManager.createNewConversation();
    setCurrentConversation(newConv);
    setMessages(newConv.messages);
    localStorage.setItem('medai-current-conversation', newConv.id);
  }, []);

  // Save current conversation whenever messages change
  useEffect(() => {
    if (currentConversation && messages.length > 0) {
      const updatedConv = {
        ...currentConversation,
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp || Date.now()
        }))
      };
      
      conversationManager.saveConversation(updatedConv);
      
      // Update conversations list
      const allConversations = conversationManager.getAllConversations();
      setConversations(allConversations);
    }
  }, [messages]); // Removed currentConversation dependency to prevent infinite loop

  // Auto-scroll to bottom when messages change, but not during typing
  useEffect(() => {
    if (!isTyping) {
      scrollToBottom();
    }
  }, [messages]);

  // Auto-scroll once when typing starts
  useEffect(() => {
    if (isTyping && typingText === '') {
      scrollToBottom();
    }
  }, [isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Typing animation effect
  const typeMessage = (text: string, callback: () => void) => {
    setIsTyping(true);
    setTypingText('');
    let i = 0;
    
    const typeChar = () => {
      if (i < text.length) {
        setTypingText(prev => prev + text.charAt(i));
        i++;
        setTimeout(typeChar, 8);
      } else {
        setIsTyping(false);
        setTypingText('');
        callback();
      }
    };
    
    typeChar();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message immediately
    const newMessages = [
      ...messages,
      { id: Date.now(), role: 'user' as const, content: userMessage, timestamp: Date.now() },
    ];
    setMessages(newMessages);

    setIsLoading(true);

    try {
      // Prepare conversation history (exclude the welcome message for context)
      const conversationHistory = newMessages
        .filter(msg => msg.id !== 1) // Remove welcome message
        .map(msg => ({ role: msg.role, content: msg.content }));

      // Call your AI API with conversation context
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          input: userMessage,
          conversationHistory: conversationHistory.slice(0, -1)
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Use typing animation for AI response
        typeMessage(data.response, () => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now(), role: 'assistant', content: data.response, timestamp: Date.now() },
          ]);
        });
      } else {
        // Handle different types of errors with specific messages
        let errorMessage = data.error || 'Sorry, I encountered an error. Please try again.';
        
        if (data.retry) {
          errorMessage += ' You can try again in a few seconds.';
        }
        
        typeMessage(errorMessage, () => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now(), role: 'assistant', content: errorMessage, timestamp: Date.now() },
          ]);
        });
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
      const errorMessage = 'Sorry, I\'m having trouble connecting. Please check your internet connection and try again.';
      
      typeMessage(errorMessage, () => {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: 'assistant', content: errorMessage, timestamp: Date.now() },
        ]);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    const newConv = conversationManager.createNewConversation();
    setCurrentConversation(newConv);
    setMessages(newConv.messages);
    localStorage.setItem('medai-current-conversation', newConv.id);
    setShowHistory(false);
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setMessages(conversation.messages);
    localStorage.setItem('medai-current-conversation', conversation.id);
    setShowHistory(false);
  };

  const deleteConversation = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent loading the conversation
    
    if (conversations.length <= 1) {
      // If this is the last conversation, create a new one
      startNewConversation();
    } else if (currentConversation?.id === conversationId) {
      // If deleting current conversation, switch to the most recent other one
      const otherConversations = conversations.filter(conv => conv.id !== conversationId);
      loadConversation(otherConversations[0]);
    }
    
    conversationManager.deleteConversation(conversationId);
    setConversations(conversationManager.getAllConversations());
  };

  const exportConversation = (conversation: Conversation) => {
    const chatText = conversation.messages
      .filter(msg => msg.id !== 1) // Exclude welcome message
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medai-${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date(conversation.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllConversations = () => {
    conversationManager.clearAllConversations();
    startNewConversation();
    setConversations([]);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-purple-100 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-4 md:py-6 flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 rounded-xl border border-purple-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600" />
            <h1 className="text-lg md:text-xl font-semibold text-purple-800">MedAI</h1>
            <span className="hidden md:inline text-sm text-purple-700/80">Student Mode</span>
          </div>
          <nav className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="text-sm font-medium text-purple-700 hover:text-purple-800 px-3 py-1.5 rounded-lg hover:bg-purple-50"
              title="Chat History"
            >
              📚 History
            </button>
            <Link href="/" className="text-sm font-medium text-purple-700 hover:text-purple-800">Home</Link>
          </nav>
        </header>

        {/* Chat area */}
        <section className="mt-4 flex-1 overflow-hidden rounded-2xl border border-purple-200 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/55 shadow">
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-purple-200/70 px-4 md:px-6 py-3 bg-gradient-to-r from-purple-50 to-white/0">
            <div>
              <h2 className="font-semibold text-purple-900">Chat & Quizzes</h2>
              <p className="text-sm text-purple-800/70">Ask anything or start a quiz. Light, calm, and focused.</p>
            </div>
            <button
              type="button"
              onClick={startNewConversation}
              className="hidden md:inline-flex items-center justify-center rounded-full border border-purple-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50"
            >
              New Chat
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="h-[calc(100vh-280px)] md:h-[calc(100vh-300px)] overflow-y-auto px-3 md:px-6 py-4 space-y-4"
          >
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    'max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm md:text-base shadow-sm ' +
                    (m.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-white/80 text-slate-900 border border-purple-200 rounded-bl-md')
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            
            {/* Typing Animation */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm md:text-base shadow-sm bg-white/80 text-slate-900 border border-purple-200 rounded-bl-md">
                  {typingText}
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            )}
            
            {/* Loading Animation */}
            {isLoading && !isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm md:text-base shadow-sm bg-white/80 text-slate-900 border border-purple-200 rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-purple-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-3 md:px-4 py-3">
            <div className="mx-auto max-w-3xl flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Send a message or type /quiz to start"
                disabled={isLoading}
                className="flex-1 resize-none rounded-xl border border-purple-300 bg-white/90 px-3 py-2 text-sm md:text-base shadow-sm placeholder:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60 disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="inline-flex items-center justify-center rounded-full bg-purple-600 text-white px-4 py-2 font-semibold shadow-sm hover:bg-purple-700 active:bg-purple-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </section>

        {/* Conversation History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-purple-200">
                <div>
                  <h2 className="text-xl font-semibold text-purple-900">Conversation History</h2>
                  <p className="text-sm text-purple-600 mt-1">Switch between your previous conversations</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={startNewConversation}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    ➕ New Chat
                  </button>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-purple-500 hover:text-purple-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex h-[70vh]">
                {/* Conversations List */}
                <div className="w-1/3 border-r border-purple-200 bg-purple-50/50">
                  <div className="p-4 border-b border-purple-200 bg-purple-100/50">
                    <h3 className="font-medium text-purple-900">Your Conversations</h3>
                    <p className="text-xs text-purple-600 mt-1">{conversations.length} total</p>
                  </div>
                  <div className="overflow-y-auto h-full">
                    {conversations.length === 0 ? (
                      <div className="p-6 text-center text-purple-600">
                        <p>No conversations yet.</p>
                        <p className="text-sm text-purple-500 mt-2">Start chatting to create your first conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {conversations.map((conv) => (
                          <div
                            key={conv.id}
                            onClick={() => loadConversation(conv)}
                            className={`group relative cursor-pointer rounded-lg p-3 hover:bg-purple-100 transition-colors ${
                              currentConversation?.id === conv.id ? 'bg-purple-200 ring-2 ring-purple-300' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-purple-900 truncate">
                                  {conv.title}
                                </p>
                                <p className="text-xs text-purple-600 mt-1">
                                  {formatDate(conv.updatedAt)} • {conv.messages.length - 1} messages
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    exportConversation(conv);
                                  }}
                                  className="p-1 hover:bg-purple-200 rounded text-purple-600"
                                  title="Export conversation"
                                >
                                  📄
                                </button>
                                <button
                                  onClick={(e) => deleteConversation(conv.id, e)}
                                  className="p-1 hover:bg-red-100 rounded text-red-600"
                                  title="Delete conversation"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Conversation Preview */}
                <div className="flex-1 flex flex-col">
                  {currentConversation ? (
                    <>
                      <div className="p-4 border-b border-purple-200 bg-white">
                        <h3 className="font-medium text-purple-900">{currentConversation.title}</h3>
                        <p className="text-xs text-purple-600 mt-1">
                          Created {new Date(currentConversation.createdAt).toLocaleDateString()} • 
                          Last updated {formatDate(currentConversation.updatedAt)}
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {currentConversation.messages.filter(msg => msg.id !== 1).map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                              msg.role === 'user' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-purple-50 text-purple-900 border border-purple-200'
                            }`}>
                              <div className="text-xs opacity-70 mb-1">
                                {msg.role === 'user' ? 'You' : 'MedAI'}
                              </div>
                              <div>{msg.content}</div>
                            </div>
                          </div>
                        ))}
                        {currentConversation.messages.length <= 1 && (
                          <div className="text-center text-purple-600 py-8">
                            <p>This conversation hasn't started yet.</p>
                            <p className="text-sm text-purple-500 mt-2">Click "Load Conversation" to continue chatting!</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-purple-600">
                      <div className="text-center">
                        <p>Select a conversation to preview</p>
                        <p className="text-sm text-purple-500 mt-2">Choose from your conversation history on the left</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center p-4 border-t border-purple-200 bg-purple-50">
                <div className="text-sm text-purple-600">
                  {conversations.length === 0 ? 'No conversations' : `${conversations.length} conversation${conversations.length === 1 ? '' : 's'}`}
                </div>
                <div className="flex gap-3">
                  {conversations.length > 0 && (
                    <button
                      onClick={clearAllConversations}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      🗑️ Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistory(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}