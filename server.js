const express = require('express');
const cors = require('cors');
const path = require('path');

const pairingRouter = require('./routes/pairing');
const qrRouter = require('./routes/qr');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/pairing', pairingRouter);
app.use('/qr', qrRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
