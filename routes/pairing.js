const express = require('express');
const fs = require('fs');
const path = require('path');
const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { default: P } = require('@whiskeysockets/baileys');
const { delay } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

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

  try {
    const sessionDir = path.join(__dirname, '..', 'sessions');
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

    const sessionFilePath = path.join(sessionDir, `${number}.json`);
    const { state, saveState } = useSingleFileAuthState(sessionFilePath);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      generateHighQualityLinkPreview: true,
      browser: ['SAVAGE-XMD', 'Chrome', '1.0.0']
    });

    sock.ev.once('connection.update', async (update) => {
      const { connection, lastDisconnect, pairingCode } = update;

      if (connection === 'open') {
        console.log(`✅ Connected: ${number}`);
        return;
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(`⚠️ Disconnected. Should reconnect: ${shouldReconnect}`);
        if (shouldReconnect) sock?.end();
      }

      if (pairingCode) {
        return res.json({ code: pairingCode });
      }
    });

    sock.ev.on('creds.update', saveState);

    // Timeout if no code within 30s
    setTimeout(() => {
      return res.status(408).json({ error: '⏳ Timeout. No pairing code generated.' });
    }, 30000);
  } catch (err) {
    console.error('❌ Error generating pairing code:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
