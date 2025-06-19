const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, RemoteAuth, LocalAuth, NoAuth } = require('whatsapp-web.js');
const { RemoteAuthHandler } = require('whatsapp-web.js/src/authStrategies/remote');
const { MongoStore } = require('wwebjs-mongo');
const qrcode = require('qrcode-terminal');

const router = express.Router();

router.get('/:number', async (req, res) => {
  const number = req.params.number;

  // Validate number
  if (!/^\d+$/.test(number)) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }

  const sessionPath = path.join(__dirname, '..', 'sessions', `${number}.json`);

  // Remove old session if exists
  if (fs.existsSync(sessionPath)) {
    fs.unlinkSync(sessionPath);
  }

  const client = new Client({
    authStrategy: new NoAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', async qr => {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`;
    res.send(`
      <h2>🤖 SAVAGE-XMD SCANNER</h2>
      <p>Scan this QR code with the WhatsApp account of: <b>${number}</b></p>
      <img src="${qrImageUrl}" alt="QR Code" />
      <p>Session will be saved automatically after pairing.</p>
    `);
  });

  client.on('authenticated', async (session) => {
    fs.writeFileSync(sessionPath, JSON.stringify(session));
    console.log(`✅ Session saved for ${number}`);
  });

  client.on('ready', () => {
    console.log(`Client is ready for ${number}`);
  });

  client.initialize();
});

module.exports = router;
