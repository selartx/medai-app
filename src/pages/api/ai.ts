import { NextApiRequest, NextApiResponse } from 'next';
import { generateResponse, validateInput } from '../../utils/aiHelper';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const userInput = req.body?.input ?? '';

        if (!validateInput(userInput)) {
            res.status(400).json({ error: 'Please provide a question or prompt.' });
            return;
        }

        try {
            const aiResponse = await generateResponse(userInput);
            res.status(200).json({ response: aiResponse });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to generate response';
            res.status(500).json({ error: message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

export default handler;
