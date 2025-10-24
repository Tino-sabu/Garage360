const express = require('express');
const app = express();
const PORT = 5001;

app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('❌ Error starting server:', err);
    process.exit(1);
});

console.log('Attempting to start server...');
