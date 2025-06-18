const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');

const path = require('path');
const activeSessions = new Map();
const MAX_SESSIONS = 5;

// ✅ Set your allowed numbers here
const allowedNumbers = ['255765457691', '2557745 830 630']; // Change second one

module.exports = () => {
    const router = express.Router();

    router.get('/pair', async (req, res) => {
        const number = req.query.number;

        if (!number) {
            return res.status(400).json({ error: 'Phone number is required.' });
        }

        if (!allowedNumbers.includes(number)) {
            return res.status(403).json({ error: 'Number not allowed.' });
        }

        if (activeSessions.size >= MAX_SESSIONS && !activeSessions.has(number)) {
            return res.status(429).json({ error: 'Session limit reached.' });
        }

        // Initialize new client if not already active
        if (!activeSessions.has(number)) {
            const client = new Client({
                authStrategy: new LocalAuth({ clientId: number }),
                webVersionCache: {
                    type: 'remote',
                    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
                }
            });

            client.on('ready', () => {
                console.log(`✅ WhatsApp client ready for ${number}`);
            });

            client.on('auth_failure', msg => {
                console.error(`❌ Auth failed for ${number}:`, msg);
            });

            client.on('disconnected', reason => {
                console.log(`⚠️ Disconnected: ${number}, Reason: ${reason}`);
                client.destroy();
                activeSessions.delete(number);
            });

            try {
                await client.initialize();
                activeSessions.set(number, client);
            } catch (err) {
                console.error(`❌ Failed to initialize client: ${err.message}`);
                return res.status(500).json({ error: 'Failed to initialize WhatsApp client.' });
            }
        }

        // Generate pairing code
        try {
            const client = activeSessions.get(number);
            const code = await client.pairing.generatePairingCode(number);
            res.json({ pairingCode: code });
        } catch (err) {
            console.error(`❌ Error generating code for ${number}: ${err.message}`);
            res.status(500).json({ error: 'Failed to generate pairing code.' });
        }
    });

    return router;
};
