const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend (index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const pairingRoute = require('./routes/pairing');
const qrRoute = require('./routes/qr');

app.use('/api/pairing', pairingRoute);
app.use('/api/qr', qrRoute);

// Default route: return index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
