const http = require('http');

const testPartsAPI = () => {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/parts',
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
                const parsed = JSON.parse(data);
                console.log('✅ API Response Status:', res.statusCode);
                console.log('✅ Total Parts:', parsed.total);
                console.log('✅ Success:', parsed.success);

                if (parsed.data && parsed.data.length > 0) {
                    console.log('\n📦 Sample Parts Data:');
                    parsed.data.slice(0, 5).forEach(part => {
                        console.log(`- ${part.part_name} (${part.part_code}): ${part.current_stock} ${part.stock_unit} - ${part.category}`);
                    });

                    // Check for low stock items
                    const lowStock = parsed.data.filter(p => p.current_stock <= p.stock_min);
                    console.log(`\n⚠️  Low Stock Items: ${lowStock.length}`);
                    if (lowStock.length > 0) {
                        lowStock.slice(0, 3).forEach(part => {
                            console.log(`  - ${part.part_name}: ${part.current_stock}/${part.stock_min} units`);
                        });
                    }
                }
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
};

// Test after a short delay to ensure server is ready
setTimeout(testPartsAPI, 1000);