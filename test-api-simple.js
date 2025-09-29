// Simple parts API test
const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`\n=== ${path} ===`);
                console.log(`Status: ${res.statusCode}`);
                if (res.statusCode === 200) {
                    try {
                        const result = JSON.parse(data);
                        console.log(`Success: ${result.success}`);
                        console.log(`Data count: ${result.data ? result.data.length : 0}`);
                        console.log(`Total: ${result.total || 'N/A'}`);
                    } catch (e) {
                        console.log('Parse error:', e.message);
                    }
                } else {
                    console.log('Response:', data.substring(0, 200));
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log(`\n=== ${path} ===`);
            console.log('Connection Error:', e.message);
            resolve();
        });

        req.end();
    });
}

async function testAPI() {
    console.log('🧪 Testing Parts API Endpoints...');

    await makeRequest('/api/health');
    await makeRequest('/api/parts');
    await makeRequest('/api/parts/categories');

    console.log('\n✅ API Test Complete');
}

testAPI();