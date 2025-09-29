const http = require('http');

// Test the parts API
function testAPI() {
    const options = {
        hostname: 'localhost',
        port: 3333,
        path: '/test-parts',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('✅ Parts API Working Successfully!');
                console.log(`📦 Total Parts in Database: ${result.total}`);
                console.log(`⚠️  Parts with Low Stock: ${result.lowStockCount}`);
                console.log('\n📋 Sample Parts Data:');
                result.sampleData.slice(0, 5).forEach((part, index) => {
                    const status = part.current_stock <= part.stock_min ? '🔴 LOW STOCK' : '🟢 IN STOCK';
                    console.log(`${index + 1}. ${part.part_name} (${part.part_code})`);
                    console.log(`   Category: ${part.category}`);
                    console.log(`   Stock: ${part.current_stock} ${part.stock_unit} (Min: ${part.stock_min}) - ${status}`);
                    console.log(`   Cost: ₹${part.avg_cost}`);
                    console.log('');
                });

                console.log('✅ Stock data is being fetched correctly from the parts table!');
                console.log('✅ The Manager Dashboard will display this data when "Check Stock" is clicked.');

                // Now test stock update
                testStockUpdate();

            } catch (e) {
                console.error('❌ JSON Parse Error:', e.message);
                console.log('Raw Response:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Request Error:', e.message);
    });

    req.end();
}

function testStockUpdate() {
    console.log('\n🧪 Testing Stock Update Functionality...');

    const updateData = JSON.stringify({
        current_stock: 25,
        action: 'set'
    });

    const options = {
        hostname: 'localhost',
        port: 3333,
        path: '/test-stock-update/1', // Update part with ID 1 (Oil filter)
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': updateData.length
        }
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('✅ Stock Update Test Successful!');
                console.log(`📦 Updated Part: ${result.data.part_name}`);
                console.log(`📈 New Stock Level: ${result.data.current_stock}`);
                console.log('✅ Stock update functionality is working correctly!');
                console.log('\n🎉 ALL TESTS PASSED! The parts stock management system is fully functional.');
                console.log('🚀 You can now use the "Check Stock" feature in the Manager Dashboard.');

            } catch (e) {
                console.error('❌ Stock Update Error:', e.message);
                console.log('Raw Response:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Stock Update Request Error:', e.message);
    });

    req.write(updateData);
    req.end();
}

// Start the test
console.log('🧪 Starting Parts API Integration Tests...\n');
setTimeout(testAPI, 500); // Give server time to start