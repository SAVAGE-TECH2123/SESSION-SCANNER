const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const pairingRoute = require('./routes/pairing');
const qrRoute = require('./routes/qr');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/pairing', pairingRoute);
app.use('/qr', qrRoute);

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
