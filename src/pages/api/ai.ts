import { NextApiRequest, NextApiResponse } from 'next';
import { generateResponse } from '../../utils/aiHelper';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const userInput = req.body.input;

        try {
            const aiResponse = await generateResponse(userInput);
            res.status(200).json({ response: aiResponse });
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate response' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

export default handler;