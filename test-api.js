const testAPI = async () => {
    try {
        const response = await fetch('http://localhost:3002/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input: 'What is anatomy?' }),
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Response data:', data);
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

testAPI();