const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const P = require('pino');
const { Boom } = require('@hapi/boom');

// Save sessions in /session/auth_data/
const sessionFolder = path.join(__dirname, './auth_data');
if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });

/**
 * Starts a WhatsApp socket and returns a pairing code for login
 * @param {string} number - the phone number to create a session for
 * @returns {Promise<string>} - pairing code
 */
async function startSocket(number) {
  return new Promise((resolve, reject) => {
    const sessionFile = path.join(sessionFolder, `${number}.json`);
    const { state, saveState } = useSingleFileAuthState(sessionFile);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: P({ level: 'silent' }),
      browser: ['SAVAGE-XMD', 'Chrome', '1.0.0']
    });

    let resolved = false;

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, pairingCode } = update;

      if (pairingCode && !resolved) {
        resolved = true;
        return resolve(pairingCode);
      }

      if (connection === 'open') {
        console.log(`✅ Connected: ${number}`);
      }

      if (
        connection === 'close' &&
        lastDisconnect &&
        lastDisconnect.error instanceof Boom &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
      ) {
        sock.restart();
      }
    });

    sock.ev.on('creds.update', saveState);

    setTimeout(() => {
      if (!resolved) {
        reject(new Error('⏱️ Timed out waiting for pairing code.'));
      }
    }, 20000); // 20s timeout
  });
}

module.exports = startSocket;
