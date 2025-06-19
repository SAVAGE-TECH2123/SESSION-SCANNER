const express = require('express');
const router = express.Router();
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

const authFolder = path.join(__dirname, '../session/qr_auth');

// Ensure session directory exists
if (!fs.existsSync(authFolder)) {
  fs.mkdirSync(authFolder, { recursive: true });
}

router.post('/start', async (req, res) => {
  try {
    const sessionFile = path.join(authFolder, 'qr-session.json');
    const { state, saveState } = useSingleFileAuthState(sessionFile);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    let sent = false;

    sock.ev.on('connection.update', (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr && !sent) {
        sent = true;
        return res.status(200).json({
          success: true,
          message: '✅ QR code generated successfully',
          qr: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qr)}`
        });
      }

      if (connection === 'open') {
        console.log('✅ WhatsApp QR session connected');
      }

      if (
        connection === 'close' &&
        lastDisconnect &&
        lastDisconnect.error instanceof Boom &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
      ) {
        sock.restart();
      }
    });

    sock.ev.on('creds.update', saveState);

    setTimeout(() => {
      if (!sent) {
        return res.status(500).json({
          success: false,
          message: '❌ QR code not generated in time'
        });
      }
    }, 15000);
  } catch (err) {
    console.error('QR Error:', err);
    return res.status(500).json({
      success: false,
      message: '❌ Error generating QR code',
      details: err.message
    });
  }
});

module.exports = router;
