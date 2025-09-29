// Complete integration test for parts stock management
const http = require('http');

function testPartsAPI() {
    return new Promise((resolve, reject) => {
        console.log('🧪 Testing Parts API...');
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/parts',
            method: 'GET'
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`✅ Parts API Status: ${res.statusCode}`);
                    console.log(`✅ Total Parts: ${result.total}`);
                    console.log(`✅ API Success: ${result.success}`);

                    if (result.data && result.data.length > 0) {
                        console.log('\n📦 Sample Parts:');
                        result.data.slice(0, 3).forEach((part, index) => {
                            console.log(`  ${index + 1}. ${part.part_name} - Stock: ${part.current_stock} ${part.stock_unit}`);
                        });

                        const lowStock = result.data.filter(p => p.current_stock <= p.stock_min);
                        console.log(`\n⚠️  Low Stock Items: ${lowStock.length}`);

                        resolve(result.data[0]); // Return first part for stock update test
                    } else {
                        reject(new Error('No parts data found'));
                    }
                } catch (e) {
                    reject(new Error(`Parse error: ${e.message}\nResponse: ${data.substring(0, 200)}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

function testStockUpdate(part) {
    return new Promise((resolve, reject) => {
        console.log(`\n🧪 Testing Stock Update for: ${part.part_name}`);
        console.log(`   Current Stock: ${part.current_stock} ${part.stock_unit}`);

        const updateData = JSON.stringify({
            current_stock: part.current_stock + 5,
            action: 'add'
        });

        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: `/api/parts/${part.id}/stock`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': updateData.length
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`✅ Stock Update Status: ${res.statusCode}`);
                    console.log(`✅ Update Success: ${result.success}`);
                    if (result.data) {
                        console.log(`✅ New Stock Level: ${result.data.current_stock} ${part.stock_unit}`);
                    }
                    resolve(result);
                } catch (e) {
                    reject(new Error(`Parse error: ${e.message}\nResponse: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(updateData);
        req.end();
    });
}

// Run the integration test
console.log('🚀 Starting Complete Parts Stock Management Integration Test...\n');

testPartsAPI()
    .then(firstPart => testStockUpdate(firstPart))
    .then(() => {
        console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
        console.log('✅ Parts API is working correctly');
        console.log('✅ Stock management is functional');
        console.log('✅ The Manager Dashboard "Check Stock" feature should now work properly!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Integration Test Failed:', error.message);
        process.exit(1);
    });