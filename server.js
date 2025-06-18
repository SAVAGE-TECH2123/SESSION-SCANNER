const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// Serve static frontend files (index.html, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Load the session pairing route with backend logic
const pairingRoute = require('./routes/pairing');
app.use('/api', pairingRoute()); // pass the router as a function

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
