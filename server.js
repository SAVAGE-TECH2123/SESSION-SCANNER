const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

const pairingRoute = require('./routes/pairing');
const qrRoute = require('./routes/qr');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/pair', pairingRoute);
app.use('/qr', qrRoute);

app.get('/sessions/:id.json', (req, res) => {
  const sessionFile = path.join(__dirname, 'sessions', `${req.params.id}.json`);
  if (fs.existsSync(sessionFile)) {
    res.sendFile(sessionFile);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

app.listen(port, () => {
  console.log(`✅ SAVAGE-XMD Scanner running on http://localhost:${port}`);
});
