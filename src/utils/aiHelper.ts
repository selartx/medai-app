import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Sleep function for retry logic
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type for conversation messages
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

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

            const prompt = `You are MedAI, a medical education AI assistant. Maintain conversation context and give concise, accurate answers.

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