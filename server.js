const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pairingRoute = require('./routes/pairing');
const qrRoute = require('./routes/qr');

app.use('/pairing', pairingRoute);
app.use('/qr', qrRoute);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));