const express = require('express');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const path = require('path');

const router = express.Router();

const SESSIONS_DIR = path.join(__dirname, '../sessions');

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

router.post('/pair', async (req, res) => {
  const { number } = req.body;
  if (!number) return res.status(400).json({ error: 'Phone number required' });

  const sessionId = number;
  const sessionPath = path.join(SESSIONS_DIR, sessionId);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => ({ conversation: "Hi" })
  });

  sock.ev.on('connection.update', (update) => {
    const { qr, connection } = update;

    if (qr) {
      fs.writeFileSync(
        path.join(SESSIONS_DIR, `${sessionId}.json`),
        JSON.stringify({ qr, session: sessionId }, null, 2)
      );
    }

    if (connection === 'open') {
      console.log(`✅ Session for ${sessionId} connected.`);
      sock.end();
    }
  });

  sock.ev.on('creds.update', saveCreds);

  res.json({
    message: 'Pairing started',
    qrJsonUrl: `/sessions/${sessionId}.json`
  });
});

module.exports = router;
