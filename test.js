// Test file to verify API functionality
const testCases = [
    {
        name: "Example A",
        data: ["a","1","334","4","R", "$"]
    },
    {
        name: "Example B", 
        data: ["2","a", "y", "4", "&", "-", "*", "5","92","b"]
    },
    {
        name: "Example C",
        data: ["A","ABcD","DOE"]
    }
];

async function testAPI() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('Testing BFHL API...\n');
    
    for (const testCase of testCases) {
        try {
            const response = await fetch(`${baseUrl}/bfhl`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: testCase.data })
            });
            
            const result = await response.json();
            
            console.log(`${testCase.name}:`);
            console.log('Input:', testCase.data);
            console.log('Output:', JSON.stringify(result, null, 2));
            console.log('-'.repeat(50));
            
        } catch (error) {
            console.error(`Error testing ${testCase.name}:`, error.message);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    setTimeout(testAPI, 1000); 
}