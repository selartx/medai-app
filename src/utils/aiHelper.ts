import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
    collection, 
    doc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Initialize the Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Test Firebase connectivity
export const testFirebaseConnection = async () => {
    try {
        console.log('Testing Firebase connection...');
        console.log('Firebase config check:', {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing'
        });
        
        // Try a simple collection reference
        const testCollection = collection(db, 'test');
        console.log('Collection reference created successfully');
        return true;
    } catch (error) {
        console.error('Firebase connection test failed:', error);
        return false;
    }
};

// Sleep function for retry logic
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type for conversation messages
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
}

// Type for a complete conversation
export interface Conversation {
    id: string;
    title: string;
    messages: Array<{ id: number; role: 'user' | 'assistant'; content: string; timestamp: number }>;
    createdAt: number;
    updatedAt: number;
    userId: string; // Added for user-specific conversations
}

// Cloud-based conversation management functions using Firestore
export const conversationManager = {
    // Get all conversations for a specific user from Firestore
    getAllConversations: async (userId: string): Promise<Conversation[]> => {
        try {
            console.log('Attempting to query Firestore for user:', userId);
            console.log('Database instance:', db);
            
            const q = query(
                collection(db, 'conversations'),
                where('userId', '==', userId),
                orderBy('updatedAt', 'desc'),
                limit(50)
            );
            
            console.log('Executing Firestore query...');
            const querySnapshot = await getDocs(q);
            console.log('Query completed, processing results...');
            
            const conversations: Conversation[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                conversations.push({
                    id: doc.id,
                    title: data.title,
                    messages: data.messages,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    userId: data.userId
                });
            });
            
            console.log('Successfully loaded', conversations.length, 'conversations');
            return conversations;
        } catch (error) {
            console.error('Error loading conversations from Firestore:', error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    code: (error as any).code,
                    message: error.message,
                    stack: error.stack
                });
            }
            return [];
        }
    },

    // Create a new conversation for a user
    createNewConversation: async (userId: string): Promise<Conversation> => {
        const now = Date.now();
        const newConversation = {
            title: 'New Conversation',
            messages: [
                { 
                    id: 1, 
                    role: 'assistant' as const, 
                    content: 'Welcome to MedAI! Ready for a quick quiz or to chat about a topic?',
                    timestamp: now
                }
            ],
            createdAt: now,
            updatedAt: now,
            userId: userId
        };

        try {
            const docRef = await addDoc(collection(db, 'conversations'), newConversation);
            return {
                id: docRef.id,
                ...newConversation
            };
        } catch (error) {
            console.error('Error creating conversation in Firestore:', error);
            // Fallback to local conversation if Firestore fails
            return {
                id: `conv_${now}_${Math.random().toString(36).substr(2, 9)}`,
                ...newConversation
            };
        }
    },

    // Update conversation title based on first user message
    updateConversationTitle: (conversation: Conversation): string => {
        const firstUserMessage = conversation.messages.find(msg => msg.role === 'user');
        if (firstUserMessage) {
            // Take first 50 characters as title
            const title = firstUserMessage.content.slice(0, 50);
            return title.length < firstUserMessage.content.length ? title + '...' : title;
        }
        return 'New Conversation';
    },

    // Save a conversation (create or update) to Firestore
    saveConversation: async (conversation: Conversation): Promise<void> => {
        try {
            // Update title if it's still "New Conversation"
            if (conversation.title === 'New Conversation') {
                conversation.title = conversationManager.updateConversationTitle(conversation);
            }
            
            conversation.updatedAt = Date.now();
            
            const conversationRef = doc(db, 'conversations', conversation.id);
            await updateDoc(conversationRef, {
                title: conversation.title,
                messages: conversation.messages,
                updatedAt: conversation.updatedAt
            });
        } catch (error) {
            console.error('Error saving conversation to Firestore:', error);
            // Could fall back to localStorage here if needed
        }
    },

    // Delete a conversation from Firestore
    deleteConversation: async (conversationId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'conversations', conversationId));
        } catch (error) {
            console.error('Error deleting conversation from Firestore:', error);
        }
    },

    // Rename a conversation
    renameConversation: async (conversationId: string, newTitle: string): Promise<void> => {
        try {
            const conversationRef = doc(db, 'conversations', conversationId);
            await updateDoc(conversationRef, {
                title: newTitle.trim(),
                updatedAt: Date.now()
            });
        } catch (error) {
            console.error('Error renaming conversation in Firestore:', error);
        }
    },

    // Clear all conversations for a user (optional - for cleanup)
    clearAllConversations: async (userId: string): Promise<void> => {
        try {
            const q = query(
                collection(db, 'conversations'),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Error clearing conversations from Firestore:', error);
        }
    },

    // Clean up empty conversations (conversations with only the initial assistant message)
    cleanupEmptyConversations: async (userId: string): Promise<void> => {
        try {
            console.log('Cleaning up empty conversations for user:', userId);
            const q = query(
                collection(db, 'conversations'),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            
            const emptyConversations: string[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const hasUserMessages = data.messages?.some((msg: any) => msg.role === 'user');
                
                // If conversation has no user messages, it's empty
                if (!hasUserMessages) {
                    emptyConversations.push(doc.id);
                }
            });
            
            if (emptyConversations.length > 0) {
                console.log('Found', emptyConversations.length, 'empty conversations to delete');
                const deletePromises = emptyConversations.map(id => 
                    deleteDoc(doc(db, 'conversations', id))
                );
                await Promise.all(deletePromises);
                console.log('Successfully deleted empty conversations');
            } else {
                console.log('No empty conversations found');
            }
        } catch (error) {
            console.error('Error cleaning up empty conversations:', error);
        }
    }
};

export const generateResponse = async (conversationHistory: ChatMessage[]): Promise<string> => {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Starting AI response generation (attempt ${attempt}/${maxRetries})...`);
            console.log('API Key present:', !!process.env.GEMINI_API_KEY);
            console.log('Conversation history length:', conversationHistory.length);

            // Get the generative model with optimized settings
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-1.5-flash',
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1000, // Limit response length for speed
                }
            });
            console.log('Model created successfully');

            // Build conversation context with recent history (last 10 messages to avoid token limits)
            const recentHistory = conversationHistory.slice(-10);
            
            // Create a prompt with conversation context
            let conversationText = '';
            recentHistory.forEach(msg => {
                if (msg.role === 'user') {
                    conversationText += `Student: ${msg.content}\n`;
                } else {
                    conversationText += `MedAI: ${msg.content}\n`;
                }
            });
                // This prompt is to fine-tune the model and make sure it knows what it is.
            const prompt = `You are MedAI, a medical education AI assistant. Maintain conversation context and give concise, accurate answers. You will be used to help medical students learn by answering their questions, quizzing them, and providing accurate medical information. If the user requests to speak in any other language, you will switch to that language. Try to match the user's vibe and energy level. Even if they act unprofessional.

Previous conversation:
${conversationText}

Please respond as MedAI to continue this medical education conversation:`;

            console.log('Calling generateContent...');
            const result = await model.generateContent(prompt);
            console.log('generateContent completed');
            
            const response = await result.response;
            console.log('Response extracted');
            
            const text = response.text();
            console.log('Text extracted, length:', text.length);
            
            return text;
        } catch (error: any) {
            console.error(`Error on attempt ${attempt}:`, error);
            console.error('Error type:', error?.constructor?.name);
            console.error('Error message:', error instanceof Error ? error.message : String(error));
            
            // Check if this is a retryable error (503 Service Unavailable)
            const isRetryable = error?.message?.includes('503') || 
                              error?.message?.includes('Service Unavailable') ||
                              error?.message?.includes('overloaded');
            
            if (isRetryable && attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
                console.log(`Retrying in ${delay}ms...`);
                await sleep(delay);
                continue;
            }
            
            // If not retryable or max retries reached, throw error
            if (isRetryable) {
                throw new Error('The AI service is temporarily overloaded. Please wait a moment and try again.');
            } else {
                throw new Error('Failed to generate AI response. Please try again.');
            }
        }
    }
    
    throw new Error('Failed to generate response after multiple attempts.');
};

export const validateInput = (input: string): boolean => {
    // Basic validation for user input
    return input.trim().length > 0 && input.trim().length <= 1000; // Add max length
};
