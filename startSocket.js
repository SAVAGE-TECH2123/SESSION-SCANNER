const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');

const allowedNumbers = [
  '255765457691',
  '255793157892',
  '255745830630',
  '255757858480',
  '255686169965'
];

async function startSocket(method, number = '') {
  if (method === 'pairing' && !allowedNumbers.includes(number)) {
    throw new Error('This number is not allowed for pairing');
  }

  const sessionDir = path.join(__dirname, 'sessions', number || `session-${Date.now()}`);
  fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  return new Promise((resolve, reject) => {
    sock.ev.on('connection.update', (update) => {
      const { qr, pairingCode, connection } = update;

      if (connection === 'open') {
        return resolve({ success: true });
      }

      if (connection === 'close') {
        return reject(new Error('Connection closed'));
      }

      if (method === 'qr' && qr) {
        return resolve({ success: true, qr });
      }

      if (method === 'pairing' && pairingCode) {
        return resolve({ success: true, code: pairingCode });
      }
    });
  });
}

module.exports = startSocket;
