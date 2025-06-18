// routes/pairing.js
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const activeSessions = new Map();
const MAX_SESSIONS = 5;
const allowedNumbers = ['255765457691', '255700000000'];  // ← update second number here

module.exports = () => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const number = req.query.number;
    const method = req.query.method || 'pair';  // 'pair' or 'qr'

    // Validation
    if (!number)         return res.status(400).json({ error: 'Phone number required' });
    if (!allowedNumbers.includes(number)) return res.status(403).json({ error: 'Number not allowed' });
    if (activeSessions.size >= MAX_SESSIONS && !activeSessions.has(number)) {
      return res.status(429).json({ error: 'Session limit reached' });
    }

    // Initialize client if needed
    if (!activeSessions.has(number)) {
      const client = new Client({
        authStrategy: new LocalAuth({ clientId: number }),
        puppeteer: { headless: true },
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
        }
      });

      client.on('ready', () => console.log(`✅ WhatsApp ready for ${number}`));
      client.on('auth_failure', msg => console.error(`❌ Auth failed (${number}):`, msg));
      client.on('disconnected', reason => {
        console.log(`⚠️ Disconnected ${number}: ${reason}`);
        client.destroy();
        activeSessions.delete(number);
      });

      activeSessions.set(number, client);
      try {
        await client.initialize();
      } catch (e) {
        console.error(`❌ Init failure for ${number}:`, e.message);
        return res.status(500).json({ error: 'Failed to initialize client' });
      }

      // Once initialized, either generate QR or pairing code
      if (method === 'qr') {
        client.once('qr', async qr => {
          const qrImage = await qrcode.toDataURL(qr);
          res.json({ qr: qrImage });
        });
        return;
      }
    }

    // If already initialized or pairing method
    if (method === 'pair') {
      try {
        const client = activeSessions.get(number);
        const code = await client.pairing.generatePairingCode(number);
        return res.json({ pairingCode: code });
      } catch (e) {
        console.error(`❌ Pairing error for ${number}:`, e.message);
        return res.status(500).json({ error: 'Failed to generate pairing code' });
      }
    } else if (method === 'qr') {
      // If client already active but you still want QR
      const client = activeSessions.get(number);
      client.once('qr', async qr => {
        const qrImage = await qrcode.toDataURL(qr);
        res.json({ qr: qrImage });
      });
    } else {
      return res.status(400).json({ error: 'Invalid method' });
    }
  });

  return router;
};
