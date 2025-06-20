const express = require('express');
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');

const router = express.Router();

const allowedNumbers = [
  '255765457691',
  '255793157892',
  '255745830630',
  '255757858480',
  '255686169965'
];

router.get('/', async (req, res) => {
  const number = req.query.number?.replace(/\D/g, '');
  if (!number || !allowedNumbers.includes(number)) {
    return res.status(403).json({ error: '❌ Invalid or unauthorized number.' });
  }

  const sessionDir = path.join(__dirname, '..', 'sessions');
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

  const sessionFilePath = path.join(sessionDir, `${number}.json`);
  const { state, saveState } = useSingleFileAuthState(sessionFilePath);

  try {
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['SAVAGE-XMD', 'Chrome', '1.0.0']
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr) {
        try {
          const qrImageBuffer = await qrcode.toBuffer(qr);
          res.setHeader('Content-Type', 'image/png');
          return res.send(qrImageBuffer);
        } catch (err) {
          console.error('❌ Error generating QR image:', err);
          return res.status(500).json({ error: 'Error generating QR code image' });
        }
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (!res.headersSent) {
          return res.status(500).json({ error: 'Connection closed' });
        }
        if (shouldReconnect) sock?.end();
      }
    });

    sock.ev.on('creds.update', saveState);

    setTimeout(() => {
      if (!res.headersSent) {
        return res.status(408).json({ error: '⏳ QR timeout. Try again.' });
      }
    }, 30000);
  } catch (err) {
    console.error('❌ Error generating QR code:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
