import { NextApiRequest, NextApiResponse } from 'next';
import { generateResponse, generateResponseWithImage, validateInput, ChatMessage } from '../../utils/aiHelper';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { input, conversationHistory, image } = req.body;

        // Debug logging
        console.log('API Key available:', !!process.env.GEMINI_API_KEY);
        console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0);
        console.log('Input received:', input);
        console.log('Image provided:', !!image);
        console.log('Conversation history length:', conversationHistory?.length || 0);

        // Validate input - allow empty input if image is provided
        if (!input && !image) {
            return res.status(400).json({ 
                error: 'Please provide either a message or upload an image.' 
            });
        }

        if (input && !validateInput(input)) {
            return res.status(400).json({ 
                error: 'Invalid input. Please provide a valid question (1-1000 characters).' 
            });
        }

        // Build conversation history including the new user message
        const messages: ChatMessage[] = conversationHistory || [];
        
        // Add user message to history
        if (input || image) {
            const userMessage: ChatMessage = { 
                role: 'user', 
                content: input || 'Uploaded medical image for analysis'
            };
            
            // Only add image property if image exists (avoid undefined in Firestore)
            if (image) {
                userMessage.image = image;
            }
            
            messages.push(userMessage);
        }

        try {
            let aiResponse: string;
            
            // Use image-specific generation if image is provided
            if (image) {
                console.log('Generating response with image analysis...');
                aiResponse = await generateResponseWithImage(messages, image);
            } else {
                console.log('Generating text-only response...');
                aiResponse = await generateResponse(messages);
            }
            
            console.log('AI Response generated successfully');
            res.status(200).json({ 
                success: true,
                response: aiResponse 
            });
        } catch (error) {
            console.error('AI API error:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : 'Unknown'
            });
            
            // Provide specific error messages based on error type
            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            
            if (error instanceof Error) {
                if (error.message.includes('overloaded') || error.message.includes('temporarily overloaded')) {
                    errorMessage = 'I\'m experiencing high demand right now. Please wait a moment and try again.';
                } else if (error.message.includes('API key')) {
                    errorMessage = 'There\'s an issue with the AI service configuration. Please contact support.';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = 'I\'m having trouble connecting to the AI service. Please check your internet connection and try again.';
                } else if (error.message.includes('image')) {
                    errorMessage = 'Failed to analyze the image. Please ensure it\'s a valid medical image and try again.';
                }
            }
            
            res.status(500).json({ 
                success: false,
                error: errorMessage,
                retry: error instanceof Error && error.message.includes('overloaded')
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ 
            error: `Method ${req.method} Not Allowed` 
        });
    }
};

export default handler;
