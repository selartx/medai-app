import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        try {
            // Test environment variable access
            const apiKey = process.env.GEMINI_API_KEY;
            
            // Test Google AI import
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            
            const response: any = {
                environmentCheck: {
                    apiKeyPresent: !!apiKey,
                    apiKeyLength: apiKey?.length || 0,
                    apiKeyFirstChars: apiKey ? apiKey.substring(0, 10) + '...' : 'Not found',
                },
                libraryCheck: {
                    googleAIImported: !!GoogleGenerativeAI,
                },
                nodeVersion: process.version,
                timestamp: new Date().toISOString()
            };

            // Try to initialize the AI
            try {
                const genAI = new GoogleGenerativeAI(apiKey || '');
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
                response.aiInitialization = { success: true, error: null };
            } catch (initError) {
                response.aiInitialization = { 
                    success: false, 
                    error: initError instanceof Error ? initError.message : String(initError)
                };
            }

            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ 
                error: 'Test failed',
                details: error instanceof Error ? error.message : String(error)
            });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
};

export default handler;