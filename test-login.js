// Simple test script to verify login functionality
async function testLogin() {
    const testUsers = [
        { email: 'alpha@garage360.com', password: 'alpha01', role: 'manager' },
        { email: 'head@classroom.com', password: 'rohan123', role: 'customer' },
        { email: 'mech1@garage360.com', password: 'mech01', role: 'mechanic' }
    ];

    console.log('Testing login functionality...\n');

    for (const user of testUsers) {
        try {
            console.log(`Testing login for ${user.role}: ${user.email}`);

            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password
                })
            });

            const data = await response.json();

            if (data.success) {
                console.log(`✅ Login successful for ${user.role}: ${data.data.user.name}`);
                console.log(`   Token: ${data.data.token.substring(0, 20)}...`);
            } else {
                console.log(`❌ Login failed for ${user.role}: ${data.message}`);
            }
        } catch (error) {
            console.log(`❌ Network error for ${user.role}: ${error.message}`);
        }
        console.log('');
    }
}

// Run test if server is available
testLogin().catch(console.error);