const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

console.log('API Key:', API_KEY);
console.log('API Key length:', API_KEY ? API_KEY.length : 0);

async function testGemini() {
    try {
        console.log('Initializing Gemini AI...');
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        console.log('Getting model...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        console.log('Generating response...');
        const result = await model.generateContent('Hello, can you respond with just "API key works!"?');
        
        console.log('Response:', result.response.text());
        console.log('✅ API key is working correctly!');
        
    } catch (error) {
        console.error('❌ Error testing Gemini API:');
        console.error('Error message:', error.message);
        console.error('Error details:', error);
    }
}

testGemini();