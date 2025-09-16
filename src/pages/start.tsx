import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

export default function StartPage() {
  const [messages, setMessages] = useState<Array<{ id: number; role: 'user' | 'assistant'; content: string }>>([
    { id: 1, role: 'assistant', content: 'Welcome to MedAI! Ready for a quick quiz or to chat about a topic?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('medai-chat-history');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('medai-chat-history', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom when messages change, but not during typing
  useEffect(() => {
    if (!isTyping) {
      scrollToBottom();
    }
  }, [messages]);

  // Auto-scroll once when typing starts
  useEffect(() => {
    if (isTyping && typingText === '') {
      // Only scroll when typing just started (typingText is empty)
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
        setTimeout(typeChar, 8); // Much faster: 8ms instead of 20ms
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
      { id: Date.now(), role: 'user' as const, content: userMessage },
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
          conversationHistory: conversationHistory.slice(0, -1) // Don't include the message we just added
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Use typing animation for AI response
        typeMessage(data.response, () => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now(), role: 'assistant', content: data.response },
          ]);
        });
      } else {
        // Handle different types of errors with specific messages
        let errorMessage = data.error || 'Sorry, I encountered an error. Please try again.';
        
        // If it's a retryable error (like overloaded), suggest waiting
        if (data.retry) {
          errorMessage += ' You can try again in a few seconds.';
        }
        
        // Use typing animation for error messages too
        typeMessage(errorMessage, () => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now(), role: 'assistant', content: errorMessage },
          ]);
        });
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
      const errorMessage = 'Sorry, I\'m having trouble connecting. Please check your internet connection and try again.';
      
      typeMessage(errorMessage, () => {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: 'assistant', content: errorMessage },
        ]);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportChatHistory = () => {
    const chatText = messages
      .filter(msg => msg.id !== 1) // Exclude welcome message
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearChatHistory = () => {
    const welcomeMessage = [{ id: 1, role: 'assistant' as const, content: 'Welcome to MedAI! Ready for a quick quiz or to chat about a topic?' }];
    setMessages(welcomeMessage);
    localStorage.setItem('medai-chat-history', JSON.stringify(welcomeMessage));
    setShowHistory(false);
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
              onClick={() => setMessages([{ id: 1, role: 'assistant', content: 'Welcome to MedAI! Ready for a quick quiz or to chat about a topic?' }])}
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
                    handleSend();
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

        {/* Chat History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-purple-200">
                <h2 className="text-xl font-semibold text-purple-900">Chat History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-purple-500 hover:text-purple-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {messages.length <= 1 ? (
                  <div className="text-center text-purple-600 py-8">
                    <p>No conversation history yet.</p>
                    <p className="text-sm text-purple-500 mt-2">Start chatting to see your conversation history here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.filter(msg => msg.id !== 1).map((msg, index) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === 'user' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-purple-50 text-purple-900 border border-purple-200'
                        }`}>
                          <div className="text-xs opacity-70 mb-1">
                            {msg.role === 'user' ? 'You' : 'MedAI'}
                          </div>
                          <div className="text-sm">{msg.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center p-6 border-t border-purple-200 bg-purple-50">
                <div className="text-sm text-purple-600">
                  {messages.length <= 1 ? 'No messages' : `${messages.length - 1} messages`}
                </div>
                <div className="flex gap-3">
                  {messages.length > 1 && (
                    <>
                      <button
                        onClick={exportChatHistory}
                        className="px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-lg hover:bg-purple-50"
                      >
                        📄 Export
                      </button>
                      <button
                        onClick={clearChatHistory}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        🗑️ Clear
                      </button>
                    </>
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
