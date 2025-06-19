const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

// Store WhatsApp sessions
const sessions = new Map();

async function startSocket(number) {
  const sessionDir = path.join(__dirname, 'sessions');
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

  const sessionFile = path.join(sessionDir, `${number}.json`);
  const { state, saveState } = useSingleFileAuthState(sessionFile);

  const { version, isLatest } = await fetchLatestBaileysVersion();

  return new Promise((resolve, reject) => {
    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: ['SAVAGE-XMD', 'Safari', '1.0.0']
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('connection.update', (update) => {
      const { connection, qr, pairingCode, lastDisconnect } = update;

      if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
          fs.unlinkSync(sessionFile);
        }
        reject('Connection closed. Try again.');
      }

      if (pairingCode) {
        // Save session instance
        sessions.set(number, sock);
        resolve(pairingCode);
      }

      if (qr) {
        console.log(`📸 QR Code (not used in UI): ${qr}`);
      }
    });
  });
}

module.exports = startSocket;
