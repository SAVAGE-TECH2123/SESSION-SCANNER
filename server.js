// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const pairingRoute = require('./routes/pairing');
const qrRoute = require('./routes/qr');
const { logInfo } = require('./utils/logger');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes with socket injection
app.use('/api/pairing', pairingRoute(io));
app.use('/api/qr', qrRoute(io));

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logInfo(`🚀 SAVAGE-XMD Server running at http://localhost:${PORT}`);
});
