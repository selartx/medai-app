import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Conversation, conversationManager, testFirebaseConnection } from '../utils/aiHelper';

export default function StartPage() {
  const { currentUser, loading: authLoading, logout, updateDisplayName, updateProfilePhoto } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
  const [showSettings, setShowSettings] = useState(false);
  const [displayNameValue, setDisplayNameValue] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication check - redirect if not authenticated or not verified
  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.replace('/login');
        return;
      }
    }
  }, [currentUser, authLoading, router]);

  // Initialize display name value when settings modal is opened
  useEffect(() => {
    if (showSettings && currentUser) {
      setDisplayNameValue(currentUser.displayName || '');
      // Clear any previous photo selection
      setSelectedPhoto(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [showSettings, currentUser]);

  // Define startNewConversation function using useCallback
  const startNewConversation = useCallback(async () => {
    if (!currentUser?.uid) return;
    
    // Close mobile menu
    setIsMobileMenuOpen(false);
    
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

  const handleSaveSettings = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setIsUpdatingProfile(true);
      
      // Save display name if it has changed
      if (displayNameValue.trim() && displayNameValue !== currentUser.displayName) {
        await updateDisplayName(displayNameValue.trim());
      }
      
      handleCloseSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      // TODO: Show error message to user
    } finally {
      setIsUpdatingProfile(false);
    }
  }, [currentUser, displayNameValue, updateDisplayName]);

  // Handle photo selection
  const handlePhotoSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setSelectedPhoto(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle photo upload
  const handlePhotoUpload = useCallback(async () => {
    if (!selectedPhoto || !currentUser) return;
    
    try {
      setIsUploadingPhoto(true);
      await updateProfilePhoto(selectedPhoto);
      
      // Reset photo selection state
      setSelectedPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [selectedPhoto, currentUser, updateProfilePhoto]);

  // Handle settings modal close
  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

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
      // Escape to close settings modal
      if (e.key === 'Escape' && showSettings) {
        setShowSettings(false);
        return;
      }
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
      // Escape to clear search (only if not editing and settings not open)
      if (e.key === 'Escape' && searchQuery.trim() && editingMessageId === null && !showSettings) {
        setSearchQuery('');
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRenaming, searchQuery, editingMessageId, showSettings]);

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
    setIsMobileMenuOpen(false); // Close mobile menu
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
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        flex flex-col w-64 bg-gray-900 dark:bg-gray-800 transition-transform duration-300 ease-in-out z-50
        lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 translate-x-0' : 'fixed inset-y-0 left-0 -translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700 dark:border-gray-600">
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
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-white rounded-md transition-colors"
              title="Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
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
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">MedAI</h1>
          <div className="w-8"></div>
        </div>

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
            {messages.map((message) => (
              <div key={message.id} className="mb-4 lg:mb-6">
                <div className="flex items-start gap-3 lg:gap-4">
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
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
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
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <div className="prose prose-gray dark:prose-invert max-w-none">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{message.content}</p>
                        </div>
                        
                        {/* Edit button for user messages */}
                        {message.role === 'user' && (
                          <button
                            onClick={() => startEditingMessage(message.id, message.content)}
                            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200"
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
                      <span className="font-semibold text-gray-900 dark:text-gray-100">MedAI Assistant</span>
                    </div>
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300">{typingText}<span className="animate-pulse">|</span></p>
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
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 lg:px-4 py-3 lg:py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 lg:gap-3">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={1}
                  placeholder="Send a message..."
                  disabled={isLoading}
                  className="w-full resize-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: '44px', maxHeight: '200px' }}
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
                className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
              <button
                onClick={handleCloseSettings}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
              {/* Profile Section */}
              <div>
                <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 lg:mb-4">Profile</h3>
                
                {/* Profile Picture */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-medium">
                      {currentUser?.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {currentUser?.displayName || 'No display name set'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</div>
                      <div className="text-sm text-gray-500">{currentUser?.email}</div>
                    </div>
                  </div>
                  
                  {/* Photo Upload Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Photo
                    </label>
                    
                    {/* Photo Preview */}
                    {photoPreview && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="text-sm text-gray-700">Selected: {selectedPhoto?.name}</div>
                          <div className="text-xs text-gray-500">
                            {selectedPhoto && (selectedPhoto.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handlePhotoUpload}
                          disabled={isUploadingPhoto}
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploadingPhoto ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPhoto(null);
                            setPhotoPreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    {/* File Input */}
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        Choose Photo
                      </button>
                      <span className="text-xs text-gray-500">
                        Max 5MB, JPG/PNG/GIF
                      </span>
                    </div>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayNameValue}
                    onChange={(e) => setDisplayNameValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your display name"
                  />
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="text-gray-900 dark:text-gray-100">{currentUser?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email Verified:</span>
                    <span className={`${currentUser?.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {currentUser?.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {currentUser?.metadata?.creationTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Preferences</h3>
                <div className="space-y-3">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred color scheme</div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      {theme === 'light' ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          Dark
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Light
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    Change Password
                  </button>
                  {!currentUser?.emailVerified && (
                    <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                      Resend Email Verification
                    </button>
                  )}
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    Export Conversations
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <button
                onClick={handleCloseSettings}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}