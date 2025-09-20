// Use dynamic import for fetch in older Node versions
async function testApiEndpoint() {
    let fetch;
    try {
        // Try to use built-in fetch (Node 18+)
        fetch = globalThis.fetch;
    } catch {
        // Fallback to node-fetch for older versions
        const { default: nodeFetch } = await import('node-fetch');
        fetch = nodeFetch;
    }
    try {
        console.log('Testing /api/ai endpoint...');
        
        const response = await fetch('http://localhost:3002/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: 'Hello, this is a test message',
                conversationHistory: []
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            console.log('✅ API endpoint is working!');
            console.log('AI Response:', data.response);
        } else {
            console.log('❌ API endpoint returned an error:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Error testing API endpoint:', error);
    }
}

testApiEndpoint();