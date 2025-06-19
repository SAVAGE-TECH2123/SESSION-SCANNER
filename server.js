// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load routes
const pairingRoutes = require('./routes/pairing');
const qrRoutes = require('./routes/qr');

app.use('/api/pair', pairingRoutes);
app.use('/api/qr', qrRoutes);

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Handle frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✔ Server running on port ${PORT}`));
