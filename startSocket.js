const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const P = require('pino');

const store = makeInMemoryStore({ logger: P().child({ level: 'silent', stream: 'store' }) });
store.readFromFile('./baileys_store.json');
setInterval(() => {
    store.writeToFile('./baileys_store.json');
}, 10_000);

async function startSocket(phoneNumber, usePairingCode = false) {
    try {
        if (!phoneNumber) throw new Error('⚠️ Phone number is required.');

        const sessionPath = path.join(__dirname, '..', 'sessions', phoneNumber);
        if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();

        const socket = makeWASocket({
            version,
            logger: P({ level: 'silent' }),
            printQRInTerminal: !usePairingCode,
            auth: state,
            browser: ['SAVAGE-XMD', 'Chrome', '1.0.0']
        });

        store.bind(socket.ev);

        socket.ev.on('creds.update', saveCreds);

        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr && !usePairingCode) {
                console.log('📸 Scan this QR Code to connect:', qr);
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`📴 Connection closed. Reconnecting: ${shouldReconnect}`);
                if (shouldReconnect) startSocket(phoneNumber, usePairingCode);
            }

            if (connection === 'open') {
                console.log(`✅ Connected as ${phoneNumber}`);
            }
        });

        // Pairing Code logic
        if (usePairingCode) {
            await socket.waitForConnectionUpdate((u) => !!u.pairingCode);
            const code = socket?.pairingCode;
            if (code) {
                console.log(`🔗 Pairing Code for ${phoneNumber}: ${code}`);
            } else {
                console.log(`❌ Failed to generate pairing code.`);
            }
        }

        return socket;

    } catch (err) {
        console.error('❌ Error in startSocket:', err);
    }
}

module.exports = startSocket;
