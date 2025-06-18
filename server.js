const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// Serve static frontend (index.html etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Import and use pairing route
const pairingRoute = require('./routes/pairing');
app.use('/api', pairingRoute()); // Call the function to get the router

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
