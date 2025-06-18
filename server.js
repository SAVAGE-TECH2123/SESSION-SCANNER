// server.js const express = require('express'); const path = require('path'); const app = express(); const cors = require('cors'); require('dotenv').config();

const pairRouter = require('./routes/pair'); const qrRouter = require('./routes/qr');

app.use(cors()); app.use(express.json()); app.use(express.urlencoded({ extended: true }));

// Serve public directory app.use(express.static(path.join(__dirname, 'public')));

// Routes app.use('/pair', pairRouter); app.use('/qr', qrRouter);

// Start the server const PORT = process.env.PORT || 10000; app.listen(PORT, () => { console.log(✅ Server running at http://localhost:${PORT}); });

