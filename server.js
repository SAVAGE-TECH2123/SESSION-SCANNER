const express = require('express');
const fs = require('fs');
const path = require('path');
const { Boom } = require('@hapi/boom');
const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(express.json());

// ✅ Allow access to session JSON files
app.get('/sessions/:sessionId.json', (req, res) => {
  const sessionId = req.params.sessionId;
  const filePath = path.join(__dirname, 'sessions', `${sessionId}.json`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// ✅ Simple pairing loader page (optional improvement)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Scanner backend running at http://localhost:${PORT}`);
});
