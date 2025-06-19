const express = require('express');
const router = express.Router();
const startSocket = require('../startSocket');

// Allowed numbers list (no + sign)
const allowedNumbers = [
  '255765457691',
  '255793157892',
  '255745830630',
  '255757858480',
  '255686169965'
];

router.post('/start', async (req, res) => {
  const { number, method } = req.body;

  // Validate
  if (!method || !['pairing', 'qr'].includes(method)) {
    return res.json({ success: false, message: 'Invalid method selected.' });
  }

  if (method === 'pairing') {
    if (!number || !allowedNumbers.includes(number)) {
      return res.json({ success: false, message: '❌ Phone number not allowed.' });
    }

    try {
      const sock = await startSocket(number);
      const code = await sock.requestPairingCode(number);
      return res.json({ success: true, code });
    } catch (err) {
      console.error('❌ Pairing Error:', err);
      return res.json({ success: false, message: '❌ Failed to generate pairing code.' });
    }
  }

  // If method is QR
  if (method === 'qr') {
    try {
      const sock = await startSocket();

      // Only listen once and return QR immediately
      sock.ev.on('connection.update', (update) => {
        const { qr } = update;
        if (qr) {
          const qrImage = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=250x250`;
          return res.json({ success: true, qr: qrImage });
        }
      });

      // Timeout fallback in case QR doesn't arrive
      setTimeout(() => {
        return res.json({ success: false, message: '❌ QR code generation timed out.' });
      }, 10000);

    } catch (err) {
      console.error('❌ QR Error:', err);
      return res.json({ success: false, message: '❌ Failed to generate QR code.' });
    }
  }
});

module.exports = router;
