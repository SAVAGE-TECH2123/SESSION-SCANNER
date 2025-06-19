const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');

const sessionPath = './session';
if (!existsSync(sessionPath)) mkdirSync(sessionPath);

async function startSocket(number) {
    return new Promise((resolve, reject) => {
        const sessionFile = join(sessionPath, `${number}.json`);
        const { state, saveState } = useSingleFileAuthState(sessionFile);
        
        const sock = makeWASocket({
            auth: state
        });

        sock.ev.on('creds.update', saveState);

        sock.ev.on('connection.update', ({ connection, lastDisconnect, qr, pairingCode }) => {
            if (qr) console.log(`🟡 QR: ${qr}`);
            if (pairingCode) resolve(pairingCode);
            if (connection === 'close') reject(lastDisconnect?.error || new Error('Connection closed'));
        });
    });
}

module.exports = startSocket;
