const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const activeSessions = new Map();
const MAX_SESSIONS = 5;
const allowedNumbers = ['255765457691', '255700000000'];

module.exports = () => {
    const router = express.Router();

    router.get('/pair', async (req, res) => {
        const number = req.query.number;
        const method = req.query.method || 'pair';

        if (!number) return res.status(400).json({ error: 'Phone number required' });
        if (!allowedNumbers.includes(number)) return res.status(403).json({ error: 'Unauthorized number' });
        if (activeSessions.size >= MAX_SESSIONS && !activeSessions.has(number)) {
            return res.status(429).json({ error: 'Max sessions reached' });
        }

        if (!activeSessions.has(number)) {
            const client = new Client({
                authStrategy: new LocalAuth({ clientId: number }),
                puppeteer: { headless: true },
                webVersionCache: {
                    type: 'remote',
                    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
                }
            });

            client.on('ready', () => {
                console.log(`✅ WhatsApp client ready: ${number}`);
            });

            client.on('auth_failure', msg => {
                console.error(`❌ Auth failed (${number}):`, msg);
            });

            client.on('disconnected', reason => {
                console.log(`⚠️ Disconnected ${number}: ${reason}`);
                client.destroy();
                activeSessions.delete(number);
            });

            activeSessions.set(number, client);
            await client.initialize();

            if (method === 'qr') {
                client.once('qr', async qr => {
                    const qrImage = await qrcode.toDataURL(qr);
                    return res.json({ qr: qrImage });
                });
            } else {
                try {
                    const code = await client.pairing.generatePairingCode(number);
                    return res.json({ pairingCode: code });
                } catch (err) {
                    console.error(`❌ Pairing error (${number}):`, err.message);
                    return res.status(500).json({ error: 'Pairing code failed' });
                }
            }
        } else {
            return res.json({ message: 'Client already active. Try reconnecting WhatsApp.' });
        }
    });

    return router;
};
