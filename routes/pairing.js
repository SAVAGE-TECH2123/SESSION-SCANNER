const express = require('express');
const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const sessionsDir = path.join(__dirname, '../../sessions');

// Ensure sessions folder exists
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

router.get('/', async (req, res) => {
  const number = req.query.number;

  if (!number) {
    return res.status(400).json({ error: 'Missing number' });
  }

  const sessionFile = path.join(sessionsDir, `${number}.json`);
  const { state, saveState } = useSingleFileAuthState(sessionFile);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;

    if (qr) {
      try {
        const qrImageUrl = await qrcode.toDataURL(qr);
        return res.json({ qr: qrImageUrl });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to generate QR' });
      }
    }

    if (connection === 'open') {
      console.log(`✅ Connected: ${number}`);
      sock.ev.removeAllListeners('connection.update');
    }

    if (connection === 'close') {
      console.log(`❌ Disconnected: ${number}`);
    }
  });

  sock.ev.on('creds.update', saveState);
});

module.exports = router;
