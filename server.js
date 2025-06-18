const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// Serve public folder
app.use(express.static(path.join(__dirname, 'public')));

// Route setup
const pairingRoute = require('./routes/pairing');
app.use('/api', pairingRoute());

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
