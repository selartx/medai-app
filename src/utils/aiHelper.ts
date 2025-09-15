const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateResponse = async (userInput: string): Promise<string> => {
    const input = userInput.trim();
    if (!input) {
        throw new Error('Empty prompt received');
    }

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
        throw new Error('AI API key is not configured');
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: input,
                        },
                    ],
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI provider request failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
        candidates?: Array<{
            content?: {
                parts?: Array<{
                    text?: string;
                }>;
            };
        }>;
    };

    const text = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text?.trim())
        .filter(Boolean)
        .join('\n');

    if (!text) {
        throw new Error('AI provider returned an empty response');
    }

    return text;
};

export const validateInput = (input: string): boolean => {
    return input.trim().length > 0;
};

