import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Conversation, conversationManager, testFirebaseConnection } from '../utils/aiHelper';

export default function StartPage() {
  const { currentUser, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{ id: number; role: 'user' | 'assistant'; content: string; timestamp?: number }>>([
    { id: 1, role: 'assistant', content: 'Welcome to MedAI! Ready for a quick quiz or to chat about a topic?', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Authentication check - redirect if not authenticated or not verified
  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.replace('/login');
        return;
      }
    }
  }, [currentUser, authLoading, router]);

  // Define startNewConversation function using useCallback
  const startNewConversation = useCallback(async () => {
    if (!currentUser?.uid) return;
    
    try {
      // Create a temporary conversation object (not saved to Firestore yet)
      const tempConv: Conversation = {
        id: `temp-${Date.now()}`, // Temporary ID
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: currentUser.uid
      };
      
      // Reset all state to start fresh
      setCurrentConversation(tempConv);
      setMessages([{ id: 1, role: 'assistant', content: 'Welcome to MedAI! Ready for a quick quiz or to chat about a topic?', timestamp: Date.now() }]);
      setInput('');
      setIsLoading(false);
      setIsTyping(false);
      setTypingText('');
      
      // Clear localStorage since this is a new temp conversation
      localStorage.removeItem('medai-current-conversation');
      
      console.log('New temporary conversation created (will be saved when user sends first message)');
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  }, [currentUser]);

  // Helper function to refresh conversations list
  const refreshConversations = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const allConvs = await conversationManager.getAllConversations(currentUser.uid);
      setConversations(allConvs);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  }, [currentUser?.uid]);

  // Search function to filter conversations
  const searchConversations = useCallback((query: string, allConversations: Conversation[]) => {
    if (!query.trim()) {
      return allConversations;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return allConversations.filter(conv => {
      // Search in conversation title
      if (conv.title.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // Search in message content
      return conv.messages.some(msg => 
        msg.content.toLowerCase().includes(lowercaseQuery)
      );
    });
  }, []);

  // Update filtered conversations when search query or conversations change
  useEffect(() => {
    const filtered = searchConversations(searchQuery, conversations);
    setFilteredConversations(filtered);
  }, [searchQuery, conversations, searchConversations]);

  // Helper function to highlight search terms
  const highlightSearchTerm = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-600 text-yellow-100 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  const handleRenameConversation = async (convId: string, newTitle: string) => {
    if (!currentUser?.uid || !newTitle.trim()) return;
    
    try {
      await conversationManager.renameConversation(convId, newTitle.trim());
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === convId 
          ? { ...conv, title: newTitle.trim(), updatedAt: Date.now() }
          : conv
      ));
      
      // Update current conversation if it's the one being renamed
      if (currentConversation?.id === convId) {
        setCurrentConversation(prev => prev ? { ...prev, title: newTitle.trim() } : null);
      }
      
      setIsRenaming(null);
      setRenameValue('');
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  const handleMenuAction = (action: 'rename' | 'delete', convId: string, convTitle?: string) => {
    if (action === 'rename') {
      setIsRenaming(convId);
      setRenameValue(convTitle || '');
      setOpenMenuId(null);
    } else if (action === 'delete') {
      deleteConversation(convId);
      setOpenMenuId(null);
    }
  };

  // Message editing functions
  const startEditingMessage = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingValue(currentContent);
  };

  const cancelEditingMessage = () => {
    setEditingMessageId(null);
    setEditingValue('');
  };

  const saveEditedMessage = async (messageId: number) => {
    if (!editingValue.trim() || !currentConversation) return;

    try {
      // Find the message index
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return;

      // Update the message content
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: editingValue.trim()
      };

      // Remove all messages after the edited message (including AI responses)
      const messagesToKeep = updatedMessages.slice(0, messageIndex + 1);
      
      setMessages(messagesToKeep);
      setEditingMessageId(null);
      setEditingValue('');

      // If this isn't the last user message, regenerate AI response
      const hasAIResponseAfter = messageIndex < messages.length - 1 && 
                                messages[messageIndex + 1]?.role === 'assistant';
      
      if (hasAIResponseAfter) {
        // Regenerate AI response for the edited message
        setIsLoading(true);
        
        try {
          const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              input: editingValue.trim(),
              conversationHistory: messagesToKeep.slice(0, -1).map(msg => ({
                role: msg.role,
                content: msg.content
              }))
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              const aiMsg = { 
                id: Date.now(), 
                role: 'assistant' as const, 
                content: data.response, 
                timestamp: Date.now() 
              };
              setMessages(prev => [...prev, aiMsg]);
            } else {
              console.error('AI API error:', data.error);
            }
          }
        } catch (error) {
          console.error('Error regenerating AI response:', error);
        } finally {
          setIsLoading(false);
        }
      }

    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Force immediate redirect after logout to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      if (isRenaming) {
        setIsRenaming(null);
        setRenameValue('');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel editing
      if (e.key === 'Escape' && editingMessageId !== null) {
        cancelEditingMessage();
        return;
      }
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to clear search (only if not editing)
      if (e.key === 'Escape' && searchQuery.trim() && editingMessageId === null) {
        setSearchQuery('');
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRenaming, searchQuery, editingMessageId]);

  // Load conversation history on component mount
  useEffect(() => {
    const loadConversations = async () => {
      if (!currentUser?.uid) {
        console.log('No current user, skipping conversation load');
        return;
      }
      
      console.log('Loading conversations for user:', currentUser.uid);
      
      // Test Firebase connection first
      const isFirebaseConnected = await testFirebaseConnection();
      if (!isFirebaseConnected) {
        console.error('Firebase connection test failed - this may be the issue');
        return;
      }
      
      // Clean up empty conversations first
      await conversationManager.cleanupEmptyConversations(currentUser.uid);
      
      try {
        console.log('Calling conversationManager.getAllConversations...');
        const savedConversations = await conversationManager.getAllConversations(currentUser.uid);
        console.log('Successfully loaded conversations:', savedConversations.length);
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
        
        // Create new conversation if none exists
        if (savedConversations.length === 0) {
          await startNewConversation();
        } else {
          // Load the most recent conversation
          const mostRecent = savedConversations[0];
          setCurrentConversation(mostRecent);
          setMessages(mostRecent.messages);
          localStorage.setItem('medai-current-conversation', mostRecent.id);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        // Fallback to creating a new conversation
        await startNewConversation();
      }
    };

    loadConversations();
  }, [currentUser, startNewConversation]);

  // Save current conversation when messages change
  useEffect(() => {
    const saveConversation = async () => {
      // Only save if we have a conversation, user messages exist, and there's more than just the initial greeting
      const hasUserMessages = messages.some(msg => msg.role === 'user');
      const isTemporaryConversation = currentConversation?.id?.startsWith('temp-');
      
      console.log('Save conversation check:', {
        hasCurrentConversation: !!currentConversation,
        hasUserMessages,
        isTemporaryConversation,
        currentUserId: currentUser?.uid,
        messagesCount: messages.length
      });
      
      // Skip saving temporary conversations
      if (currentConversation && hasUserMessages && currentUser?.uid && !isTemporaryConversation) {
        const updatedConv = {
          ...currentConversation,
          messages: messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp || Date.now()
          })),
          updatedAt: Date.now()
        };
        
        console.log('Saving conversation:', currentConversation.id, 'with', messages.length, 'messages');
        
        try {
          await conversationManager.saveConversation(updatedConv);
          setCurrentConversation(updatedConv);
          
          // Update conversations list
          const allConvs = await conversationManager.getAllConversations(currentUser.uid);
          setConversations(allConvs);
          console.log('Conversation saved successfully, total conversations:', allConvs.length);
        } catch (error) {
          console.error('Error saving conversation:', error);
        }
      } else {
        console.log('Skipping conversation save - conditions not met');
      }
    };

    saveConversation();
  }, [messages, currentConversation?.id, currentUser?.uid]);

  // Auto-scroll to bottom when typing animation changes
  useEffect(() => {
    if (isTyping && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isTyping]);

  // Auto-scroll when typingText changes during animation
  useEffect(() => {
    if (typingText && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [typingText]);

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect is happening)
  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const loadConversation = (conv: Conversation) => {
    setCurrentConversation(conv);
    setMessages(conv.messages);
    localStorage.setItem('medai-current-conversation', conv.id);
    setShowHistory(false); // Close mobile modal if open
  };

  const deleteConversation = async (convId: string) => {
    if (!currentUser?.uid) return;
    
    try {
      await conversationManager.deleteConversation(convId);
      const updatedConvs = await conversationManager.getAllConversations(currentUser.uid);
      setConversations(updatedConvs);
      
      // If we deleted the current conversation, start a new one
      if (currentConversation?.id === convId) {
        if (updatedConvs.length > 0) {
          loadConversation(updatedConvs[0]);
        } else {
          await startNewConversation();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const clearAllConversations = async () => {
    if (!currentUser?.uid) return;
    
    if (confirm('Are you sure you want to delete all conversations? This cannot be undone.')) {
      try {
        await conversationManager.clearAllConversations(currentUser.uid);
        setConversations([]);
        await startNewConversation();
      } catch (error) {
        console.error('Error clearing conversations:', error);
      }
    }
  };

  const simulateTyping = async (text: string, callback?: () => void) => {
    setIsTyping(true);
    setTypingText('');
    
    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setTypingText(currentText);
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }
    
    setIsTyping(false);
    setTypingText('');
    if (callback) callback();
  };

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Handle temporary conversations - create actual conversation in Firestore when user sends first message
    let activeConversation = currentConversation;
    if (!activeConversation && currentUser?.uid) {
      console.log('No current conversation, creating new one...');
      try {
        activeConversation = await conversationManager.createNewConversation(currentUser.uid);
        setCurrentConversation(activeConversation);
        localStorage.setItem('medai-current-conversation', activeConversation.id);
        console.log('Created new conversation for user input:', activeConversation.id);
      } catch (error) {
        console.error('Error creating conversation for user input:', error);
      }
    } else if (activeConversation && activeConversation.id.startsWith('temp-') && currentUser?.uid) {
      // This is a temporary conversation, create it in Firestore now
      console.log('Converting temporary conversation to real conversation...');
      try {
        const realConversation = await conversationManager.createNewConversation(currentUser.uid);
        setCurrentConversation(realConversation);
        localStorage.setItem('medai-current-conversation', realConversation.id);
        activeConversation = realConversation;
        console.log('Converted temporary conversation to real conversation:', realConversation.id);
        
        // Refresh conversations list to show the new conversation
        await refreshConversations();
      } catch (error) {
        console.error('Error converting temporary conversation:', error);
      }
    }

    // Add user message
    const userMsg = { id: Date.now(), role: 'user' as const, content: userMessage, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    console.log('User message added, current conversation:', activeConversation?.id);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          input: userMessage,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Simulate typing animation
      await simulateTyping(data.response, () => {
        const assistantMsg = { id: Date.now() + 1, role: 'assistant' as const, content: data.response, timestamp: Date.now() };
        setMessages(prev => [...prev, assistantMsg]);
        
        console.log('Assistant message added, will refresh conversations...');
        // Refresh conversations list after both messages are added
        setTimeout(() => refreshConversations(), 100);
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = { id: Date.now() + 1, role: 'assistant' as const, content: 'Sorry, I encountered an error. Please try again.', timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
      
      // Refresh conversations list even on error
      setTimeout(() => refreshConversations(), 100);
    } finally {
      setIsLoading(false);
    }
  }

  const formatConversationTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-gray-900">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <button
            onClick={startNewConversation}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New chat
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-gray-700">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search conversations... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-10 text-sm bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg 
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery.trim() && (
            <div className="text-xs text-gray-400 mt-1">
              {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2" style={{ overflowX: 'visible' }}>
          {filteredConversations.length > 0 ? (
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`relative group rounded-md transition-colors ${
                    currentConversation?.id === conv.id
                      ? 'bg-gray-800'
                      : 'hover:bg-gray-800'
                  }`}
                  style={{ 
                    position: 'relative', 
                    zIndex: openMenuId === conv.id ? 999 : 1
                  }}
                >
                  {isRenaming === conv.id ? (
                    <div className="px-3 py-2">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameConversation(conv.id, renameValue);
                          } else if (e.key === 'Escape') {
                            setIsRenaming(null);
                            setRenameValue('');
                          }
                        }}
                        onBlur={() => {
                          if (renameValue.trim()) {
                            handleRenameConversation(conv.id, renameValue);
                          } else {
                            setIsRenaming(null);
                            setRenameValue('');
                          }
                        }}
                        className="w-full bg-gray-700 text-white text-sm px-2 py-1 rounded border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => loadConversation(conv)}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          currentConversation?.id === conv.id
                            ? 'text-white'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className="truncate pr-8">
                          {highlightSearchTerm(
                            conv.title || conv.messages.find(m => m.role === 'user')?.content.slice(0, 30) || 'New conversation',
                            searchQuery
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {formatConversationTime(conv.updatedAt)}
                        </div>
                      </button>
                      
                      {/* Three dots menu */}
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === conv.id ? null : conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all rounded"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        
                        {/* Dropdown menu */}
                        {openMenuId === conv.id && (
                          <div 
                            className="absolute right-0 top-8 w-36 bg-gray-700 border border-gray-600 rounded-md shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                              zIndex: 99999,
                              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
                            }}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => handleMenuAction('rename', conv.id, conv.title)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:text-white hover:bg-gray-600 transition-colors flex items-center gap-2 first:rounded-t-md"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Rename
                              </button>
                              <button
                                onClick={() => handleMenuAction('delete', conv.id)}
                                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-600 transition-colors flex items-center gap-2 last:rounded-b-md"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm mt-4">
              {searchQuery.trim() ? (
                <>
                  No conversations found for "{searchQuery}"
                  <br />
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-blue-400 hover:text-blue-300 underline mt-1"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                conversations.length === 0 ? 'No conversations yet' : 'Start a new conversation'
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="border-t border-gray-700 p-3">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
              {currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white rounded-md transition-colors"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((message) => (
              <div key={message.id} className="mb-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                      : 'bg-gradient-to-br from-green-500 to-emerald-600'
                  }`}>
                    {message.role === 'user' ? (
                      <span className="text-white text-sm font-medium">
                        {currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
                      </span>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {message.role === 'user' 
                          ? (currentUser?.displayName || 'You')
                          : 'MedAI Assistant'
                        }
                      </span>
                    </div>
                    
                    {/* Message content with editing capability */}
                    {editingMessageId === message.id ? (
                      // Editing mode
                      <div className="space-y-2">
                        <textarea
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={Math.min(Math.max(editingValue.split('\n').length, 2), 8)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              saveEditedMessage(message.id);
                            }
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEditedMessage(message.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Save (Ctrl+Enter)
                          </button>
                          <button
                            onClick={cancelEditingMessage}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <div className="group relative">
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                        </div>
                        
                        {/* Edit button for user messages */}
                        {message.role === 'user' && (
                          <button
                            onClick={() => startEditingMessage(message.id, message.content)}
                            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all duration-200"
                            title="Edit message"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Animation */}
            {isTyping && (
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">MedAI Assistant</span>
                    </div>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700">{typingText}<span className="animate-pulse">|</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Loading Animation */}
            {isLoading && !isTyping && (
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">MedAI Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                      <span className="text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={1}
                  placeholder="Send a message..."
                  disabled={isLoading}
                  className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: '52px', maxHeight: '200px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="flex items-center justify-center w-12 h-12 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}