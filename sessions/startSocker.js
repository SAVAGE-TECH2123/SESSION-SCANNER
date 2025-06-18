// sessions/startSocket.js const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys'); const fs = require('fs'); const path = require('path');

async function startSocket(number) { return new Promise((resolve, reject) => { const sessionPath = path.join(__dirname, ${number}.json); const { state, saveState } = useSingleFileAuthState(sessionPath);

const sock = makeWASocket({ auth: state });

sock.ev.on('creds.update', saveState);

sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
  if (qr) {
    console.log(`📲 Scan this QR for ${number}:`, qr);
  }

  if (connection === 'open') {
    console.log(`✅ Session connected for ${number}`);
    resolve();
  }

  if (connection === 'close' && lastDisconnect?.error) {
    console.log(`❌ Disconnected for ${number}:`, lastDisconnect.error);
    reject(lastDisconnect.error);
  }
});

}); }

module.exports = { startSocket };

