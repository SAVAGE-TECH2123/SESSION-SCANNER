// pairing.js (inside routes)

const express = require('express'); const { Client, RemoteAuth } = require('whatsapp-web.js'); const { MongoStore } = require('wwebjs-mongo'); const { generateWId } = require('whatsapp-web.js/src/util'); const { default: mongoose } = require('mongoose'); const fs = require('fs'); const path = require('path');

const router = express.Router();

const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/savage-sessions'; mongoose.connect(mongoUrl);

const store = new MongoStore({ mongoose: mongoose });

const clients = new Map();

router.post('/start', async (req, res) => { const { number } = req.body; if (!number) return res.status(400).json({ error: 'Phone number required' });

const sessionId = number;

const client = new Client({
    authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000,
        clientId: sessionId
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

clients.set(sessionId, client);

client.on('qr', qr => {
    const qrPath = path.join(__dirname, `../sessions/${sessionId}.qr`);
    fs.writeFileSync(qrPath, qr);
});

client.on('ready', () => {
    console.log(`Client ${sessionId} is ready.`);
});

client.on('authenticated', () => {
    console.log(`Client ${sessionId} authenticated.`);
});

client.initialize();

res.json({ message: `Pairing session for ${sessionId} started.` });

});

module.exports = router;

