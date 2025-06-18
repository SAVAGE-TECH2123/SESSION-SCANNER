const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

const activeSessions = new Map(); // to track active clients
const MAX_SESSIONS = 5;
const allowedNumbers = ['255765457691', '255XXXXXXXXX']; // change 2nd number

module.exports = () => {
    const router = express.Router();

    router.get('/pair', async (req, res) => {
        const number = req.query.number;

        if (!number) return res.status(400).json({ error: 'Phone number is required' });
        if (!allowedNumbers.includes(number)) {
            return res.status(403).json({ error: 'Number not allowed' });
        }

        if (activeSessions.size >= MAX_SESSIONS && !activeSessions.has(number)) {
            return res.status(429).json({ error: 'Session limit reached. Try again later.' });
        }

        // If session not active yet, create one
        if (!activeSessions.has(number)) {
            const client = new Client({
                authStrategy: new LocalAuth({ clientId: number }),
                webVersionCache: {
                    type: 'remote',
                    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
                }
            });

            // Client event listeners
            client.on('ready', () => console.log(`✅ WhatsApp client ready for ${number}`));
            client.on('auth_failure', msg => console.error(`❌ Auth failure for ${number}:`, msg));
            client.on('disconnected', reason => {
                console.log(`⚠️ Client disconnected: ${number} — ${reason}`);
                client.destroy();
                activeSessions.delete(number);
            });

            try {
                await client.initialize();
                activeSessions.set(number, client);
            } catch (e) {
                return res.status(500).json({ error: 'Failed to initialize client.' });
            }
        }

        try {
            const client = activeSessions.get(number);
            const code = await client.pairing.generatePairingCode(number);
            res.json({ pairingCode: code });
        } catch (err) {
            console.error(`❌ Error generating code for ${number}:`, err.message);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
