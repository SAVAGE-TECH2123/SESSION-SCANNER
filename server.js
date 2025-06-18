// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Mount the pairing/QR route
const pairingRoute = require('./routes/pairing');
app.use('/api/pair', pairingRoute());

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
